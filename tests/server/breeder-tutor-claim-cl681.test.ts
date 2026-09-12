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
  `game-cl681-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
 * CL68.1 — Animal Breeder tutor claim after land pen care still green.
 * Choice: assert-only feed+clean → City claim (objective already Content Lock).
 */
describe("CityLands CL68.1 Animal Breeder tutor claim after pen care still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl681_${Date.now().toString(36)}`,
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

  it("feeds+cleans on land then claims Animal Breeder at City (happy)", () => {
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

  it("keeps pen care as non-combat Breeder XP path (edge)", () => {
    expect(ANIMAL_PEN.xp).toBeGreaterThan(0);
    expect(ANIMAL_PEN.feedQty).toBeGreaterThan(0);
    // Reason: after City claim the player is on city; pen lives on homestead.
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const land = getPlayerState(userId)!;
    expect(land.landKind).toBe("player_land");
    expect(land.buildings.some((b) => b.type === "animal_pen")).toBe(true);
    expect(land.animalBreederXp).toBeGreaterThan(0);
  });

  it("refuses incomplete Breeder claim (failure)", () => {
    const fresh = registerUser(
      `cl681f_${Date.now().toString(36)}`,
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
  });
});
