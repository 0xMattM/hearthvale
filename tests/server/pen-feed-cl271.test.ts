import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ANIMAL_PEN,
  BUILDER_PLACE_XP,
  CITY_BUILDINGS,
  WORLD,
  animalBreederPathTip,
  cityNoticeBoardTips,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl271-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem, removeItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { feedAnimalPen } = await import(
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

describe("CityLands CL27.1 pen interact feed stub", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl271_${Date.now().toString(36)}`,
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

  it("feeds wheat at land pen and grants animal_breeder XP (happy)", () => {
    expect(ANIMAL_PEN.feedItemId).toBe("wheat");
    expect(ANIMAL_PEN.feedQty).toBe(1);
    expect(ANIMAL_PEN.xp).toBe(5);
    expect(CITY_BUILDINGS.some((b) => b.type === "animal_pen")).toBe(true);

    const tip = cityNoticeBoardTips().find(
      (t) => t.id === "animal_breeder_path",
    );
    expect(tip!.body).toBe(animalBreederPathTip());
    expect(tip!.body.toLowerCase()).toMatch(/feed|wheat/);
    expect(tip!.body.toLowerCase()).toMatch(/shared city|city animal pen/);
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
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(userId, "animal_pen", boardPos(home)).ok).toBe(
      true,
    );

    const land = getPlayerState(userId)!;
    const pen = land.buildings.find((b) => b.type === "animal_pen")!;
    expect(pen).toBeTruthy();
    addItem(land.playerId, "wheat", 2);
    const beforeXp = land.animalBreederXp;
    const wheatBefore =
      land.inventory
        .filter((s) => s.itemId === "wheat")
        .reduce((n, s) => n + s.qty, 0) + 2;

    expect(feedAnimalPen(userId, pen.id, buildingPos(pen)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.animalBreederXp).toBe(beforeXp + ANIMAL_PEN.xp);
    const wheatAfter = after.inventory
      .filter((s) => s.itemId === "wheat")
      .reduce((n, s) => n + s.qty, 0);
    expect(wheatAfter).toBe(wheatBefore - ANIMAL_PEN.feedQty);
  });

  it("rejects feed without wheat (failure)", () => {
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
    const wheatQty = land.inventory
      .filter((s) => s.itemId === "wheat")
      .reduce((n, s) => n + s.qty, 0);
    if (wheatQty > 0) removeItem(land.playerId, "wheat", wheatQty);

    const result = feedAnimalPen(userId, pen.id, buildingPos(pen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingItem("Wheat"));
    }
  });

  it("city scarce pen is available to feed (edge)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.buildings.some((b) => b.type === "animal_pen")).toBe(true);
  });
});
