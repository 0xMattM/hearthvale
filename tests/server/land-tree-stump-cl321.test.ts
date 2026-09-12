import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CITY_BUILDINGS,
  PLAYER_LAND_STATIONS,
  WORLD,
  isPlayerLandStationType,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl321-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherWood } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL32.1 placeable land tree stump", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl321_${Date.now().toString(36)}`,
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

  it("places tree_stump on land and chops for forester XP (happy)", () => {
    expect(isPlayerLandStationType("tree_stump")).toBe(true);
    expect(PLAYER_LAND_STATIONS.tree_stump.kitItemId).toBe("tree_stump_kit");
    expect(CITY_BUILDINGS.some((b) => b.type === "tree_stump")).toBe(true);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    expect(home.buildings.some((b) => b.type === "tree_stump")).toBe(false);

    db.update(players)
      .set({ softCurrency: 100, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 4);

    expect(placeLandStation(userId, "tree_stump", boardPos(home)).ok).toBe(
      true,
    );
    const afterPlace = getPlayerState(userId)!;
    const stump = afterPlace.buildings.find((b) => b.type === "tree_stump");
    expect(stump).toBeTruthy();

    const foresterBefore = afterPlace.foresterXp;
    const carpenterBefore = afterPlace.carpenterXp;
    expect(gatherWood(userId, stump!.id, buildingPos(stump!)).ok).toBe(true);
    const afterChop = getPlayerState(userId)!;
    expect(afterChop.foresterXp).toBeGreaterThan(foresterBefore);
    expect(afterChop.carpenterXp).toBe(carpenterBefore);
    expect(afterChop.inventory.some((s) => s.itemId === "wood")).toBe(true);
  });

  it("allows unlimited land trees (edge)", () => {
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 100, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 4);
    expect(placeLandStation(userId, "tree_stump", boardPos(home)).ok).toBe(
      true,
    );
    expect(
      getPlayerState(userId)!.buildings.filter((b) => b.type === "tree_stump")
        .length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("blocks placing tree_stump on city (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.buildings.some((b) => b.type === "tree_stump")).toBe(true);
    const board = city.buildings.find((b) => b.type === "build_board");
    const pos = board
      ? { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z }
      : { x: 0, z: 0 };
    const result = placeLandStation(userId, "tree_stump", pos);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }
  });
});
