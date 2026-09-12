import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  CITY_BUILDINGS,
  CITY_LAND,
  CITY_PRACTICE_STATIONS,
  WORLD,
  cityPracticeStationsFor,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl132-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL13.2 scarce city loom", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl132_${Date.now().toString(36)}`, "password123");
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

  it("seeds exactly one city loom and weaves there (happy)", () => {
    expect(CITY_BUILDINGS.filter((b) => b.type === "loom")).toHaveLength(1);
    expect(CITY_BUILDINGS.length).toBe(CITY_LAND.buildSlots);
    expect(CITY_PRACTICE_STATIONS.weaver).toEqual(["loom"]);
    expect(cityPracticeStationsFor("weaver")).toEqual(["loom"]);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const looms = city.buildings.filter((b) => b.type === "loom");
    expect(looms).toHaveLength(1);

    addItem(city.playerId, "leather", 2);
    const woven = craftRecipeComplete(userId, "weave_cloth", buildingPos(looms[0]!));
    expect(woven.ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.some(
        (s) => s.itemId === "cloth" && s.qty >= 1,
      ),
    ).toBe(true);
  });

  it("keeps city loom scarce after reload / backfill (edge)", () => {
    const again = getPlayerState(userId)!;
    expect(again.landKind).toBe("city");
    expect(again.buildings.filter((b) => b.type === "loom")).toHaveLength(1);
    expect(CITY_BUILDINGS.filter((b) => b.type === "loom")).toHaveLength(1);
  });

  it("blocks placing loom on city; land place still OK (failure)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const city = getPlayerState(userId)!;
    const near = city.buildings[0]!;
    const cityPlace = placeLandStation(userId, "loom", {
      x: WORLD.GRID * near.x,
      z: WORLD.GRID * near.z,
    });
    expect(cityPlace.ok).toBe(false);
    if (!cityPlace.ok) {
      expect(cityPlace.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 20);
    addItem(home.playerId, "plank", 10);
    const board = home.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
    expect(placeLandStation(userId, "loom", buildingPos(board)).ok).toBe(true);
  });
});
