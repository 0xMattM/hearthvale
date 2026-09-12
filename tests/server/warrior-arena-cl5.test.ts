import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ECONOMY_PROFESSIONS,
  PLAYER_LAND_BUILDINGS,
  TUTORIAL_NPCS,
  WARRIOR_BUILDINGS,
  WARRIOR_LAND,
  WORLD,
  isProductionBuildingType,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl5-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind, ensureWarriorYardBuildings } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
);
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { buildings, lands, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

/** World-space position at a building's grid cell center. */
function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL5.1 warrior arena stub", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl5_${Date.now().toString(36)}`,
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

  it("loads placeholder arena with portal + arena boards (happy)", () => {
    expect(travelToLandKind(userId, "warrior").ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("warrior");
    expect(state.buildings).toHaveLength(WARRIOR_BUILDINGS.length);
    expect(state.buildings.length).toBe(WARRIOR_LAND.buildSlots);
    expect(state.buildings.some((b) => b.type === "portal")).toBe(true);
    expect(
      state.buildings.filter((b) => b.type === "arena_board").length,
    ).toBeGreaterThanOrEqual(1);
    expect(state.buildings.every((b) => !isProductionBuildingType(b.type))).toBe(
      true,
    );
  });

  it("backfills arena plaques onto portal-only CL1.2 rows (edge)", () => {
    const pid = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!.id;
    const land = db
      .select()
      .from(lands)
      .where(eq(lands.playerId, pid))
      .all()
      .find((l) => l.kind === "warrior")!;
    // Simulate thin CL1.2 stub: only portal at slot 0.
    const extras = db
      .select()
      .from(buildings)
      .where(eq(buildings.landId, land.id))
      .all()
      .filter((b) => b.slotIndex !== 0);
    for (const b of extras) {
      db.delete(buildings).where(eq(buildings.id, b.id)).run();
    }
    db.update(lands).set({ buildSlots: 1 }).where(eq(lands.id, land.id)).run();

    ensureWarriorYardBuildings(land.id);
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    expect(travelToLandKind(userId, "warrior").ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.buildings).toHaveLength(WARRIOR_BUILDINGS.length);
    expect(state.buildings.some((b) => b.type === "arena_board")).toBe(true);
  });

  it("stays off profession ladder and homestead; hunt/build refuse (failure)", () => {
    // Warrior is not an economy profession.
    expect(
      (ECONOMY_PROFESSIONS as readonly string[]).includes("warrior"),
    ).toBe(false);
    expect(Object.keys(TUTORIAL_NPCS).includes("warrior")).toBe(false);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    expect(home.buildings.some((b) => b.type === "arena_board")).toBe(false);
    expect(
      PLAYER_LAND_BUILDINGS.some((b) => b.type === "arena_board"),
    ).toBe(false);

    expect(travelToLandKind(userId, "warrior").ok).toBe(true);
    const arena = getPlayerState(userId)!;
    const plaque = arena.buildings.find((b) => b.type === "arena_board")!;
    const hunt = huntTrail(userId, plaque.id, buildingPos(plaque));
    expect(hunt.ok).toBe(false);
    expect(hunt.error).toBe(ACTION_ERROR.huntExploreOnly);

    const build = placeLandStation(userId, "mill", buildingPos(plaque));
    expect(build.ok).toBe(false);
    expect(build.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
  });
});
