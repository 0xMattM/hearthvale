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
  `game-cl723-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/** Content Lock — wood_crate NPC sink. */
const CRATE_SELL = 3;
const CRATE_ITEM: ItemId = "wood_crate";

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

/**
 * CL72.3 — land wood_crate → City vendor sell still green; empty refuse.
 * Choice: assert-only vendor sink (rate already Content Lock) over craft-chain replay.
 */
describe("CityLands CL72.3 land wood_crate City vendor sink still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl723_${Date.now().toString(36)}`,
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

  it("sells land-held crate at City vendor Content Lock rate (happy)", () => {
    expect(getVendorPrices("city").sell.wood_crate).toBe(CRATE_SELL);
    expect(getVendorPrices("player_land").sell.wood_crate).toBe(CRATE_SELL);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    // Reason: land craft path holds crate; sink is City stall (not land vendor).
    addItem(home.playerId, CRATE_ITEM, 1);
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === CRATE_ITEM)
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
      vendorSell(userId, CRATE_ITEM, 1, buildingPos(stall)).ok,
    ).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.softCurrency).toBe(coinsBefore + CRATE_SELL);
    expect(after.inventory.some((s) => s.itemId === CRATE_ITEM)).toBe(false);
  });

  it("keeps crate sell below 2× plank and under stew rate (edge)", () => {
    const city = getVendorPrices("city").sell;
    expect(CRATE_SELL).toBeLessThan((city.plank ?? 0) * 2);
    expect(CRATE_SELL).toBeLessThan(city.stew ?? 99);
    expect(getVendorPrices("explore").sell.wood_crate).toBe(CRATE_SELL);
  });

  it("rejects City crate sell with empty bag (failure)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const state = getPlayerState(userId)!;
    const qty =
      state.inventory.find((s) => s.itemId === CRATE_ITEM)?.qty ?? 0;
    if (qty > 0) removeItem(state.playerId, CRATE_ITEM, qty);

    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === CRATE_ITEM),
    ).toBe(false);

    const result = vendorSell(userId, CRATE_ITEM, 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
