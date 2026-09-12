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
  `game-cl292-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

function loomPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const loom = state.buildings.find((b) => b.type === "loom")!;
  return { x: WORLD.GRID * loom.x, z: WORLD.GRID * loom.z };
}

describe("CityLands CL29.2 Weaver second recipe (cloth bandage)", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl292_${Date.now().toString(36)}`, "password123");
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

  it("sews cloth bandage at loom and grants weaver XP (happy)", () => {
    const recipe = getRecipe("weave_cloth_bandage")!;
    expect(recipe.profession).toBe("weaver");
    expect(recipe.station).toBe("loom");
    expect(recipe.inputs).toEqual([{ itemId: "cloth", qty: 1 }]);
    expect(recipe.output.itemId).toBe("cloth_bandage");
    expect(FOOD_RESTORE.cloth_bandage).toBe(ENERGY.bandageRestore);
    expect(ENERGY.bandageRestore).toBeLessThan(ENERGY.breadRestore);

    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 20);
    addItem(home.playerId, "plank", 10);
    expect(placeLandStation(userId, "loom", boardPos(home)).ok).toBe(true);

    const before = getPlayerState(userId)!;
    const carpenterBefore = before.carpenterXp;
    const weaverBefore = before.weaverXp;
    addItem(before.playerId, "cloth", 1);

    expect(craftRecipeComplete(userId, "weave_cloth_bandage", loomPos(before)).ok).toBe(
      true,
    );
    const after = getPlayerState(userId)!;
    expect(after.weaverXp).toBeGreaterThan(weaverBefore);
    expect(after.carpenterXp).toBe(carpenterBefore);
    expect(
      after.inventory.some((s) => s.itemId === "cloth_bandage" && s.qty >= 1),
    ).toBe(true);
    expect(after.inventory.some((s) => s.itemId === "cloth" && s.qty >= 1)).toBe(
      false,
    );
  });

  it("keeps weave_cloth available alongside bandage (edge)", () => {
    const cloth = getRecipe("weave_cloth")!;
    const bandage = getRecipe("weave_cloth_bandage")!;
    expect(cloth.station).toBe("loom");
    expect(bandage.station).toBe("loom");
    expect(cloth.profession).toBe("weaver");
    expect(bandage.profession).toBe("weaver");
    expect(cloth.output.itemId).toBe("cloth");
    expect(bandage.inputs[0]?.itemId).toBe("cloth");
  });

  it("rejects bandage craft without cloth (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const loom = city.buildings.find((b) => b.type === "loom")!;
    const cloth = city.inventory.find((s) => s.itemId === "cloth");
    expect(!cloth || cloth.qty === 0).toBe(true);

    const result = craftRecipeComplete(userId, "weave_cloth_bandage", {
      x: WORLD.GRID * loom.x,
      z: WORLD.GRID * loom.z,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.missingMaterials);
  });
});
