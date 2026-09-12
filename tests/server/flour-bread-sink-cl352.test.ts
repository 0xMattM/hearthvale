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
  `game-cl352-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { createMarketListing, listMarket } = await import(
  "../../apps/server/src/game/actions/market.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock — flour NPC buyback (city/land 5; Explore regional discount 3). */
const FLOUR_SELL_CITY_LAND = 5;
const FLOUR_SELL_EXPLORE = 3;

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function playerId(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!.id;
}

describe("CityLands CL35.2 flour / bread vendor or market sink", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl352_${Date.now().toString(36)}`, "password123");
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

  it("sells flour at Content Lock rates and lists bread on market (happy)", () => {
    expect(getVendorPrices("city").sell.flour).toBe(FLOUR_SELL_CITY_LAND);
    expect(getVendorPrices("player_land").sell.flour).toBe(
      FLOUR_SELL_CITY_LAND,
    );
    expect(getVendorPrices("explore").sell.flour).toBe(FLOUR_SELL_EXPLORE);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(stall).toBeTruthy();
    expect(city.buildings.some((b) => b.type === "market_board")).toBe(true);

    const pid = playerId(userId);
    addItem(pid, "flour", 2);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins * 2 + 20 })
      .where(eq(players.userId, userId))
      .run();

    const qtyOf = (itemId: string) =>
      getPlayerState(userId)!.inventory.find((s) => s.itemId === itemId)?.qty ??
      0;

    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "flour", 1, buildingPos(stall)).ok).toBe(true);
    const afterSell = getPlayerState(userId)!;
    expect(afterSell.softCurrency).toBe(coinsBefore + FLOUR_SELL_CITY_LAND);
    expect(qtyOf("flour")).toBe(1);

    // Bread lists on player market (CL35.2); NPC sell added later in CL47.3 @ 3c.
    // Starter pack already grants bread — list one and assert escrow qty drop.
    const breadBefore = qtyOf("bread");
    expect(breadBefore).toBeGreaterThanOrEqual(1);
    expect(createMarketListing(userId, "bread", 1, 6).ok).toBe(true);
    expect(
      listMarket(userId).some((l) => l.itemId === "bread" && l.mine),
    ).toBe(true);
    expect(qtyOf("bread")).toBe(breadBefore - 1);

    // Flour also lists (stackable craft mat sink).
    expect(createMarketListing(userId, "flour", 1, 4).ok).toBe(true);
    expect(
      listMarket(userId).some((l) => l.itemId === "flour" && l.mine),
    ).toBe(true);
    expect(qtyOf("flour")).toBe(0);
  });

  it("keeps explore flour book cheaper with no forest stall (edge)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    expect(getVendorPrices("explore").sell.flour).toBe(FLOUR_SELL_EXPLORE);
  });

  it("rejects flour sell with empty bag (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const pid = playerId(userId);
    const leftover =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "flour")
        ?.qty ?? 0;
    if (leftover > 0) removeItem(pid, "flour", leftover);
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === "flour"),
    ).toBe(false);
    const result = vendorSell(userId, "flour", 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
