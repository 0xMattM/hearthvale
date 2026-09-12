import {
  ACTION_ERROR,
  CLAIM_NODE,
  CLAIM_WAR,
  type ClaimNodeDto,
  type ItemId,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import {
  buildings,
  claimContestScores,
  claimNodes,
  guilds,
  players,
} from "../../db/schema.js";
import { getActiveLand } from "../land.js";
import { addItem, removeItem, spendEnergy } from "../player.js";
import { requireNearGrid, type Pos } from "../proximity.js";
import type { ActionResult } from "./farming.js";

/**
 * Applies passive production ticks into stored_qty (capped).
 */
export function tickClaimNodeProduction(
  row: typeof claimNodes.$inferSelect,
  now = Date.now(),
): typeof claimNodes.$inferSelect {
  if (!row.claimedGuildId || row.lastProduceAt == null) return row;
  // Pause production during soft war.
  if (row.contestEndsAt != null && now < row.contestEndsAt) return row;

  if (row.storedQty >= CLAIM_NODE.storageCap) {
    if (row.lastProduceAt !== now) {
      db.update(claimNodes)
        .set({ lastProduceAt: now })
        .where(eq(claimNodes.id, row.id))
        .run();
      return { ...row, lastProduceAt: now };
    }
    return row;
  }

  const elapsed = Math.max(0, now - row.lastProduceAt);
  const ticks = Math.floor(elapsed / CLAIM_NODE.produceIntervalMs);
  if (ticks <= 0) return row;

  const add = Math.min(
    CLAIM_NODE.storageCap - row.storedQty,
    ticks * CLAIM_NODE.produceQty,
  );
  const nextStored = row.storedQty + add;
  const nextAt = row.lastProduceAt + ticks * CLAIM_NODE.produceIntervalMs;

  db.update(claimNodes)
    .set({ storedQty: nextStored, lastProduceAt: nextAt })
    .where(eq(claimNodes.id, row.id))
    .run();

  return { ...row, storedQty: nextStored, lastProduceAt: nextAt };
}

/**
 * Resolves an ended soft war: highest score takes the claim (tie → defender).
 */
export function resolveEndedContest(
  row: typeof claimNodes.$inferSelect,
  now = Date.now(),
): typeof claimNodes.$inferSelect {
  if (row.contestEndsAt == null || now < row.contestEndsAt) return row;

  const scores = db
    .select()
    .from(claimContestScores)
    .where(eq(claimContestScores.claimNodeId, row.id))
    .all();

  let winnerGuildId = row.claimedGuildId;
  if (scores.length > 0) {
    const ranked = [...scores].sort((a, b) => b.score - a.score);
    const top = ranked[0]!;
    const tied = ranked.filter((s) => s.score === top.score);
    // Reason: ties keep the defending holder when they are among tops.
    const defenderStillTop = tied.some(
      (s) => s.guildId === row.claimedGuildId,
    );
    winnerGuildId = defenderStillTop
      ? row.claimedGuildId
      : top.guildId;
  }

  for (const s of scores) {
    db.delete(claimContestScores).where(eq(claimContestScores.id, s.id)).run();
  }

  db.update(claimNodes)
    .set({
      claimedGuildId: winnerGuildId,
      claimedAt: now,
      lastProduceAt: now,
      storedQty: 0,
      contestEndsAt: null,
    })
    .where(eq(claimNodes.id, row.id))
    .run();

  return {
    ...row,
    claimedGuildId: winnerGuildId,
    claimedAt: now,
    lastProduceAt: now,
    storedQty: 0,
    contestEndsAt: null,
  };
}

/**
 * Loads the seeded wild grove node, resolving wars then ticking production.
 */
export function getWildGroveNode(now = Date.now()) {
  const raw = db
    .select()
    .from(claimNodes)
    .where(eq(claimNodes.slug, CLAIM_NODE.slug))
    .get();
  if (!raw) return null;
  const resolved = resolveEndedContest(raw, now);
  return tickClaimNodeProduction(resolved, now);
}

function contestScoreRows(claimNodeId: string) {
  return db
    .select({
      guildId: claimContestScores.guildId,
      score: claimContestScores.score,
      guildName: guilds.name,
    })
    .from(claimContestScores)
    .innerJoin(guilds, eq(guilds.id, claimContestScores.guildId))
    .where(eq(claimContestScores.claimNodeId, claimNodeId))
    .all();
}

/**
 * Builds claim DTO for player state / UI.
 */
export function claimDtoForPlayer(
  playerGuildId: string | null,
  now = Date.now(),
): ClaimNodeDto | null {
  const row = getWildGroveNode(now);
  if (!row) return null;
  const guildName = row.claimedGuildId
    ? (db.select().from(guilds).where(eq(guilds.id, row.claimedGuildId)).get()
        ?.name ?? null)
    : null;

  const activeContest =
    row.contestEndsAt != null && now < row.contestEndsAt;
  const scores = activeContest
    ? contestScoreRows(row.id)
        .map((s) => ({ guildName: s.guildName, score: s.score }))
        .sort((a, b) => b.score - a.score)
    : [];
  const yourContestScore =
    activeContest && playerGuildId
      ? (contestScoreRows(row.id).find((s) => s.guildId === playerGuildId)
          ?.score ?? 0)
      : null;

  return {
    slug: row.slug,
    name: row.name,
    produceItemId: row.produceItemId,
    storedQty: row.storedQty,
    storageCap: CLAIM_NODE.storageCap,
    claimedGuildName: guildName,
    isYours: Boolean(
      playerGuildId && row.claimedGuildId === playerGuildId,
    ),
    contestEndsAt: activeContest ? row.contestEndsAt : null,
    contestScores: scores,
    yourContestScore,
  };
}

function addContestScore(
  claimNodeId: string,
  guildId: string,
  delta: number,
): number {
  const existing = db
    .select()
    .from(claimContestScores)
    .where(
      and(
        eq(claimContestScores.claimNodeId, claimNodeId),
        eq(claimContestScores.guildId, guildId),
      ),
    )
    .get();
  if (existing) {
    const next = existing.score + delta;
    db.update(claimContestScores)
      .set({ score: next })
      .where(eq(claimContestScores.id, existing.id))
      .run();
    return next;
  }
  db.insert(claimContestScores)
    .values({
      id: nanoid(),
      claimNodeId,
      guildId,
      score: delta,
    })
    .run();
  return delta;
}

/**
 * Opens a soft-war window against a held claim.
 */
function startContest(
  player: typeof players.$inferSelect,
  node: typeof claimNodes.$inferSelect,
  now: number,
): ActionResult & { contestStarted?: boolean; contestEndsAt?: number } {
  if (!player.guildId) {
    return { ok: false, error: ACTION_ERROR.claimWarNeedGuild };
  }
  if (node.contestEndsAt != null && now < node.contestEndsAt) {
    return { ok: false, error: ACTION_ERROR.claimWarAlreadyOpen };
  }
  const energy = spendEnergy(player.id, CLAIM_WAR.startEnergyCost);
  if (!energy.ok) return energy;

  const ends = now + CLAIM_WAR.windowMs;
  db.update(claimNodes)
    .set({ contestEndsAt: ends })
    .where(eq(claimNodes.id, node.id))
    .run();
  // Seed defender + challenger at 0 so the board shows both.
  if (node.claimedGuildId) addContestScore(node.id, node.claimedGuildId, 0);
  addContestScore(node.id, player.guildId, 0);
  return { ok: true, contestStarted: true, contestEndsAt: ends };
}

/**
 * Delivers wood to score during an active soft war.
 */
function deliverForContest(
  player: typeof players.$inferSelect,
  node: typeof claimNodes.$inferSelect,
  qty: number,
): ActionResult & { delivered?: number; score?: number } {
  if (!player.guildId) {
    return { ok: false, error: ACTION_ERROR.claimWarNeedGuild };
  }
  if (!Number.isFinite(qty) || qty < 1 || !Number.isInteger(qty)) {
    return { ok: false, error: ACTION_ERROR.claimWarNeedMats };
  }
  if (!removeItem(player.id, CLAIM_WAR.deliverItemId, qty)) {
    return { ok: false, error: ACTION_ERROR.claimWarNeedMats };
  }
  const score = addContestScore(node.id, player.guildId, qty);
  return { ok: true, delivered: qty, score };
}

/**
 * Claim, collect, start soft war, or deliver for score (E).
 */
export function interactClaimNode(
  userId: string,
  buildingId: string,
  pos?: Pos,
  deliverQty = 1,
): ActionResult & {
  collected?: number;
  claimed?: boolean;
  contestStarted?: boolean;
  contestEndsAt?: number;
  delivered?: number;
  score?: number;
} {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const land = getActiveLand(player.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };

  const building = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!building || building.type !== "claim_node") {
    return { ok: false, error: ACTION_ERROR.claimNodeMissing };
  }

  const near = requireNearGrid(pos, building.x, building.z);
  if (!near.ok) return near;

  const now = Date.now();
  const node = getWildGroveNode(now);
  if (!node) return { ok: false, error: ACTION_ERROR.claimNodeMissing };

  const contestActive =
    node.contestEndsAt != null && now < node.contestEndsAt;

  if (contestActive) {
    return deliverForContest(player, node, deliverQty);
  }

  if (player.guildId && node.claimedGuildId === player.guildId) {
    if (node.storedQty <= 0) {
      return { ok: false, error: ACTION_ERROR.claimNothingStored };
    }
    const qty = node.storedQty;
    db.update(claimNodes)
      .set({ storedQty: 0, lastProduceAt: Date.now() })
      .where(eq(claimNodes.id, node.id))
      .run();
    addItem(player.id, node.produceItemId as ItemId, qty);
    return { ok: true, collected: qty };
  }

  if (node.claimedGuildId) {
    // Rival opens soft war instead of hard block.
    return startContest(player, node, now);
  }

  if (!player.guildId) {
    return { ok: false, error: ACTION_ERROR.claimNeedGuild };
  }

  const energy = spendEnergy(player.id, CLAIM_NODE.claimEnergyCost);
  if (!energy.ok) return energy;

  db.update(claimNodes)
    .set({
      claimedGuildId: player.guildId,
      claimedAt: now,
      lastProduceAt: now,
      storedQty: 0,
      contestEndsAt: null,
    })
    .where(eq(claimNodes.id, node.id))
    .run();

  return { ok: true, claimed: true };
}
