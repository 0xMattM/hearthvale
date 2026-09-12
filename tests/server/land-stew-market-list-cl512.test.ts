import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  WORLD,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl512-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

describe("CityLands CL51.2 land stew → City market list smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl512_${Date.now().toString(36)}`,
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

  it("cooks stew on land kitchen then lists on City market (happy)", () => {
    const recipe = getRecipe("cook_stew")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.station).toBe("kitchen");
    expect(recipe.minProfessionXp).toBe(15);
    // Reason: stew already has NPC buyback; CL51.2 asserts market list outlet.
    expect(getVendorPrices("city").sell.stew).toBe(5);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        cookXp: 15,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "iron_ore", 1);
    addItem(home.playerId, "flour", 1);
    addItem(home.playerId, "raw_meat", 1);

    const leftoverStew = home.inventory
      .filter((s) => s.itemId === "stew")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverStew > 0) removeItem(home.playerId, "stew", leftoverStew);

    const pos = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "kitchen", pos).ok).toBe(true);
    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    expect(kitchen).toBeTruthy();

    const cookBefore = land.cookXp;
    expect(craftRecipeComplete(userId, "cook_stew", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const afterCook = getPlayerState(userId)!;
    expect(afterCook.cookXp).toBeGreaterThan(cookBefore);
    expect(
      afterCook.inventory.some((s) => s.itemId === "stew" && s.qty >= 1),
    ).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(createMarketListing(userId, "stew", 1, 7).ok).toBe(true);
    const board = listMarket(userId);
    expect(board.some((l) => l.itemId === "stew" && l.mine)).toBe(true);
  });

  it("keeps cook_stew gated below cook XP 15 (edge)", () => {
    expect(getRecipe("cook_stew")!.minProfessionXp).toBe(15);
    expect(getRecipe("cook_fish")!.minProfessionXp).toBe(0);
  });

  it("refuses City market list with empty stew bag (failure)", () => {
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const qty = city.inventory.find((s) => s.itemId === "stew")?.qty ?? 0;
    expect(qty).toBe(0);

    const result = createMarketListing(userId, "stew", 1, 7);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
