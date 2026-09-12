import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  FISHING_DOCK,
  WORLD,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl842-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { gatherFish } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock / CL51.1 — cooked fish NPC buyback. */
const COOKED_FISH_SELL = 4;

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

/**
 * CL84.2 — land cook_fish → City vendor sell still green; empty refuse.
 * Choice: assert-only fidelity (parity with CL51.1; no Content Lock retune).
 */
describe("CityLands CL84.2 land cooked_fish City vendor sink still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl842_${Date.now().toString(36)}`,
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

  it("catches and cooks on land then sells cooked_fish at City vendor (happy)", () => {
    const recipe = getRecipe("cook_fish")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.station).toBe("kitchen");
    expect(getVendorPrices("city").sell.cooked_fish).toBe(COOKED_FISH_SELL);
    expect(getVendorPrices("player_land").sell.cooked_fish).toBe(
      COOKED_FISH_SELL,
    );
    expect(getVendorPrices("explore").sell.cooked_fish).toBe(COOKED_FISH_SELL);
    // Reason: raw fish path stays open; cooked sits above it.
    expect(getVendorPrices("city").sell.fish).toBe(2);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 12);
    addItem(home.playerId, "plank", 4);
    addItem(home.playerId, "iron_ore", 1);

    const atBoard = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "fishing_dock", atBoard).ok).toBe(true);
    expect(placeLandStation(userId, "kitchen", atBoard).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const dock = land.buildings.find((b) => b.type === "fishing_dock")!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    expect(dock).toBeTruthy();
    expect(kitchen).toBeTruthy();

    // Reason: e2e asserts live catch→cook→sell — clear leftovers first.
    const leftoverFish = land.inventory
      .filter((s) => s.itemId === "fish")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverFish > 0) removeItem(land.playerId, "fish", leftoverFish);
    const leftoverCooked = land.inventory
      .filter((s) => s.itemId === "cooked_fish")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverCooked > 0)
      removeItem(land.playerId, "cooked_fish", leftoverCooked);

    const fisherBefore = land.fisherXp;
    const cookBefore = land.cookXp;
    expect(gatherFish(userId, dock.id, buildingPos(dock)).ok).toBe(true);
    const afterCatch = getPlayerState(userId)!;
    expect(afterCatch.fisherXp).toBe(fisherBefore + FISHING_DOCK.xp);
    expect(
      afterCatch.inventory.some((s) => s.itemId === "fish" && s.qty >= 1),
    ).toBe(true);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterCatch.playerId))
      .run();
    expect(craftRecipeComplete(userId, "cook_fish", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const afterCook = getPlayerState(userId)!;
    expect(afterCook.cookXp).toBeGreaterThan(cookBefore);
    expect(afterCook.fisherXp).toBe(afterCatch.fisherXp);
    expect(
      afterCook.inventory.some(
        (s) => s.itemId === "cooked_fish" && s.qty >= 1,
      ),
    ).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(stall).toBeTruthy();
    db.update(players)
      .set({ softCurrency: 40 })
      .where(eq(players.id, city.playerId))
      .run();
    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(
      vendorSell(userId, "cooked_fish", 1, buildingPos(stall)).ok,
    ).toBe(true);
    const afterSell = getPlayerState(userId)!;
    expect(afterSell.softCurrency).toBe(coinsBefore + COOKED_FISH_SELL);
    expect(afterSell.inventory.some((s) => s.itemId === "cooked_fish")).toBe(
      false,
    );
  });

  it("keeps cooked_fish sell above raw fish and under stew (edge)", () => {
    expect(getVendorPrices("city").sell.cooked_fish!).toBeGreaterThan(
      getVendorPrices("city").sell.fish!,
    );
    expect(getVendorPrices("city").sell.cooked_fish!).toBeLessThan(
      getVendorPrices("city").sell.stew!,
    );
  });

  it("refuses City vendor sell with empty cooked_fish bag (failure)", () => {
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    const qty =
      city.inventory.find((s) => s.itemId === "cooked_fish")?.qty ?? 0;
    expect(qty).toBe(0);

    const result = vendorSell(
      userId,
      "cooked_fish",
      1,
      buildingPos(stall),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
