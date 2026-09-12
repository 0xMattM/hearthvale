import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl573-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { createMarketListing, listMarket } = await import(
  "../../apps/server/src/game/actions/market.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock / CL51.1 — cooked fish NPC buyback holds through CL57.3. */
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

describe("CityLands CL57.3 cooked_fish market list smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl573_${Date.now().toString(36)}`,
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

  it("cooks fish on land then lists cooked_fish on City market (happy)", () => {
    const recipe = getRecipe("cook_fish")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.station).toBe("kitchen");
    expect(recipe.minProfessionXp ?? 0).toBe(0);
    expect(getVendorPrices("city").sell.cooked_fish).toBe(COOKED_FISH_SELL);

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
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "iron_ore", 1);
    addItem(home.playerId, "fish", 1);

    const leftoverCooked = home.inventory
      .filter((s) => s.itemId === "cooked_fish")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverCooked > 0)
      removeItem(home.playerId, "cooked_fish", leftoverCooked);

    expect(placeLandStation(userId, "kitchen", boardPos(home)).ok).toBe(true);
    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    expect(kitchen).toBeTruthy();

    const cookBefore = land.cookXp;
    expect(craftRecipeComplete(userId, "cook_fish", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const afterCook = getPlayerState(userId)!;
    expect(afterCook.cookXp).toBeGreaterThan(cookBefore);
    expect(
      afterCook.inventory.some(
        (s) => s.itemId === "cooked_fish" && s.qty >= 1,
      ),
    ).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(createMarketListing(userId, "cooked_fish", 1, 6).ok).toBe(true);
    const board = listMarket(userId);
    expect(
      board.some((l) => l.itemId === "cooked_fish" && l.mine),
    ).toBe(true);
  });

  it("keeps cooked_fish NPC rate above fish and under stew (edge)", () => {
    expect(getVendorPrices("city").sell.cooked_fish!).toBe(COOKED_FISH_SELL);
    expect(getVendorPrices("city").sell.cooked_fish!).toBeGreaterThan(
      getVendorPrices("city").sell.fish!,
    );
    expect(getVendorPrices("city").sell.cooked_fish!).toBeLessThan(
      getVendorPrices("city").sell.stew!,
    );
  });

  it("refuses City market list with empty cooked_fish bag (failure)", () => {
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const qty =
      city.inventory.find((s) => s.itemId === "cooked_fish")?.qty ?? 0;
    expect(qty).toBe(0);

    const result = createMarketListing(userId, "cooked_fish", 1, 6);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
