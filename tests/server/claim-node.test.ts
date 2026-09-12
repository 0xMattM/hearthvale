import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, CLAIM_NODE, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-claim-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
  tickClaimNodeProduction,
} = await import("../../apps/server/src/game/actions/claim.ts");
const { getPlayerState, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { claimNodes } = await import("../../apps/server/src/db/schema.ts");

function beaconFor(userId: string) {
  const state = getPlayerState(userId)!;
  const beacon = state.buildings.find((b) => b.type === "claim_node");
  expect(beacon).toBeTruthy();
  return {
    id: beacon!.id,
    pos: { x: beacon!.x * WORLD.GRID, z: beacon!.z * WORLD.GRID },
  };
}

describe("claim node F12.3", () => {
  let userId = "";
  let outsiderId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`claim_${stamp}`, "password123");
    const out = registerUser(`claim_o_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    expect(out.ok).toBe(true);
    if (!reg.ok || !out.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    outsiderId = userIdFromToken(out.token)!;
    ensureStarterYardBuildings(getPlayerState(userId)!.landId);
    ensureStarterYardBuildings(getPlayerState(outsiderId)!.landId);
    expect(createGuild(userId, `grove_${stamp}`).ok).toBe(true);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("rejects claim without guild (edge)", () => {
    const { id, pos } = beaconFor(outsiderId);
    const result = interactClaimNode(outsiderId, id, pos);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.claimNeedGuild);
  });

  it("guild claims and later collects produced mats (happy)", () => {
    const { id, pos } = beaconFor(userId);
    const claim = interactClaimNode(userId, id, pos);
    expect(claim.ok).toBe(true);
    if (claim.ok) expect(claim.claimed).toBe(true);

    const state = getPlayerState(userId)!;
    const dto = state.buildings.find((b) => b.id === id)?.claim;
    expect(dto?.isYours).toBe(true);
    expect(dto?.claimedGuildName).toBeTruthy();

    const row = getWildGroveNode()!;
    db.update(claimNodes)
      .set({
        lastProduceAt: Date.now() - CLAIM_NODE.produceIntervalMs * 3,
      })
      .where(eq(claimNodes.id, row.id))
      .run();
    const ticked = tickClaimNodeProduction(
      db.select().from(claimNodes).where(eq(claimNodes.id, row.id)).get()!,
    );
    expect(ticked.storedQty).toBeGreaterThanOrEqual(3);

    const woodBefore =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "wood")
        ?.qty ?? 0;
    const collect = interactClaimNode(userId, id, pos);
    expect(collect.ok).toBe(true);
    if (collect.ok) expect(collect.collected).toBeGreaterThanOrEqual(3);
    const woodAfter =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "wood")
        ?.qty ?? 0;
    expect(woodAfter).toBeGreaterThan(woodBefore);
  });

  it("rejects collect when empty; rival can open soft war (failure)", () => {
    const { id, pos } = beaconFor(userId);
    const empty = interactClaimNode(userId, id, pos);
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error).toBe(ACTION_ERROR.claimNothingStored);

    // Outsider without guild still cannot contest
    const other = beaconFor(outsiderId);
    const noGuild = interactClaimNode(outsiderId, other.id, other.pos);
    expect(noGuild.ok).toBe(false);
    if (!noGuild.ok) expect(noGuild.error).toBe(ACTION_ERROR.claimWarNeedGuild);
  });
});
