import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  recipeCraftMs,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-craft-wait-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const {
  startCraft,
  collectCraft,
  craftGlanceForBuilding,
} = await import("../../apps/server/src/game/actions/crafting.ts");
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { craftJobs, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

function forceJobsReady(buildingId: string) {
  db.update(craftJobs)
    .set({ readyAt: Date.now() - 1 })
    .where(eq(craftJobs.buildingId, buildingId))
    .run();
}

function ensureKind(userId: string, kind: "player_land" | "city") {
  db.update(players)
    .set({ energy: 100 })
    .where(eq(players.userId, userId))
    .run();
  if (getPlayerState(userId)!.landKind === kind) return;
  expect(travelToLandKind(userId, kind).ok).toBe(true);
}

describe("craft wait/collect (start → ready → collect)", () => {
  let aliceId = "";
  let bobId = "";
  let cityMillId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const a = registerUser(`cwc_a_${stamp}`, "password123");
    const b = registerUser(`cwc_b_${stamp}`, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    aliceId = userIdFromToken(a.token)!;
    bobId = userIdFromToken(b.token)!;

    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.userId, aliceId))
      .run();
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.userId, bobId))
      .run();

    const home = getPlayerState(aliceId)!;
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "iron_bar", 2);
    if (!home.buildings.some((b) => b.type === "mill")) {
      expect(placeLandStation(aliceId, "mill", boardPos(home)).ok).toBe(true);
    }

    ensureKind(aliceId, "city");
    ensureKind(bobId, "city");
    cityMillId = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "mill",
    )!.id;
  });

  afterEach(() => {
    db.delete(craftJobs).run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.userId, aliceId))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.userId, bobId))
      .run();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("too-early collect fails; wait then collect ok (happy)", () => {
    ensureKind(aliceId, "player_land");
    const mill = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "mill",
    )!;
    const pos = buildingPos(mill);
    addItem(getPlayerState(aliceId)!.playerId, "wheat", 2);

    expect(startCraft(aliceId, "mill_flour", pos).ok).toBe(true);
    const early = collectCraft(aliceId, mill.id, pos);
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.craftNotReady);

    const recipe = getRecipe("mill_flour")!;
    expect(recipeCraftMs(recipe)).toBeGreaterThan(0);
    forceJobsReady(mill.id);
    expect(collectCraft(aliceId, mill.id, pos).ok).toBe(true);
    expect(
      getPlayerState(aliceId)!.inventory.some((i) => i.itemId === "flour"),
    ).toBe(true);
  });

  it("second starter on land mill is craftAlreadyStarted (edge)", () => {
    ensureKind(aliceId, "player_land");
    const mill = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "mill",
    )!;
    const pos = buildingPos(mill);
    addItem(getPlayerState(aliceId)!.playerId, "wheat", 4);
    expect(startCraft(aliceId, "mill_flour", pos).ok).toBe(true);

    const again = startCraft(aliceId, "mill_flour", pos);
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.craftAlreadyStarted);
  });

  it("two city players can start same mill; only own job collects (happy)", () => {
    ensureKind(aliceId, "city");
    ensureKind(bobId, "city");
    const mill = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "mill",
    )!;
    expect(mill.id).toBe(cityMillId);
    const pos = buildingPos(mill);

    addItem(getPlayerState(aliceId)!.playerId, "wheat", 2);
    addItem(getPlayerState(bobId)!.playerId, "wheat", 2);
    expect(startCraft(aliceId, "mill_flour", pos).ok).toBe(true);
    expect(startCraft(bobId, "mill_flour", pos).ok).toBe(true);

    const now = Date.now();
    expect(
      craftGlanceForBuilding(
        mill.id,
        getPlayerState(aliceId)!.playerId,
        "city",
        now,
      )?.isYours,
    ).toBe(true);
    expect(
      craftGlanceForBuilding(
        mill.id,
        getPlayerState(bobId)!.playerId,
        "city",
        now,
      )?.isYours,
    ).toBe(true);

    // Peer cannot collect Alice's job (bob has his own — collectCraft uses own job).
    const bobStealBeforeReady = collectCraft(bobId, mill.id, pos);
    expect(bobStealBeforeReady.ok).toBe(false);
    if (!bobStealBeforeReady.ok) {
      expect(bobStealBeforeReady.error).toBe(ACTION_ERROR.craftNotReady);
    }

    forceJobsReady(mill.id);
    expect(collectCraft(bobId, mill.id, pos).ok).toBe(true);
    expect(collectCraft(aliceId, mill.id, pos).ok).toBe(true);
  });

  it("land peer job glance hides recipe (failure)", () => {
    ensureKind(aliceId, "player_land");
    const mill = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "mill",
    )!;
    const pos = buildingPos(mill);
    addItem(getPlayerState(aliceId)!.playerId, "wheat", 2);
    expect(startCraft(aliceId, "mill_flour", pos).ok).toBe(true);

    const glance = craftGlanceForBuilding(
      mill.id,
      "not-the-owner",
      "player_land",
      Date.now(),
    );
    expect(glance).toEqual({
      recipeId: null,
      readyAt: null,
      state: "working",
      isYours: false,
    });
  });
});
