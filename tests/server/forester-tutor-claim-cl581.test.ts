import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, TUTORIAL_NPCS, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl581-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherWood } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
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
 * CL58.1 — Land stump chop → City Forester tutor claim.
 * Choice: assert-only claim e2e (objective still gather_wood) over new tutor ids.
 */
describe("CityLands CL58.1 Forester tutor claim after land chop", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl581_${Date.now().toString(36)}`,
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

  it("chops land stump then claims Forester at City (happy)", () => {
    expect(TUTORIAL_NPCS.forester.quest.objective).toBe("gather_wood");
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "forester")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 100, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 1);
    expect(placeLandStation(userId, "tree_stump", boardPos(home)).ok).toBe(
      true,
    );

    const land = getPlayerState(userId)!;
    const stump = land.buildings.find((b) => b.type === "tree_stump")!;
    expect(stump).toBeTruthy();
    // Reason: clear place leftovers so chop wood is the gather_wood source.
    for (const id of ["wood", "plank"] as const) {
      const qty = land.inventory
        .filter((s) => s.itemId === id)
        .reduce((n, s) => n + s.qty, 0);
      if (qty > 0) removeItem(land.playerId, id, qty);
    }
    db.update(players)
      .set({ foresterXp: 0, energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "forester")!.quest.status).toBe(
      "active",
    );

    const foresterBefore = getPlayerState(userId)!.foresterXp;
    expect(gatherWood(userId, stump.id, buildingPos(stump)).ok).toBe(true);
    const afterChop = getPlayerState(userId)!;
    expect(afterChop.foresterXp).toBeGreaterThan(foresterBefore);
    expect(afterChop.inventory.some((s) => s.itemId === "wood")).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "forester")!.quest.status).toBe(
      "ready",
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "forester");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "forester")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps carpenter inactive after chop-only (edge)", () => {
    expect(getTutorialNpcForPlayer(userId, "carpenter")!.quest.status).toBe(
      "active",
    );
  });

  it("refuses claim before land chop (failure)", () => {
    const fresh = registerUser(
      `cl581f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(other, "forester")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "forester");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "forester");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
