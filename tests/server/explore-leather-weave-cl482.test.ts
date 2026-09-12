import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl482-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL48.2 Explore leather → land loom weave e2e", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl482_${Date.now().toString(36)}`,
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

  it("hunts Explore trail leather then weaves cloth on land loom (happy)", () => {
    const recipe = getRecipe("weave_cloth")!;
    expect(recipe.profession).toBe("weaver");
    expect(recipe.station).toBe("loom");
    expect(recipe.inputs).toEqual([{ itemId: "leather", qty: 2 }]);
    expect(recipe.output.itemId).toBe("cloth");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const trails = explore.buildings.filter((b) => b.type === "game_trail");
    expect(trails.length).toBeGreaterThanOrEqual(2);

    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    // Reason: clear starter leftovers so trail hunts are the leather source under test.
    const leftoverLeather =
      explore.inventory
        .filter((s) => s.itemId === "leather")
        .reduce((n, s) => n + s.qty, 0) ?? 0;
    if (leftoverLeather > 0)
      removeItem(explore.playerId, "leather", leftoverLeather);

    // Reason: weave_cloth needs 2× leather; each trail win drops 1 — hunt both trails.
    const huntA = huntTrail(userId, trails[0]!.id, buildingPos(trails[0]!));
    expect(huntA.ok).toBe(true);
    expect(huntA.encounter?.won).toBe(true);
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    const huntB = huntTrail(userId, trails[1]!.id, buildingPos(trails[1]!));
    expect(huntB.ok).toBe(true);
    expect(huntB.encounter?.won).toBe(true);

    const afterHunt = getPlayerState(userId)!;
    const leatherQty = afterHunt.inventory
      .filter((s) => s.itemId === "leather")
      .reduce((n, s) => n + s.qty, 0);
    expect(leatherQty).toBeGreaterThanOrEqual(2);
    const hunterBefore = afterHunt.animalHunterXp;

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "plank", 4);

    expect(placeLandStation(userId, "loom", boardPos(home)).ok).toBe(true);
    const land = getPlayerState(userId)!;
    const loom = land.buildings.find((b) => b.type === "loom")!;
    expect(loom).toBeTruthy();

    const weaverBefore = land.weaverXp;
    expect(craftRecipeComplete(userId, "weave_cloth", buildingPos(loom)).ok).toBe(
      true,
    );
    const afterWeave = getPlayerState(userId)!;
    expect(afterWeave.weaverXp).toBeGreaterThan(weaverBefore);
    expect(afterWeave.animalHunterXp).toBe(hunterBefore);
    expect(
      afterWeave.inventory.some((s) => s.itemId === "cloth" && s.qty >= 1),
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

  it("rejects land weave_cloth without leather (failure)", () => {
    const land = getPlayerState(userId)!;
    expect(land.landKind).toBe("player_land");
    const loom = land.buildings.find((b) => b.type === "loom")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    const leatherQty = land.inventory
      .filter((s) => s.itemId === "leather")
      .reduce((n, s) => n + s.qty, 0);
    if (leatherQty > 0) removeItem(land.playerId, "leather", leatherQty);

    const result = craftRecipeComplete(userId, "weave_cloth", buildingPos(loom));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
