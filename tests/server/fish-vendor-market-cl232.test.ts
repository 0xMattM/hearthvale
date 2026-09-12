import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  MARKET,
  WORLD,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl232-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { createMarketListing, listMarket } = await import(
  "../../apps/server/src/game/actions/market.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function playerId(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!.id;
}

describe("CityLands CL23.2 fish vendor/market sink", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl232_${Date.now().toString(36)}`, "password123");
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

  it("sells fish at city vendor and lists fish on market (happy)", () => {
    expect(getVendorPrices("city").sell.fish).toBe(2);
    expect(getVendorPrices("explore").sell.fish).toBe(2);
    expect(getVendorPrices("player_land").sell.fish).toBe(2);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(stall).toBeTruthy();

    const pid = playerId(userId);
    addItem(pid, "fish", 2);
    db.update(players)
      .set({ softCurrency: 40 })
      .where(eq(players.userId, userId))
      .run();

    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "fish", 1, buildingPos(stall)).ok).toBe(true);
    const afterSell = getPlayerState(userId)!;
    expect(afterSell.softCurrency).toBe(coinsBefore + 2);
    expect(
      afterSell.inventory.some((s) => s.itemId === "fish" && s.qty === 1),
    ).toBe(true);

    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 5 })
      .where(eq(players.userId, userId))
      .run();
    const listed = createMarketListing(userId, "fish", 1, 4);
    expect(listed.ok).toBe(true);
    expect(listMarket(userId).some((l) => l.itemId === "fish" && l.mine)).toBe(
      true,
    );
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === "fish"),
    ).toBe(false);
  });

  it("keeps explore fish book with no forest stall (edge)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    expect(getVendorPrices("explore").sell.fish).toBe(2);
  });

  it("rejects fish sell with empty bag (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const result = vendorSell(userId, "fish", 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
