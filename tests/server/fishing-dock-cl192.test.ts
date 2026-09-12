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
  cityNoticeBoardTips,
  cityPracticeStationsFor,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl192-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherFish } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { claimTutorialQuest, getTutorialNpcForPlayer } = await import(
  "../../apps/server/src/game/tutorial-npcs.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");
const { TUTORIAL_NPCS } = await import("@game/shared");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL19.2–CL19.3 city fishing dock + Fisher fish objective", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl192_${Date.now().toString(36)}`, "password123");
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

  it("seeds exactly one city dock and catches fish there (happy)", () => {
    expect(
      CITY_BUILDINGS.filter((b) => b.type === "fishing_dock"),
    ).toHaveLength(1);
    expect(CITY_BUILDINGS.length).toBe(CITY_LAND.buildSlots);
    expect(CITY_PRACTICE_STATIONS.fisher).toEqual(["fishing_dock"]);
    expect(cityPracticeStationsFor("fisher")).toEqual(["fishing_dock"]);
    expect(TUTORIAL_NPCS.fisher.quest.objective).toBe("hold_fish");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const docks = city.buildings.filter((b) => b.type === "fishing_dock");
    expect(docks).toHaveLength(1);

    const caught = gatherFish(userId, docks[0]!.id, buildingPos(docks[0]!));
    expect(caught.ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.some(
        (s) => s.itemId === "fish" && s.qty >= 1,
      ),
    ).toBe(true);

    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "ready",
    );
    expect(claimTutorialQuest(userId, "fisher").ok).toBe(true);
  });

  it("updates notice tip and keeps dock scarce after reload (edge)", () => {
    const tip = cityNoticeBoardTips().find(
      (t) => t.id === "fisher_alchemist_practice",
    );
    expect(tip?.body).toMatch(/Fishing Dock/i);
    expect(tip?.body).not.toMatch(/Raw Meat/i);

    const again = getPlayerState(userId)!;
    expect(again.landKind).toBe("city");
    expect(
      again.buildings.filter((b) => b.type === "fishing_dock"),
    ).toHaveLength(1);
  });

  it("blocks placing dock on city; land place still OK (failure)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const city = getPlayerState(userId)!;
    const near = city.buildings[0]!;
    const cityPlace = placeLandStation(userId, "fishing_dock", {
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
    expect(
      placeLandStation(userId, "fishing_dock", buildingPos(board)).ok,
    ).toBe(true);
  });
});
