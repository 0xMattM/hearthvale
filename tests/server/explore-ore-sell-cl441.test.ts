import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  EXPLORE_VENDOR_PREMIUM_SELL_ITEMS,
  WORLD,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl441-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState, addItem, removeItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { gatherOre } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function equipHammer(uid: string) {
  const pid = db.select().from(players).where(eq(players.userId, uid)).get()!.id;
  addItem(pid, "iron_hammer", 1);
  const hammer = getPlayerState(uid)!.inventory.find(
    (i) => i.itemId === "iron_hammer",
  )!;
  db.update(players)
    .set({ equippedToolInventoryId: hammer.id })
    .where(eq(players.id, pid))
    .run();
}

describe("CityLands CL44.1 Explore ore chip → premium sell e2e", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl441_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("chips Explore ore_node then sells iron_ore at Explore premium over City (happy)", () => {
    const cityRate = getVendorPrices("city").sell.iron_ore!;
    const exploreRate = getVendorPrices("explore").sell.iron_ore!;
    expect(exploreRate).toBeGreaterThan(cityRate);
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain("iron_ore");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.landKind).toBe("explore");
    const node = explore.buildings.find((b) => b.type === "ore_node")!;
    expect(node).toBeTruthy();
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    // Reason: e2e asserts live chip→sell — clear starter + leftover ore first.
    const leftover =
      explore.inventory
        .filter((s) => s.itemId === "iron_ore")
        .reduce((n, s) => n + s.qty, 0) ?? 0;
    if (leftover > 0) removeItem(explore.playerId, "iron_ore", leftover);

    equipHammer(userId);
    const minerBefore = getPlayerState(userId)!.minerXp;
    expect(gatherOre(userId, node.id, buildingPos(node)).ok).toBe(true);
    const afterChip = getPlayerState(userId)!;
    expect(afterChip.inventory.some((s) => s.itemId === "iron_ore")).toBe(true);
    expect(afterChip.minerXp).toBeGreaterThan(minerBefore);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "iron_ore", 1, buildingPos(stall)).ok).toBe(true);
    const afterSell = getPlayerState(userId)!;
    expect(afterSell.softCurrency).toBe(coinsBefore + cityRate);
  });

  it("keeps City/Land iron_ore sell below Explore rate (city contrast edge)", () => {
    const cityRate = getVendorPrices("city").sell.iron_ore!;
    const exploreRate = getVendorPrices("explore").sell.iron_ore!;
    const landRate = getVendorPrices("player_land").sell.iron_ore!;
    expect(exploreRate).toBeGreaterThan(cityRate);
    expect(exploreRate).toBeGreaterThan(landRate);
    expect(cityRate).toBe(landRate);
  });

  it("refuses Explore iron_ore sell with empty bag (failure)", () => {
    const state = getPlayerState(userId)!;
    if (state.landKind !== "explore") {
      expect(travelToLandKind(userId, "explore").ok).toBe(true);
    }
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    const result = vendorSell(userId, "iron_ore", 1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.needsStation("vendor stall"));
    }
  });
});
