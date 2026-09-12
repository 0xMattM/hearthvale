import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  CITY_BUILDINGS,
  PLAYER_LAND_STATIONS,
  WORLD,
  animalBreederPathTip,
  cityNoticeBoardTips,
  isPlayerLandStationType,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl262-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL26.2 animal pen stub (land only)", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl262_${Date.now().toString(36)}`,
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

  it("places animal_pen on player land and updates breeder tip (happy)", () => {
    expect(isPlayerLandStationType("animal_pen")).toBe(true);
    expect(PLAYER_LAND_STATIONS.animal_pen.kitItemId).toBe("animal_pen_kit");
    expect(CITY_BUILDINGS.some((b) => b.type === "animal_pen")).toBe(true);

    const tip = cityNoticeBoardTips().find((t) => t.id === "animal_breeder_path");
    expect(tip!.body).toBe(animalBreederPathTip());
    expect(tip!.body.toLowerCase()).toMatch(/animal pen|pens/);
    expect(tip!.body.toLowerCase()).toMatch(/feed|wheat/);
    expect(tip!.body.toLowerCase()).not.toMatch(/\bcombat\b|arena/);

    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 100,
        energy: 100,
        // Reason: CL46.1 — animal_pen requires one prior place worth of builder XP.
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(userId, "animal_pen", boardPos(home)).ok).toBe(
      true,
    );
    expect(
      getPlayerState(userId)!.buildings.some((b) => b.type === "animal_pen"),
    ).toBe(true);
  });

  it("allows unlimited pens on land (edge)", () => {
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 100,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(userId, "animal_pen", boardPos(home)).ok).toBe(
      true,
    );
    expect(
      getPlayerState(userId)!.buildings.filter((b) => b.type === "animal_pen")
        .length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("blocks placing animal_pen on city (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const board = city.buildings.find((b) => b.type === "build_board");
    const pos = board
      ? { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z }
      : { x: 0, z: 0 };
    const result = placeLandStation(userId, "animal_pen", pos);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }
  });
});
