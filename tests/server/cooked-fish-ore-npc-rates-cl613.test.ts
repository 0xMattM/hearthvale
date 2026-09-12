import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getVendorPrices } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl613-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock — CL51.1 / CL44.1–CL56.2 rates hold after CL56–CL57. */
const COOKED_FISH_SELL = 4;
const CITY_ORE_SELL = 1;
const EXPLORE_ORE_SELL = 2;

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

/**
 * CL61.3 — Cooked_fish / ore NPC rates still green.
 * Choice: assert-only Content Lock rates + empty-bag refuse (no invent new SKUs).
 */
describe("CityLands CL61.3 cooked_fish / ore NPC rates still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl613_${Date.now().toString(36)}`,
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

  it("keeps cooked_fish and iron_ore NPC sell rates (happy)", () => {
    const city = getVendorPrices("city").sell;
    const explore = getVendorPrices("explore").sell;
    const land = getVendorPrices("player_land").sell;

    expect(city.cooked_fish).toBe(COOKED_FISH_SELL);
    expect(explore.cooked_fish).toBe(COOKED_FISH_SELL);
    expect(land.cooked_fish).toBe(COOKED_FISH_SELL);
    expect(city.cooked_fish!).toBeGreaterThan(city.fish!);
    expect(city.cooked_fish!).toBeLessThan(city.stew!);

    expect(city.iron_ore).toBe(CITY_ORE_SELL);
    expect(land.iron_ore).toBe(CITY_ORE_SELL);
    expect(explore.iron_ore).toBe(EXPLORE_ORE_SELL);
    expect(explore.iron_ore!).toBeGreaterThan(city.iron_ore!);
    // Reason: bars stay craft hold — no invent NPC rate after CL56.2.
    expect(city.iron_bar).toBeUndefined();
  });

  it("refuses City vendor sell with empty cooked_fish / ore bag (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const stall = state.buildings.find((b) => b.type === "vendor_stall")!;
    expect(stall).toBeTruthy();

    for (const id of ["cooked_fish", "iron_ore"] as const) {
      const qty = state.inventory
        .filter((s) => s.itemId === id)
        .reduce((n, s) => n + s.qty, 0);
      if (qty > 0) removeItem(state.playerId, id, qty);
    }
    db.update(players)
      .set({ softCurrency: 10 })
      .where(eq(players.id, state.playerId))
      .run();

    const emptyFish = vendorSell(
      userId,
      "cooked_fish",
      1,
      buildingPos(stall),
    );
    expect(emptyFish.ok).toBe(false);
    if (!emptyFish.ok) {
      expect(emptyFish.error).toBe(ACTION_ERROR.notEnoughItems);
    }

    const emptyOre = vendorSell(userId, "iron_ore", 1, buildingPos(stall));
    expect(emptyOre.ok).toBe(false);
    if (!emptyOre.ok) {
      expect(emptyOre.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
