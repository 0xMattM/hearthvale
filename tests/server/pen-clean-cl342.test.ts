import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ANIMAL_PEN,
  BUILDER_PLACE_XP,
  animalBreederPathTip,
  cityNoticeBoardTips,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl342-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { cleanAnimalPen, feedAnimalPen, careAnimalPen } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);
const { WORLD } = await import("@game/shared");

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL34.2 animal pen clean / bedding second beat", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl342_${Date.now().toString(36)}`,
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

  it("cleans pen with wood and grants animal_breeder XP (happy)", () => {
    expect(ANIMAL_PEN.cleanItemId).toBe("wood");
    expect(ANIMAL_PEN.cleanQty).toBe(1);
    expect(ANIMAL_PEN.xp).toBe(5);

    const tip = cityNoticeBoardTips().find(
      (t) => t.id === "animal_breeder_path",
    );
    expect(tip!.body).toBe(animalBreederPathTip());
    expect(tip!.body.toLowerCase()).toMatch(/wood|bedding/);
    expect(tip!.body.toLowerCase()).toMatch(/wheat|feed/);
    expect(tip!.body.toLowerCase()).not.toMatch(/\bcombat\b|arena/);

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
    addItem(home.playerId, "wood", 12);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(userId, "animal_pen", boardPos(home)).ok).toBe(
      true,
    );

    const land = getPlayerState(userId)!;
    const pen = land.buildings.find((b) => b.type === "animal_pen")!;
    const beforeXp = land.animalBreederXp;
    const woodBefore = land.inventory
      .filter((s) => s.itemId === "wood")
      .reduce((n, s) => n + s.qty, 0);

    expect(cleanAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.animalBreederXp).toBe(beforeXp + ANIMAL_PEN.xp);
    const woodAfter = after.inventory
      .filter((s) => s.itemId === "wood")
      .reduce((n, s) => n + s.qty, 0);
    expect(woodAfter).toBe(woodBefore - ANIMAL_PEN.cleanQty);
  });

  it("rejects clean without wood (failure)", () => {
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
    const woodQty = land.inventory
      .filter((s) => s.itemId === "wood")
      .reduce((n, s) => n + s.qty, 0);
    if (woodQty > 0) removeItem(land.playerId, "wood", woodQty);

    const result = cleanAnimalPen(userId, pen.id, buildingPos(pen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingItem("Wood"));
    }
  });

  it("auto care prefers wheat feed then wood clean (edge)", () => {
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

    addItem(land.playerId, "wheat", 1);
    addItem(land.playerId, "wood", 2);
    const xpBefore = getPlayerState(userId)!.animalBreederXp;

    expect(careAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    const afterFeed = getPlayerState(userId)!;
    expect(afterFeed.animalBreederXp).toBe(xpBefore + ANIMAL_PEN.xp);
    expect(
      afterFeed.inventory
        .filter((s) => s.itemId === "wheat")
        .reduce((n, s) => n + s.qty, 0),
    ).toBe(0);

    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, pen.id))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterFeed.playerId))
      .run();

    expect(careAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    expect(getPlayerState(userId)!.animalBreederXp).toBe(
      xpBefore + ANIMAL_PEN.xp * 2,
    );

    // Explicit feed still works alongside clean.
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, pen.id))
      .run();
    addItem(afterFeed.playerId, "wheat", 1);
    expect(feedAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
  });
});
