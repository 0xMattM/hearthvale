import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl443-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const { craftRecipeComplete } = await import(
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

describe("CityLands CL44.3 Explore hunt meat → land kitchen cook", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl443_${Date.now().toString(36)}`,
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

  it("hunts Explore trail meat then cooks on land kitchen with cook XP (happy)", () => {
    const recipe = getRecipe("cook_meat")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.station).toBe("kitchen");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const trail = explore.buildings.find((b) => b.type === "game_trail")!;
    expect(trail).toBeTruthy();

    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    // Reason: clear starter leftovers so hunt is the meat source under test.
    const leftoverMeat =
      explore.inventory
        .filter((s) => s.itemId === "raw_meat")
        .reduce((n, s) => n + s.qty, 0) ?? 0;
    if (leftoverMeat > 0) removeItem(explore.playerId, "raw_meat", leftoverMeat);

    const hunt = huntTrail(userId, trail.id, buildingPos(trail));
    expect(hunt.ok).toBe(true);
    expect(hunt.encounter?.won).toBe(true);
    const afterHunt = getPlayerState(userId)!;
    expect(afterHunt.inventory.some((s) => s.itemId === "raw_meat")).toBe(true);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "iron_ore", 1);

    expect(placeLandStation(userId, "kitchen", boardPos(home)).ok).toBe(true);
    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    expect(kitchen).toBeTruthy();

    const cookBefore = land.cookXp;
    const hunterBefore = land.animalHunterXp;
    expect(craftRecipeComplete(userId, "cook_meat", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const afterCook = getPlayerState(userId)!;
    expect(afterCook.cookXp).toBeGreaterThan(cookBefore);
    expect(afterCook.animalHunterXp).toBe(hunterBefore);
    expect(
      afterCook.inventory.some((s) => s.itemId === "cooked_meat" && s.qty >= 1),
    ).toBe(true);
  });

  it("refuses homestead hunt unchanged (edge)", () => {
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    const fake = home.buildings[0]!;
    const refused = huntTrail(userId, fake.id, buildingPos(fake));
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe(ACTION_ERROR.huntExploreOnly);
    }
  });

  it("rejects land cook_meat without raw meat (failure)", () => {
    const land = getPlayerState(userId)!;
    expect(land.landKind).toBe("player_land");
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    const meatQty = land.inventory
      .filter((s) => s.itemId === "raw_meat")
      .reduce((n, s) => n + s.qty, 0);
    if (meatQty > 0) removeItem(land.playerId, "raw_meat", meatQty);

    const result = craftRecipeComplete(userId, "cook_meat", buildingPos(kitchen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
