import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  PLAYER_LAND_STATIONS,
  WORLD,
  stationMinBuilderXp,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl461-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

describe("CityLands CL46.1 builder XP gate on animal_pen", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl461_${Date.now().toString(36)}`,
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

  it("places animal_pen after enough builder XP (happy)", () => {
    expect(PLAYER_LAND_STATIONS.animal_pen.minBuilderXp).toBe(
      BUILDER_PLACE_XP,
    );
    expect(stationMinBuilderXp("animal_pen")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("fishing_dock")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("kitchen")).toBe(0);
    expect(stationMinBuilderXp("workshop")).toBe(0);
    expect(stationMinBuilderXp("crop_plot")).toBe(0);

    const home = getPlayerState(userId)!;
    const pos = boardPos(home);
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "plank", 4);

    expect(placeLandStation(userId, "animal_pen", pos).ok).toBe(true);
    expect(
      getPlayerState(userId)!.buildings.some((b) => b.type === "animal_pen"),
    ).toBe(true);
    expect(getPlayerState(userId)!.builderXp).toBe(BUILDER_PLACE_XP * 2);
  });

  it("keeps crop_plot / workshop / kitchen ungated at 0 builder XP (edge)", () => {
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 20);
    addItem(home.playerId, "plank", 4);
    addItem(home.playerId, "iron_ore", 1);
    expect(placeLandStation(userId, "crop_plot", boardPos(home)).ok).toBe(
      true,
    );
    expect(placeLandStation(userId, "workshop", boardPos(home)).ok).toBe(
      true,
    );
    expect(placeLandStation(userId, "kitchen", boardPos(home)).ok).toBe(true);
  });

  it("refuses animal_pen under builder XP gate (failure)", () => {
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "plank", 4);
    const result = placeLandStation(userId, "animal_pen", boardPos(home));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(
        ACTION_ERROR.needsXp("builder", BUILDER_PLACE_XP),
      );
    }
  });
});
