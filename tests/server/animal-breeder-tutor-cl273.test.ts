import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ANIMAL_PEN,
  BUILDER_PLACE_XP,
  CITY_PRACTICE_STATIONS,
  SEEDED_CITY_TUTORIAL_NPCS,
  TUTORIAL_NPCS,
  WORLD,
  animalBreederPathTip,
  cityNoticeBoardTips,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl273-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { feedAnimalPen } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
  listTutorialNpcs,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
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

describe("CityLands CL27.3 Animal Breeder tutor seed", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl273_${Date.now().toString(36)}`,
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

  it("seeds Animal Breeder tutor on city and claims after feed (happy)", () => {
    expect(SEEDED_CITY_TUTORIAL_NPCS).toContain("animal_breeder");
    expect(TUTORIAL_NPCS.animal_breeder.seededOnCity).toBe(true);
    expect(TUTORIAL_NPCS.animal_breeder.quest.objective).toBe(
      "feed_animal_pen",
    );
    expect(CITY_PRACTICE_STATIONS.animal_breeder).toEqual(["animal_pen"]);

    const tip = cityNoticeBoardTips().find(
      (t) => t.id === "animal_breeder_path",
    );
    expect(tip!.body).toBe(animalBreederPathTip());
    expect(tip!.body.toLowerCase()).toMatch(/tutor/);
    expect(tip!.body.toLowerCase()).not.toMatch(/\bcombat\b|arena/);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(
      city.buildings.some((b) => b.tutorialNpcId === "animal_breeder"),
    ).toBe(true);
    expect(listTutorialNpcs(userId).map((n) => n.id)).toContain(
      "animal_breeder",
    );

    const before = getTutorialNpcForPlayer(userId, "animal_breeder");
    expect(before?.quest.status).toBe("active");
    expect(claimTutorialQuest(userId, "animal_breeder").ok).toBe(false);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 100,
        energy: 100,
        // Reason: CL46.1 — animal_pen requires builder XP gate.
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(userId, "animal_pen", boardPos(home)).ok).toBe(
      true,
    );
    const land = getPlayerState(userId)!;
    const pen = land.buildings.find((b) => b.type === "animal_pen")!;
    addItem(land.playerId, "wheat", 1);
    expect(feedAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    expect(getPlayerState(userId)!.animalBreederXp).toBe(ANIMAL_PEN.xp);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const ready = getTutorialNpcForPlayer(userId, "animal_breeder");
    expect(ready?.quest.status).toBe("ready");
    expect(claimTutorialQuest(userId, "animal_breeder").ok).toBe(true);
    const claimed = getTutorialNpcForPlayer(userId, "animal_breeder");
    expect(claimed?.quest.status).toBe("claimed");
  });

  it("does not invent livestock combat copy (edge)", () => {
    const def = TUTORIAL_NPCS.animal_breeder;
    const blob = `${def.basics} ${def.toolsNeeded} ${def.buildingsNeeded} ${def.quest.blurb}`.toLowerCase();
    expect(blob).not.toMatch(/\bcombat\b|\barena\b|\bboar\b|\bhare\b/);
    expect(blob).toMatch(/wheat|pen/);
  });

  it("blocks claim before feed (failure)", () => {
    const reg = registerUser(
      `cl273b_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    const otherId = userIdFromToken(reg.token)!;
    expect(travelToLandKind(otherId, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(otherId, "animal_breeder")?.quest.status).toBe(
      "active",
    );
    expect(claimTutorialQuest(otherId, "animal_breeder").ok).toBe(false);
  });
});
