import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, TUTORIAL_NPCS, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl621-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

/**
 * CL62.1 — Builder tutor claim after land station place.
 * Choice: crop_plot bootstrap place (no minBuilderXp) → City claim; assert-only objective.
 */
describe("CityLands CL62.1 Builder tutor claim after land station place", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl621_${Date.now().toString(36)}`,
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

  it("places land crop_plot then claims Builder at City (happy)", () => {
    expect(TUTORIAL_NPCS.builder.quest.objective).toBe("place_land_station");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    db.update(players)
      .set({ builderXp: 0 })
      .where(eq(players.id, getPlayerState(userId)!.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "builder")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({ softCurrency: 50, energy: 100, builderXp: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 4);

    const builderBefore = getPlayerState(userId)!.builderXp;
    expect(placeLandStation(userId, "crop_plot", boardPos(home)).ok).toBe(
      true,
    );
    const afterPlace = getPlayerState(userId)!;
    expect(afterPlace.builderXp).toBeGreaterThan(builderBefore);
    expect(afterPlace.buildings.some((b) => b.type === "crop_plot")).toBe(
      true,
    );
    expect(getTutorialNpcForPlayer(userId, "builder")!.quest.status).toBe(
      "ready",
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "builder");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "builder")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps weaver inactive after place-only (edge)", () => {
    // Reason: place grants builder XP; weave needs cloth / weaverXp.
    expect(getTutorialNpcForPlayer(userId, "weaver")!.quest.status).toBe(
      "active",
    );
  });

  it("refuses claim before land station place (failure)", () => {
    const fresh = registerUser(
      `cl621f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    db.update(players)
      .set({ builderXp: 0 })
      .where(eq(players.id, getPlayerState(other)!.playerId))
      .run();
    expect(getTutorialNpcForPlayer(other, "builder")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "builder");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "builder");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
