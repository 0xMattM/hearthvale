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
  `game-cl322-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherOre } = await import(
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

function equipHammer(uid: string) {
  const pid = db.select().from(players).where(eq(players.userId, uid)).get()!
    .id;
  addItem(pid, "iron_hammer", 1);
  const hammer = getPlayerState(uid)!.inventory.find(
    (i) => i.itemId === "iron_hammer",
  )!;
  db.update(players)
    .set({ equippedToolInventoryId: hammer.id })
    .where(eq(players.id, pid))
    .run();
}

describe("CityLands CL32.2 placeable land ore node", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl322_${Date.now().toString(36)}`,
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

  it("places ore_node on land and chips for miner XP (happy)", () => {
    expect(isPlayerLandStationType("ore_node")).toBe(true);
    expect(PLAYER_LAND_STATIONS.ore_node.kitItemId).toBe("ore_node_kit");
    expect(CITY_BUILDINGS.some((b) => b.type === "ore_node")).toBe(true);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    expect(home.buildings.some((b) => b.type === "ore_node")).toBe(false);

    db.update(players)
      .set({ softCurrency: 100, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "iron_ore", 2);

    expect(placeLandStation(userId, "ore_node", boardPos(home)).ok).toBe(true);
    const afterPlace = getPlayerState(userId)!;
    const node = afterPlace.buildings.find((b) => b.type === "ore_node");
    expect(node).toBeTruthy();

    equipHammer(userId);
    const minerBefore = getPlayerState(userId)!.minerXp;
    const smithBefore = getPlayerState(userId)!.blacksmithXp;
    expect(gatherOre(userId, node!.id, buildingPos(node!)).ok).toBe(true);
    const afterChip = getPlayerState(userId)!;
    expect(afterChip.minerXp).toBeGreaterThan(minerBefore);
    expect(afterChip.blacksmithXp).toBe(smithBefore);
    expect(afterChip.inventory.some((s) => s.itemId === "iron_ore")).toBe(true);
  });

  it("still requires hammer on land ore (edge)", () => {
    const home = getPlayerState(userId)!;
    const node = home.buildings.find((b) => b.type === "ore_node")!;
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!
      .id;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, node.id))
      .run();
    db.update(players)
      .set({ equippedToolInventoryId: null })
      .where(eq(players.id, pid))
      .run();
    const result = gatherOre(userId, node.id, buildingPos(node));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.needHammer);
    }
  });

  it("blocks placing ore_node on city (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.buildings.some((b) => b.type === "ore_node")).toBe(true);
    const board = city.buildings.find((b) => b.type === "build_board");
    const pos = board
      ? { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z }
      : { x: 0, z: 0 };
    const result = placeLandStation(userId, "ore_node", pos);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }
  });
});
