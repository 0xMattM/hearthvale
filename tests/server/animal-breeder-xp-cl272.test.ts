import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ANIMAL_PEN,
  BUILDER_PLACE_XP,
  WORLD,
  getRecipe,
  meetsRecipeXpGate,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl272-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { feedAnimalPen } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL27.2 Animal Breeder XP column", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl272_${Date.now().toString(36)}`,
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

  it("persists animalBreederXp from pen feed (happy)", () => {
    const home = getPlayerState(userId)!;
    expect(home.animalBreederXp).toBe(0);
    db.update(players)
      .set({
        softCurrency: 100,
        energy: 100,
        // Reason: CL46.1 — animal_pen requires builder XP gate.
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(userId, "animal_pen", boardPos(home)).ok).toBe(
      true,
    );
    const land = getPlayerState(userId)!;
    const pen = land.buildings.find((b) => b.type === "animal_pen")!;
    addItem(land.playerId, "wheat", 1);
    const builderBefore = land.builderXp;
    const farmerBefore = land.farmerXp;

    expect(feedAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.animalBreederXp).toBe(ANIMAL_PEN.xp);
    expect(after.builderXp).toBe(builderBefore);
    expect(after.farmerXp).toBe(farmerBefore);
  });

  it("keeps animal_breeder gate separate from farmer XP (edge)", () => {
    const flour = getRecipe("mill_flour")!;
    const gated = {
      ...flour,
      profession: "animal_breeder" as const,
      minProfessionXp: 10,
    };
    expect(
      meetsRecipeXpGate(gated, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    ).toBe(false);
    expect(
      meetsRecipeXpGate(gated, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10),
    ).toBe(true);
  });

  it("rejects feed when too far (failure)", () => {
    const state = getPlayerState(userId)!;
    const pen = state.buildings.find((b) => b.type === "animal_pen")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, pen.id))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    addItem(state.playerId, "wheat", 1);
    const result = feedAnimalPen(userId, pen.id, { x: 99, z: 99 });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.tooFar);
  });
});
