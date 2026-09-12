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
  `game-cl671-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/**
 * CL67.1 — land pack_travel_ration → eat energy restore; cook XP gate refuse.
 * Choice: assert-only land kitchen craft→eat (gate already Content Lock) over retuning.
 */
describe("CityLands CL67.1 travel ration craft → energy eat smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl671_${Date.now().toString(36)}`,
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

  it("packs travel_ration on land kitchen then eats for energy (happy)", () => {
    const recipe = getRecipe("pack_travel_ration")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.station).toBe("kitchen");
    expect(recipe.output.itemId).toBe("travel_ration");
    expect(recipe.minProfessionXp).toBe(25);
    expect(FOOD_RESTORE.travel_ration).toBe(ENERGY.rationRestore);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
        cookXp: 25,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 4);
    addItem(home.playerId, "iron_ore", 1);

    const pos = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "kitchen", pos).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    expect(kitchen).toBeTruthy();

    for (const id of ["bread", "cooked_meat", "travel_ration"] as const) {
      const qty =
        land.inventory.find((s) => s.itemId === id)?.qty ?? 0;
      if (qty > 0) removeItem(land.playerId, id, qty);
    }
    addItem(land.playerId, "bread", 1);
    addItem(land.playerId, "cooked_meat", 1);
    const cookBefore = getPlayerState(userId)!.cookXp;

    expect(
      craftRecipeComplete(userId, "pack_travel_ration", buildingPos(kitchen)).ok,
    ).toBe(true);
    const afterCraft = getPlayerState(userId)!;
    expect(afterCraft.cookXp).toBe(cookBefore + 8);
    expect(
      afterCraft.inventory.some(
        (s) => s.itemId === "travel_ration" && s.qty >= 1,
      ),
    ).toBe(true);

    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, afterCraft.playerId))
      .run();
    const beforeEat = getPlayerState(userId)!;
    const health = beforeEat.health;
    const damage = beforeEat.damage;
    const defense = beforeEat.defense;
    const cookXp = beforeEat.cookXp;

    expect(eatFood(userId, "travel_ration").ok).toBe(true);
    const afterEat = getPlayerState(userId)!;
    expect(afterEat.energy).toBe(
      Math.min(afterEat.maxEnergy, 10 + ENERGY.rationRestore),
    );
    expect(afterEat.inventory.some((s) => s.itemId === "travel_ration")).toBe(
      false,
    );
    // Reason: ration is energy food only — not fare and not combat buff.
    expect(afterEat.cookXp).toBe(cookXp);
    expect(afterEat.health).toBe(health);
    expect(afterEat.damage).toBe(damage);
    expect(afterEat.defense).toBe(defense);
  });

  it("keeps pack_travel_ration cook≥25 gate and restore values (edge)", () => {
    const recipe = getRecipe("pack_travel_ration")!;
    expect(recipe.minProfessionXp).toBe(25);
    expect(recipe.inputs.map((i) => i.itemId).sort()).toEqual([
      "bread",
      "cooked_meat",
    ]);
    expect(ENERGY.rationRestore).toBeGreaterThan(ENERGY.stewRestore);
    expect(getPlayerState(userId)!.buildings.some((b) => b.type === "kitchen")).toBe(
      true,
    );
  });

  it("refuses pack_travel_ration under cook XP gate (failure)", () => {
    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ cookXp: 24, energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    for (const id of ["bread", "cooked_meat", "travel_ration"] as const) {
      const qty =
        getPlayerState(userId)!.inventory.find((s) => s.itemId === id)?.qty ??
        0;
      if (qty > 0) removeItem(land.playerId, id, qty);
    }
    addItem(land.playerId, "bread", 1);
    addItem(land.playerId, "cooked_meat", 1);

    const result = craftRecipeComplete(
      userId,
      "pack_travel_ration",
      buildingPos(kitchen),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.needsXp("Cook", 25));
    }
  });
});
