import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  getRecipe,
  meetsRecipeXpGate,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl133-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL13.3 Weaver XP column", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl133_${Date.now().toString(36)}`, "password123");
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

  it("routes weave_cloth through weaver XP (happy)", () => {
    const recipe = getRecipe("weave_cloth")!;
    expect(recipe.profession).toBe("weaver");
    expect(recipe.station).toBe("loom");

    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 20);
    addItem(home.playerId, "plank", 10);
    expect(placeLandStation(userId, "loom", boardPos(home)).ok).toBe(true);

    const before = getPlayerState(userId)!;
    expect(before.weaverXp).toBe(0);
    const carpenterBefore = before.carpenterXp;
    addItem(before.playerId, "leather", 2);

    expect(craftRecipeComplete(userId, "weave_cloth", loomPos(before)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.weaverXp).toBeGreaterThan(before.weaverXp);
    expect(after.carpenterXp).toBe(carpenterBefore);
  });

  it("gates on weaver XP column, not carpenter (edge)", () => {
    const recipe = getRecipe("weave_cloth")!;
    const gated = { ...recipe, minProfessionXp: 10 };
    // High carpenter XP alone does not open a weaver gate
    expect(meetsRecipeXpGate(gated, 0, 0, 0, 0, 99, 0)).toBe(false);
    expect(meetsRecipeXpGate(gated, 0, 0, 0, 0, 0, 10)).toBe(true);
    expect(meetsRecipeXpGate(recipe, 0, 0, 0, 0, 0, 0)).toBe(true);
  });

  it("rejects weave without leather at city loom (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const loom = city.buildings.find((b) => b.type === "loom")!;
    // Ensure no leather stacks
    const leather = city.inventory.filter((s) => s.itemId === "leather");
    expect(leather.every((s) => s.qty === 0) || leather.length === 0).toBe(
      true,
    );

    const result = craftRecipeComplete(userId, "weave_cloth", {
      x: WORLD.GRID * loom.x,
      z: WORLD.GRID * loom.z,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
