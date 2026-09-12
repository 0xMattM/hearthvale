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
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl471-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { gatherFish } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
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

describe("CityLands CL47.1 land dock fish → kitchen cook_fish", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl471_${Date.now().toString(36)}`,
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

  it("catches on land dock then cooks fish on land kitchen with cook XP (happy)", () => {
    const recipe = getRecipe("cook_fish")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.station).toBe("kitchen");
    expect(recipe.inputs.some((i) => i.itemId === "fish")).toBe(true);

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

    // Reason: e2e asserts live catch→cook — clear leftover fish first.
    const leftoverFish = land.inventory
      .filter((s) => s.itemId === "fish")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverFish > 0) removeItem(land.playerId, "fish", leftoverFish);

    const fisherBefore = land.fisherXp;
    const cookBefore = land.cookXp;
    expect(gatherFish(userId, dock.id, buildingPos(dock)).ok).toBe(true);
    const afterCatch = getPlayerState(userId)!;
    expect(afterCatch.fisherXp).toBe(fisherBefore + FISHING_DOCK.xp);
    expect(afterCatch.cookXp).toBe(cookBefore);
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
  });

  it("keeps cook_fish as cook craft not fisher (edge)", () => {
    const recipe = getRecipe("cook_fish")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.profession).not.toBe("fisher");
    const land = getPlayerState(userId)!;
    expect(land.buildings.some((b) => b.type === "fishing_dock")).toBe(true);
    expect(land.buildings.some((b) => b.type === "kitchen")).toBe(true);
  });

  it("rejects land cook_fish without fish (failure)", () => {
    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    const fishQty = land.inventory
      .filter((s) => s.itemId === "fish")
      .reduce((n, s) => n + s.qty, 0);
    if (fishQty > 0) removeItem(land.playerId, "fish", fishQty);

    const result = craftRecipeComplete(userId, "cook_fish", buildingPos(kitchen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
