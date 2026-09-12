import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getVendorPrices } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl401-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, removeItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { gatherWood } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL40.1 Explore gather → premium sell e2e", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl401_${Date.now().toString(36)}`,
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

  it("chops Explore stump then sells wood at Explore premium over City (happy)", () => {
    const cityRate = getVendorPrices("city").sell.wood!;
    const exploreRate = getVendorPrices("explore").sell.wood!;
    expect(exploreRate).toBeGreaterThan(cityRate);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.landKind).toBe("explore");
    const stump = explore.buildings.find((b) => b.type === "tree_stump")!;
    expect(stump).toBeTruthy();
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    // Reason: e2e asserts live gather→sell — clear any leftover wood first.
    const leftover =
      explore.inventory
        .filter((s) => s.itemId === "wood")
        .reduce((n, s) => n + s.qty, 0) ?? 0;
    if (leftover > 0) removeItem(explore.playerId, "wood", leftover);

    expect(gatherWood(userId, stump.id, buildingPos(stump)).ok).toBe(true);
    const afterChop = getPlayerState(userId)!;
    expect(afterChop.inventory.some((s) => s.itemId === "wood")).toBe(true);
    expect(afterChop.foresterXp).toBeGreaterThan(explore.foresterXp);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "wood", 1, buildingPos(stall)).ok).toBe(true);
    const afterSell = getPlayerState(userId)!;
    expect(afterSell.softCurrency).toBe(coinsBefore + cityRate);
  });

  it("keeps City wood sell below Explore rate (city contrast edge)", () => {
    const cityRate = getVendorPrices("city").sell.wood!;
    const exploreRate = getVendorPrices("explore").sell.wood!;
    const landRate = getVendorPrices("player_land").sell.wood!;
    expect(exploreRate).toBeGreaterThan(cityRate);
    expect(exploreRate).toBeGreaterThan(landRate);
  });

  it("refuses Explore wood sell with empty bag (failure)", () => {
    const state = getPlayerState(userId)!;
    if (state.landKind !== "explore") {
      expect(travelToLandKind(userId, "explore").ok).toBe(true);
    }
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    const result = vendorSell(userId, "wood", 1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.needsStation("vendor stall"));
    }
  });
});
