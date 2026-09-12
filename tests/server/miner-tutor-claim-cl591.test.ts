import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, ORE_NODE, TUTORIAL_NPCS, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl591-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherOre } = await import(
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

function equipHammer(uid: string) {
  const pid = db.select().from(players).where(eq(players.userId, uid)).get()!
    .id;
  addItem(pid, "iron_hammer", 1);
  const hammer = getPlayerState(uid)!.inventory.find(
    (i) => i.itemId === "iron_hammer",
  )!;
  db.update(players)
    .set({ equippedToolInventoryId: hammer.id })
    .where(eq(players.id, pid))
    .run();
}

/** Clears gather_ore proxies so Miner stays active until a live chip. */
function clearMinerObjectiveMats(uid: string) {
  const state = getPlayerState(uid)!;
  for (const id of ["iron_ore", "iron_bar"] as const) {
    const qty = state.inventory
      .filter((s) => s.itemId === id)
      .reduce((n, s) => n + s.qty, 0);
    if (qty > 0) removeItem(state.playerId, id, qty);
  }
}

/**
 * CL59.1 — Explore ore chip → City Miner tutor claim.
 * Choice: assert-only claim e2e (objective still gather_ore) over new tutor ids.
 */
describe("CityLands CL59.1 Miner tutor claim after Explore ore chip", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl591_${Date.now().toString(36)}`,
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

  it("chips Explore ore then claims Miner at City (happy)", () => {
    expect(TUTORIAL_NPCS.miner.quest.objective).toBe("gather_ore");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    clearMinerObjectiveMats(userId);
    db.update(players)
      .set({ minerXp: 0, energy: 100 })
      .where(eq(players.id, getPlayerState(userId)!.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "miner")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.landKind).toBe("explore");
    const node = explore.buildings.find((b) => b.type === "ore_node")!;
    expect(node).toBeTruthy();

    clearMinerObjectiveMats(userId);
    db.update(players)
      .set({ minerXp: 0, energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    equipHammer(userId);
    // Reason: hammer is a blacksmith proxy, not a miner objective — Miner stays active.
    expect(getTutorialNpcForPlayer(userId, "miner")!.quest.status).toBe(
      "active",
    );

    const minerBefore = getPlayerState(userId)!.minerXp;
    expect(gatherOre(userId, node.id, buildingPos(node)).ok).toBe(true);
    const afterChip = getPlayerState(userId)!;
    expect(afterChip.minerXp).toBe(minerBefore + ORE_NODE.xp);
    expect(afterChip.inventory.some((s) => s.itemId === "iron_ore")).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "miner")!.quest.status).toBe(
      "ready",
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "miner");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "miner")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps carpenter inactive after Explore chip-only (edge)", () => {
    // Reason: starter bread readies Cook; carpenter needs plank / carpenterXp.
    expect(getTutorialNpcForPlayer(userId, "carpenter")!.quest.status).toBe(
      "active",
    );
  });

  it("refuses claim before Explore chip (failure)", () => {
    const fresh = registerUser(
      `cl591f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    clearMinerObjectiveMats(other);
    db.update(players)
      .set({ minerXp: 0 })
      .where(eq(players.id, getPlayerState(other)!.playerId))
      .run();
    expect(getTutorialNpcForPlayer(other, "miner")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "miner");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "miner");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
