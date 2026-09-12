import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  WORLD,
  getVendorPrices,
  type ItemId,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl753-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/** Content Lock — plank NPC sink (city/land 4; Explore premium 6). */
const PLANK_SELL = 4;
const PLANK_EXPLORE = 6;
const PLANK_ITEM: ItemId = "plank";

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

/**
 * CL75.3 — land plank → City vendor sell + market list still green; empty refuse.
 * Choice: assert-only vendor primary + market edge (rates already Content Lock) over saw replay.
 */
describe("CityLands CL75.3 land plank City vendor / market still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl753_${Date.now().toString(36)}`,
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

  it("sells land-held plank at City vendor Content Lock rate (happy)", () => {
    expect(getVendorPrices("city").sell.plank).toBe(PLANK_SELL);
    expect(getVendorPrices("player_land").sell.plank).toBe(PLANK_SELL);
    expect(getVendorPrices("explore").sell.plank).toBe(PLANK_EXPLORE);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    // Reason: land saw path holds plank; sink is City stall (not land vendor).
    addItem(home.playerId, PLANK_ITEM, 1);
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === PLANK_ITEM)
        ?.qty,
    ).toBe(1);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    expect(stall).toBeTruthy();

    db.update(players)
      .set({ softCurrency: 50 })
      .where(eq(players.userId, userId))
      .run();
    const coinsBefore = getPlayerState(userId)!.softCurrency;

    expect(vendorSell(userId, PLANK_ITEM, 1, buildingPos(stall)).ok).toBe(
      true,
    );
    const after = getPlayerState(userId)!;
    expect(after.softCurrency).toBe(coinsBefore + PLANK_SELL);
    expect(after.inventory.some((s) => s.itemId === PLANK_ITEM)).toBe(false);
  });

  it("lists a land-held plank on City market (edge)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    addItem(home.playerId, PLANK_ITEM, 1);
    db.update(players)
      .set({ softCurrency: 100 })
      .where(eq(players.userId, userId))
      .run();

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(createMarketListing(userId, PLANK_ITEM, 1, 8).ok).toBe(true);
    const board = listMarket(userId);
    expect(board.some((l) => l.itemId === PLANK_ITEM && l.mine)).toBe(true);
  });

  it("keeps City plank sell below Explore premium (edge)", () => {
    expect(PLANK_SELL).toBeLessThan(PLANK_EXPLORE);
    expect(PLANK_SELL).toBe((getVendorPrices("city").sell.wood ?? 0) * 2);
  });

  it("rejects City plank sell with empty bag (failure)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const state = getPlayerState(userId)!;
    const qty =
      state.inventory.find((s) => s.itemId === PLANK_ITEM)?.qty ?? 0;
    if (qty > 0) removeItem(state.playerId, PLANK_ITEM, qty);

    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === PLANK_ITEM),
    ).toBe(false);

    const result = vendorSell(userId, PLANK_ITEM, 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
