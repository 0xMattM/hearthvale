import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  ENERGY,
  FOOD_RESTORE,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl483-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem, removeItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { craftRecipeComplete, eatFood } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
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

describe("CityLands CL48.3 land mill→bake→pack_travel_ration chain", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl483_${Date.now().toString(36)}`,
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

  it("mills flour, bakes bread, packs ration on land kitchen, eats energy (happy)", () => {
    const millRecipe = getRecipe("mill_flour")!;
    const breadRecipe = getRecipe("bake_bread")!;
    const rationRecipe = getRecipe("pack_travel_ration")!;
    expect(millRecipe.profession).toBe("farmer");
    expect(millRecipe.station).toBe("mill");
    expect(breadRecipe.profession).toBe("cook");
    expect(breadRecipe.station).toBe("kitchen");
    expect(rationRecipe.profession).toBe("cook");
    expect(rationRecipe.station).toBe("kitchen");
    expect(rationRecipe.minProfessionXp).toBe(25);
    expect(FOOD_RESTORE.travel_ration).toBe(ENERGY.rationRestore);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        // Reason: mill gated; kitchen ungated; pack_travel_ration gates cook XP ≥ 25.
        builderXp: BUILDER_PLACE_XP,
        cookXp: 25,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "iron_bar", 1);
    addItem(home.playerId, "iron_ore", 1);
    addItem(home.playerId, "wheat", 4);
    addItem(home.playerId, "raw_meat", 1);

    const pos = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "mill", pos).ok).toBe(true);
    expect(placeLandStation(userId, "kitchen", pos).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const mill = land.buildings.find((b) => b.type === "mill")!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    expect(mill).toBeTruthy();
    expect(kitchen).toBeTruthy();

    const farmerBefore = land.farmerXp;
    const cookBefore = land.cookXp;

    expect(craftRecipeComplete(userId, "mill_flour", buildingPos(mill)).ok).toBe(true);
    expect(craftRecipeComplete(userId, "mill_flour", buildingPos(mill)).ok).toBe(true);
    const afterMill = getPlayerState(userId)!;
    expect(afterMill.farmerXp).toBeGreaterThan(farmerBefore);
    expect(afterMill.cookXp).toBe(cookBefore);
    expect(
      afterMill.inventory.some((s) => s.itemId === "flour" && s.qty >= 2),
    ).toBe(true);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterMill.playerId))
      .run();
    expect(craftRecipeComplete(userId, "bake_bread", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const afterBake = getPlayerState(userId)!;
    expect(afterBake.cookXp).toBeGreaterThan(cookBefore);
    expect(
      afterBake.inventory.some((s) => s.itemId === "bread" && s.qty >= 1),
    ).toBe(true);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterBake.playerId))
      .run();
    const cookMid = afterBake.cookXp;
    expect(craftRecipeComplete(userId, "cook_meat", buildingPos(kitchen)).ok).toBe(
      true,
    );
    expect(
      craftRecipeComplete(userId, "pack_travel_ration", buildingPos(kitchen)).ok,
    ).toBe(true);
    const afterPack = getPlayerState(userId)!;
    expect(afterPack.cookXp).toBeGreaterThan(cookMid);
    expect(afterPack.farmerXp).toBe(afterMill.farmerXp);
    expect(
      afterPack.inventory.some(
        (s) => s.itemId === "travel_ration" && s.qty >= 1,
      ),
    ).toBe(true);

    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, afterPack.playerId))
      .run();
    const beforeEat = getPlayerState(userId)!;
    const cookAtEat = beforeEat.cookXp;
    expect(eatFood(userId, "travel_ration").ok).toBe(true);
    const afterEat = getPlayerState(userId)!;
    expect(afterEat.energy).toBe(
      Math.min(afterEat.maxEnergy, 10 + ENERGY.rationRestore),
    );
    expect(afterEat.cookXp).toBe(cookAtEat);
    expect(afterEat.inventory.some((s) => s.itemId === "travel_ration")).toBe(
      false,
    );
  });

  it("keeps pack_travel_ration as cook kitchen craft with bread+meat (edge)", () => {
    const recipe = getRecipe("pack_travel_ration")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.station).toBe("kitchen");
    expect(recipe.inputs.map((i) => i.itemId).sort()).toEqual([
      "bread",
      "cooked_meat",
    ]);
    const land = getPlayerState(userId)!;
    expect(land.buildings.some((b) => b.type === "mill")).toBe(true);
    expect(land.buildings.some((b) => b.type === "kitchen")).toBe(true);
  });

  it("rejects pack_travel_ration without materials (failure)", () => {
    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ cookXp: 25, energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    for (const id of ["bread", "cooked_meat", "travel_ration"] as const) {
      const qty =
        getPlayerState(userId)!.inventory.find((s) => s.itemId === id)?.qty ??
        0;
      if (qty > 0) removeItem(land.playerId, id, qty);
    }

    const result = craftRecipeComplete(
      userId,
      "pack_travel_ration",
      buildingPos(kitchen),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
