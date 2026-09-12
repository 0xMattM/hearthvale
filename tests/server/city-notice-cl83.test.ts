import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CITY_BUILDINGS,
  CITY_LAND,
  PLAYER_LAND_BUILDINGS,
  WORLD,
  cityNoticeBoardTips,
  formatFreeTravelCircuit,
  isProductionBuildingType,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl83-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind, ensureCityYardBuildings } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
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

describe("CityLands CL8.3 city notice board stub", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl83_${Date.now().toString(36)}`,
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

  it("seeds notice board with static tips covering circuit / stations / warrior (happy)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("city");
    expect(state.buildings).toHaveLength(CITY_BUILDINGS.length);
    expect(CITY_BUILDINGS.length).toBe(CITY_LAND.buildSlots);
    expect(state.buildings.some((b) => b.type === "notice_board")).toBe(true);
    expect(CITY_BUILDINGS.some((b) => b.type === "notice_board")).toBe(true);
    expect(isProductionBuildingType("notice_board")).toBe(false);

    const tips = cityNoticeBoardTips();
    expect(tips.length).toBeGreaterThanOrEqual(3);
    const ids = tips.map((t) => t.id);
    expect(ids).toContain("travel_circuit");
    expect(ids).toContain("scarce_stations");
    expect(ids).toContain("warrior_optional");
    expect(ids).toContain("land_to_city");
    const travel = tips.find((t) => t.id === "travel_circuit")!;
    expect(travel.body).toContain(formatFreeTravelCircuit());
    expect(tips.some((t) => /scarce|shared/i.test(t.body))).toBe(true);
    expect(tips.some((t) => /optional|not on the economy/i.test(t.body))).toBe(
      true,
    );
    const loop = tips.find((t) => t.id === "land_to_city")!;
    expect(loop.body).toMatch(/Your Land/i);
    expect(loop.body).toMatch(/Market|Vendor/i);
    expect(loop.body).not.toMatch(/always.?on HUD|permanent column/i);
  });

  it("backfills notice board onto older city rows (edge)", () => {
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
      .find((l) => l.kind === "city")!;
    const notice = db
      .select()
      .from(buildings)
      .where(eq(buildings.landId, land.id))
      .all()
      .find((b) => b.type === "notice_board");
    if (notice) {
      db.delete(buildings).where(eq(buildings.id, notice.id)).run();
    }
    db.update(lands)
      .set({ buildSlots: CITY_LAND.buildSlots - 1 })
      .where(eq(lands.id, land.id))
      .run();

    ensureCityYardBuildings(land.id);
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.buildings.some((b) => b.type === "notice_board")).toBe(true);
    expect(state.buildings).toHaveLength(CITY_BUILDINGS.length);
  });

  it("stays off homestead and cannot be placed as a land station (failure)", () => {
    expect(
      PLAYER_LAND_BUILDINGS.some((b) => b.type === "notice_board"),
    ).toBe(false);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    expect(home.buildings.some((b) => b.type === "notice_board")).toBe(false);

    const board = { x: 0, z: 1 };
    // notice_board is not a PlayerLandStationType — cast for refusal path
    const place = placeLandStation(
      userId,
      "notice_board" as "mill",
      buildingPos(board),
    );
    expect(place.ok).toBe(false);
    expect(place.error).toBe(ACTION_ERROR.unknownStation);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const notice = city.buildings.find((b) => b.type === "notice_board")!;
    const cityPlace = placeLandStation(userId, "mill", buildingPos(notice));
    expect(cityPlace.ok).toBe(false);
    expect(cityPlace.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
  });
});
