import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  FISHING_DOCK,
  TUTORIAL_NPCS,
  WORLD,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl881-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherFish } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
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

/** Clears hold_fish proxies so Fisher stays active until a live land dock catch. */
function clearFisherObjectiveMats(uid: string) {
  const state = getPlayerState(uid)!;
  const fishQty = state.inventory
    .filter((s) => s.itemId === "fish")
    .reduce((n, s) => n + s.qty, 0);
  if (fishQty > 0) removeItem(state.playerId, "fish", fishQty);
}

/**
 * CL88.1 — Fisher tutor claim after land dock catch still green.
 * Choice: assert-only claim fidelity (parity with CL64.2; no Content Lock retune).
 */
describe("CityLands CL88.1 Fisher tutor claim after land dock catch still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl881_${Date.now().toString(36)}`,
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

  it("catches fish on land dock then claims Fisher at City (happy)", () => {
    expect(TUTORIAL_NPCS.fisher.quest.objective).toBe("hold_fish");
    expect(FISHING_DOCK.xp).toBe(5);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    clearFisherObjectiveMats(userId);
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(userId, "fishing_dock", boardPos(home)).ok).toBe(
      true,
    );

    clearFisherObjectiveMats(userId);
    const land = getPlayerState(userId)!;
    const dock = land.buildings.find((b) => b.type === "fishing_dock")!;
    expect(dock).toBeTruthy();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "active",
    );

    const fisherBefore = getPlayerState(userId)!.fisherXp;
    expect(gatherFish(userId, dock.id, buildingPos(dock)).ok).toBe(true);
    const afterCatch = getPlayerState(userId)!;
    expect(afterCatch.fisherXp).toBe(fisherBefore + FISHING_DOCK.xp);
    expect(afterCatch.inventory.some((s) => s.itemId === "fish")).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "ready",
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "fisher");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps alchemist inactive after catch-only (edge)", () => {
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "active",
    );
  });

  it("refuses claim before land dock catch (failure)", () => {
    const fresh = registerUser(
      `cl881f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    clearFisherObjectiveMats(other);
    expect(getTutorialNpcForPlayer(other, "fisher")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "fisher");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "fisher");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
