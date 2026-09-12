import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import {
  ACTION_ERROR,
  PLAYER_LAND_STATIONS,
  WARRIOR_TRAINING_BUILDING_TYPES,
  WORLD,
  isWarriorTrainingBuildingType,
} from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl112-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { players } = await import("../../apps/server/src/db/schema.ts");

describe("CityLands CL11.2 warrior training homestead guard", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl112_${Date.now().toString(36)}`,
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

  it("allows a normal homestead station from the build catalog (happy)", () => {
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    const board = home.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
    const pos = { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };

    const recipe = PLAYER_LAND_STATIONS.crop_plot;
    db.update(players)
      .set({ softCurrency: recipe.coinCost + 20, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    for (const mat of recipe.materials) {
      addItem(home.playerId, mat.itemId, mat.qty);
    }

    const attempt = placeLandStation(userId, "crop_plot", pos);
    expect(attempt.ok).toBe(true);
    expect(isWarriorTrainingBuildingType("crop_plot")).toBe(false);
  });

  it("never seeds warrior training on fresh player land (edge)", () => {
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    expect(
      home.buildings.some((b) => isWarriorTrainingBuildingType(b.type)),
    ).toBe(false);
  });

  it("refuses placing arena_board on player land (failure)", () => {
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    const board = home.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
    const pos = { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };

    for (const type of WARRIOR_TRAINING_BUILDING_TYPES) {
      const res = placeLandStation(userId, type, pos);
      expect(res.ok).toBe(false);
      expect(res.error).toBe(ACTION_ERROR.warriorTrainingHomesteadForbidden);
    }

    const after = getPlayerState(userId)!;
    expect(
      after.buildings.some((b) => isWarriorTrainingBuildingType(b.type)),
    ).toBe(false);
  });
});
