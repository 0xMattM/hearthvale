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
  `game-cl883-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock — flour NPC sink (city/land 5; Explore regional 3). */
const FLOUR_SELL = 5;
const FLOUR_EXPLORE = 3;
const FLOUR_ITEM: ItemId = "flour";

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

/**
 * CL88.3 — land flour → City vendor sell still green; empty refuse.
 * Choice: assert-only vendor sink (parity with CL75.1; no Content Lock retune).
 */
describe("CityLands CL88.3 land flour City vendor sink still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl883_${Date.now().toString(36)}`,
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

  it("sells land-held flour at City vendor Content Lock rate (happy)", () => {
    expect(getVendorPrices("city").sell.flour).toBe(FLOUR_SELL);
    expect(getVendorPrices("player_land").sell.flour).toBe(FLOUR_SELL);
    expect(getVendorPrices("explore").sell.flour).toBe(FLOUR_EXPLORE);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    // Reason: land mill path holds flour; sink is City stall (not land vendor).
    addItem(home.playerId, FLOUR_ITEM, 1);
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === FLOUR_ITEM)
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

    expect(
      vendorSell(userId, FLOUR_ITEM, 1, buildingPos(stall)).ok,
    ).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.softCurrency).toBe(coinsBefore + FLOUR_SELL);
    expect(after.inventory.some((s) => s.itemId === FLOUR_ITEM)).toBe(false);
  });

  it("keeps City flour sell above Explore regional rate (edge)", () => {
    expect(FLOUR_SELL).toBeGreaterThan(FLOUR_EXPLORE);
    expect(FLOUR_SELL).toBe(getVendorPrices("city").sell.stew);
  });

  it("rejects City flour sell with empty bag (failure)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const state = getPlayerState(userId)!;
    const qty =
      state.inventory.find((s) => s.itemId === FLOUR_ITEM)?.qty ?? 0;
    if (qty > 0) removeItem(state.playerId, FLOUR_ITEM, qty);

    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === FLOUR_ITEM),
    ).toBe(false);

    const result = vendorSell(userId, FLOUR_ITEM, 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
