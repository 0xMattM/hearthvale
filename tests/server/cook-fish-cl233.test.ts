import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ENERGY,
  FOOD_RESTORE,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl233-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { craftRecipeComplete, eatFood } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function playerId(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!.id;
}

describe("CityLands CL23.3 cook fish recipe", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl233_${Date.now().toString(36)}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    ensureStarterYardBuildings(getPlayerState(userId)!.landId);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("cooks fish at kitchen for cook XP and edible (happy)", () => {
    const recipe = getRecipe("cook_fish")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.station).toBe("kitchen");
    expect(recipe.output.itemId).toBe("cooked_fish");
    expect(FOOD_RESTORE.cooked_fish).toBe(ENERGY.cookedFishRestore);

    const state = getPlayerState(userId)!;
    const kitchen = state.buildings.find((b) => b.type === "kitchen")!;
    expect(kitchen).toBeTruthy();
    const pid = playerId(userId);
    addItem(pid, "fish", 1);
    const cookBefore = getPlayerState(userId)!.cookXp;
    const fisherBefore = getPlayerState(userId)!.fisherXp;

    expect(craftRecipeComplete(userId, "cook_fish", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const after = getPlayerState(userId)!;
    expect(after.cookXp).toBe(cookBefore + 8);
    expect(after.fisherXp).toBe(fisherBefore);
    expect(
      after.inventory.some((s) => s.itemId === "cooked_fish" && s.qty >= 1),
    ).toBe(true);
    expect(after.inventory.some((s) => s.itemId === "fish")).toBe(false);

    db.update(players).set({ energy: 10 }).where(eq(players.id, pid)).run();
    const beforeEnergy = getPlayerState(userId)!.energy;
    expect(eatFood(userId, "cooked_fish").ok).toBe(true);
    expect(getPlayerState(userId)!.energy).toBe(
      Math.min(
        getPlayerState(userId)!.maxEnergy,
        beforeEnergy + ENERGY.cookedFishRestore,
      ),
    );
  });

  it("keeps cook_fish as cook craft not alchemy (edge)", () => {
    const recipe = getRecipe("cook_fish")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.minProfessionXp).toBe(0);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const cityKitchen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    expect(cityKitchen).toBeTruthy();
    addItem(playerId(userId), "fish", 1);
    const cookBefore = getPlayerState(userId)!.cookXp;
    expect(
      craftRecipeComplete(userId, "cook_fish", buildingPos(cityKitchen)).ok,
    ).toBe(true);
    expect(getPlayerState(userId)!.cookXp).toBeGreaterThan(cookBefore);
  });

  it("rejects cook_fish without fish (failure)", () => {
    const kitchen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    const result = craftRecipeComplete(userId, "cook_fish", buildingPos(kitchen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
