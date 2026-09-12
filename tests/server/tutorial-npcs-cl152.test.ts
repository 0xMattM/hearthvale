import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CITY_BUILDINGS,
  SEEDED_CITY_TUTORIAL_NPCS,
  TUTORIAL_NPCS,
  WORLD,
} from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl152-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
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
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL15.2 Builder tutor + first land build", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl152_${Date.now().toString(36)}`, "password123");
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

  it("seeds Builder on City; claim after placeLandStation (happy)", () => {
    expect(SEEDED_CITY_TUTORIAL_NPCS).toContain("builder");
    expect(TUTORIAL_NPCS.builder.seededOnCity).toBe(true);
    expect(TUTORIAL_NPCS.builder.quest.objective).toBe("place_land_station");
    expect(
      CITY_BUILDINGS.some((b) => b.tutorialNpcId === "builder"),
    ).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(
      city.buildings.some((b) => b.tutorialNpcId === "builder"),
    ).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "builder")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    const board = home.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
    addItem(home.playerId, "wood", 4);
    expect(
      placeLandStation(userId, "crop_plot", buildingPos(board)).ok,
    ).toBe(true);

    // Claim still works from City walk-up after land place (no forced HUD).
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "builder")!.quest.status).toBe(
      "ready",
    );
    const claim = claimTutorialQuest(userId, "builder");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "builder")!.quest.status).toBe(
      "claimed",
    );
  });

  it("city place is blocked and empty land is not ready (edge)", () => {
    const fresh = registerUser(
      `cl152e_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(other, "builder")!.quest.status).toBe(
      "active",
    );
    const cityPlace = placeLandStation(other, "crop_plot", {
      x: 0,
      z: 0,
    });
    expect(cityPlace.ok).toBe(false);
    if (!cityPlace.ok) {
      expect(cityPlace.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }

    expect(travelToLandKind(other, "player_land").ok).toBe(true);
    const empty = getPlayerState(other)!;
    expect(empty.buildings.every((b) => b.type === "build_board")).toBe(true);
    expect(getTutorialNpcForPlayer(other, "builder")!.quest.status).toBe(
      "active",
    );
  });

  it("rejects claim before place and double-claim (failure)", () => {
    const fresh = registerUser(
      `cl152f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;
    expect(travelToLandKind(other, "city").ok).toBe(true);

    const early = claimTutorialQuest(other, "builder");
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.questNotReady);

    const again = claimTutorialQuest(userId, "builder");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
  });
});
