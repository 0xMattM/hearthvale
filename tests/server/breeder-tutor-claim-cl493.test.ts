import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ANIMAL_PEN,
  BUILDER_PLACE_XP,
  WORLD,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl493-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { cleanAnimalPen, feedAnimalPen } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
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

/**
 * CL49.3 — dual pen care (feed + clean) then Animal Breeder claim at City walk-up.
 * Choice: assert-only (objective still `feed_animal_pen` via any breeder XP) over requiring both beats.
 */
describe("CityLands CL49.3 Breeder tutor claim after pen care", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl493_${Date.now().toString(36)}`,
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

  it("feeds then cleans on land and claims Animal Breeder at City (happy)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_breeder")!.quest.status,
    ).toBe("active");

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 100,
        energy: 100,
        // Reason: CL46.1 — animal_pen place needs builder XP.
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 12);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(userId, "animal_pen", boardPos(home)).ok).toBe(
      true,
    );

    const land = getPlayerState(userId)!;
    const pen = land.buildings.find((b) => b.type === "animal_pen")!;
    addItem(land.playerId, "wheat", ANIMAL_PEN.feedQty);
    const xp0 = land.animalBreederXp;
    const health0 = land.health;

    expect(feedAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    expect(getPlayerState(userId)!.animalBreederXp).toBe(xp0 + ANIMAL_PEN.xp);

    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, pen.id))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();

    expect(cleanAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    const afterCare = getPlayerState(userId)!;
    expect(afterCare.animalBreederXp).toBe(xp0 + ANIMAL_PEN.xp * 2);
    expect(afterCare.health).toBe(health0);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_breeder")!.quest.status,
    ).toBe("ready");
    const claim = claimTutorialQuest(userId, "animal_breeder");
    expect(claim.ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_breeder")!.quest.status,
    ).toBe("claimed");
  });

  it("clean-only also readies the tutor (edge)", () => {
    const fresh = registerUser(
      `cl493e_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    const homeTravel = travelToLandKind(other, "player_land");
    if (!homeTravel.ok) {
      expect(homeTravel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const home = getPlayerState(other)!;
    db.update(players)
      .set({
        softCurrency: 100,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 12);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(other, "animal_pen", boardPos(home)).ok).toBe(
      true,
    );
    const land = getPlayerState(other)!;
    const pen = land.buildings.find((b) => b.type === "animal_pen")!;
    expect(cleanAnimalPen(other, pen.id, buildingPos(pen)).ok).toBe(true);
    expect(getPlayerState(other)!.animalBreederXp).toBe(ANIMAL_PEN.xp);

    expect(travelToLandKind(other, "city").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(other, "animal_breeder")!.quest.status,
    ).toBe("ready");
  });

  it("refuses claim before any pen care (failure)", () => {
    const fresh = registerUser(
      `cl493f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(other, "animal_breeder")!.quest.status,
    ).toBe("active");
    const early = claimTutorialQuest(other, "animal_breeder");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "animal_breeder");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
