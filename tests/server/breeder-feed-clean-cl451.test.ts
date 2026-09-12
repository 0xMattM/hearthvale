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
  `game-cl451-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem, removeItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { cleanAnimalPen, feedAnimalPen } = await import(
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

function qtyOf(
  state: { inventory: Array<{ itemId: string; qty: number }> },
  itemId: string,
): number {
  return state.inventory
    .filter((s) => s.itemId === itemId)
    .reduce((n, s) => n + s.qty, 0);
}

describe("CityLands CL45.1 Breeder feed + clean XP e2e smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl451_${Date.now().toString(36)}`,
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

  it("feeds wheat then cleans wood with animal_breeder XP both beats (happy)", () => {
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 100,
        energy: 100,
        // Reason: CL46.1 gates pen; bootstrap XP so dual-care e2e is not blocked by place.
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
    expect(pen).toBeTruthy();
    addItem(land.playerId, "wheat", ANIMAL_PEN.feedQty);

    const xp0 = land.animalBreederXp;
    const health0 = land.health;
    const damage0 = land.damage;
    const defense0 = land.defense;
    const meat0 = qtyOf(land, "raw_meat");
    const leather0 = qtyOf(land, "leather");
    const wheatBefore = qtyOf(getPlayerState(userId)!, "wheat");
    const woodBefore = qtyOf(getPlayerState(userId)!, "wood");

    expect(feedAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    const afterFeed = getPlayerState(userId)!;
    expect(afterFeed.animalBreederXp).toBe(xp0 + ANIMAL_PEN.xp);
    expect(qtyOf(afterFeed, "wheat")).toBe(wheatBefore - ANIMAL_PEN.feedQty);

    // Reason: shared care CD — clear so clean is the second beat under test.
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, pen.id))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterFeed.playerId))
      .run();

    expect(cleanAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    const afterClean = getPlayerState(userId)!;
    expect(afterClean.animalBreederXp).toBe(xp0 + ANIMAL_PEN.xp * 2);
    expect(qtyOf(afterClean, "wood")).toBe(woodBefore - ANIMAL_PEN.cleanQty);

    // Reason: pen care is non-combat — no HP/combat stats or hunt loot from feed/clean.
    expect(afterClean.health).toBe(health0);
    expect(afterClean.damage).toBe(damage0);
    expect(afterClean.defense).toBe(defense0);
    expect(qtyOf(afterClean, "raw_meat")).toBe(meat0);
    expect(qtyOf(afterClean, "leather")).toBe(leather0);
  });

  it("cleans then feeds after CD for the same XP ladder (edge)", () => {
    const land = getPlayerState(userId)!;
    const pen = land.buildings.find((b) => b.type === "animal_pen")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, pen.id))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wood", ANIMAL_PEN.cleanQty);
    addItem(land.playerId, "wheat", ANIMAL_PEN.feedQty);
    const xpBefore = getPlayerState(userId)!.animalBreederXp;

    expect(cleanAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    expect(getPlayerState(userId)!.animalBreederXp).toBe(
      xpBefore + ANIMAL_PEN.xp,
    );

    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, pen.id))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();

    expect(feedAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    expect(getPlayerState(userId)!.animalBreederXp).toBe(
      xpBefore + ANIMAL_PEN.xp * 2,
    );
  });

  it("rejects second care while pen cooldown is active (failure)", () => {
    const land = getPlayerState(userId)!;
    const pen = land.buildings.find((b) => b.type === "animal_pen")!;
    // Leave readyAt from prior beat; ensure mats + energy for a would-be care.
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wheat", 1);
    const xpBefore = getPlayerState(userId)!.animalBreederXp;

    const refused = feedAnimalPen(userId, pen.id, buildingPos(pen));
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe(ACTION_ERROR.animalPenCooldown);
    }
    expect(getPlayerState(userId)!.animalBreederXp).toBe(xpBefore);

    // Also missing-wheat after CD clear stays a care failure surface.
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, pen.id))
      .run();
    const wheatQty = qtyOf(getPlayerState(userId)!, "wheat");
    if (wheatQty > 0) removeItem(land.playerId, "wheat", wheatQty);
    const noWheat = feedAnimalPen(userId, pen.id, buildingPos(pen));
    expect(noWheat.ok).toBe(false);
    if (!noWheat.ok) {
      expect(noWheat.error).toBe(ACTION_ERROR.missingItem("Wheat"));
    }
  });
});
