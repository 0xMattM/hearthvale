import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, CLAIM_WAR, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-war-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { createGuild } = await import("../../apps/server/src/game/guilds.ts");
const {
  getWildGroveNode,
  interactClaimNode,
  resolveEndedContest,
} = await import("../../apps/server/src/game/actions/claim.ts");
const { getPlayerState, addItem, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { claimNodes, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function beaconFor(userId: string) {
  const state = getPlayerState(userId)!;
  const beacon = state.buildings.find((b) => b.type === "claim_node");
  expect(beacon).toBeTruthy();
  return {
    id: beacon!.id,
    pos: { x: beacon!.x * WORLD.GRID, z: beacon!.z * WORLD.GRID },
  };
}

describe("claim soft war F12.4", () => {
  let holderId = "";
  let rivalId = "";
  let rivalPlayerId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const a = registerUser(`war_a_${stamp}`, "password123");
    const b = registerUser(`war_b_${stamp}`, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    holderId = userIdFromToken(a.token)!;
    rivalId = userIdFromToken(b.token)!;
    ensureStarterYardBuildings(getPlayerState(holderId)!.landId);
    ensureStarterYardBuildings(getPlayerState(rivalId)!.landId);
    rivalPlayerId = db
      .select()
      .from(players)
      .where(eq(players.userId, rivalId))
      .get()!.id;
    expect(createGuild(holderId, `hold_${stamp}`).ok).toBe(true);
    expect(createGuild(rivalId, `riv_${stamp}`).ok).toBe(true);

    const held = beaconFor(holderId);
    expect(interactClaimNode(holderId, held.id, held.pos).ok).toBe(true);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("rival starts soft war and scores by delivering wood (happy)", () => {
    addItem(rivalPlayerId, "wood", 5);
    const { id, pos } = beaconFor(rivalId);
    const start = interactClaimNode(rivalId, id, pos);
    expect(start.ok).toBe(true);
    if (start.ok) {
      expect(start.contestStarted).toBe(true);
      expect(start.contestEndsAt).toBeGreaterThan(Date.now());
    }

    const deliver = interactClaimNode(rivalId, id, pos, 3);
    expect(deliver.ok).toBe(true);
    if (deliver.ok) {
      expect(deliver.delivered).toBe(3);
      expect(deliver.score).toBe(3);
    }

    const dto = getPlayerState(rivalId)!.buildings.find(
      (b) => b.type === "claim_node",
    )?.claim;
    expect(dto?.contestEndsAt).toBeTruthy();
    expect(dto?.yourContestScore).toBe(3);
  });

  it("rejects deliver without wood (edge)", () => {
    const { id, pos } = beaconFor(rivalId);
    // Spend remaining wood first if any leftover from happy path
    const leftover =
      getPlayerState(rivalId)!.inventory.find((i) => i.itemId === "wood")
        ?.qty ?? 0;
    if (leftover > 0) {
      interactClaimNode(rivalId, id, pos, leftover);
    }
    const fail = interactClaimNode(rivalId, id, pos, 1);
    expect(fail.ok).toBe(false);
    if (!fail.ok) expect(fail.error).toBe(ACTION_ERROR.claimWarNeedMats);
  });

  it("resolves war to highest score (failure path for defender)", () => {
    const row = getWildGroveNode()!;
    // Force window closed with rival ahead
    db.update(claimNodes)
      .set({ contestEndsAt: Date.now() - 1000 })
      .where(eq(claimNodes.id, row.id))
      .run();

    const resolved = resolveEndedContest(
      db.select().from(claimNodes).where(eq(claimNodes.id, row.id)).get()!,
    );
    const rivalGuild = db
      .select()
      .from(players)
      .where(eq(players.userId, rivalId))
      .get()!.guildId;
    expect(resolved.claimedGuildId).toBe(rivalGuild);
    expect(resolved.contestEndsAt).toBeNull();

    const dto = getPlayerState(rivalId)!.buildings.find(
      (b) => b.type === "claim_node",
    )?.claim;
    expect(dto?.isYours).toBe(true);
    expect(dto?.contestEndsAt).toBeNull();

    // Sanity: CLAIM_WAR window is finite and delivery item is wood
    expect(CLAIM_WAR.windowMs).toBeGreaterThan(0);
    expect(CLAIM_WAR.deliverItemId).toBe("wood");
  });
});
