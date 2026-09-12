import { ACTION_ERROR, GUILD, type GuildRank } from "@game/shared";
import { and, eq } from "drizzle-orm";
import { customAlphabet, nanoid } from "nanoid";
import { db } from "../db/client.js";
import {
  claimContestScores,
  claimNodes,
  guilds,
  players,
  users,
} from "../db/schema.js";
import type { ActionResult } from "./actions/farming.js";
import { clearGuildBank } from "./guildBank.js";

const inviteCodeAlphabet = customAlphabet(
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  GUILD.inviteCodeLength,
);

function playerByUserId(userId: string) {
  return db.select().from(players).where(eq(players.userId, userId)).get();
}

/**
 * Generates a unique guild invite code.
 */
function allocateInviteCode(): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = inviteCodeAlphabet();
    const hit = db
      .select()
      .from(guilds)
      .where(eq(guilds.inviteCode, code))
      .get();
    if (!hit) return code;
  }
  return inviteCodeAlphabet() + inviteCodeAlphabet().slice(0, 2);
}

function normalizeRank(raw: string | null | undefined): GuildRank | null {
  if (raw === "owner" || raw === "officer" || raw === "member") return raw;
  return null;
}

/**
 * Creates a guild; founder becomes owner with a fresh invite code.
 */
export function createGuild(
  userId: string,
  name: string,
): ActionResult & { guildName?: string; inviteCode?: string } {
  const player = playerByUserId(userId);
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (player.guildId) return { ok: false, error: ACTION_ERROR.guildAlreadyIn };

  const cleaned = name.trim().toLowerCase().replace(/[^a-z0-9_\- ]/g, "");
  if (cleaned.length < 3 || cleaned.length > 24) {
    return { ok: false, error: ACTION_ERROR.guildNameInvalid };
  }
  const existing = db.select().from(guilds).where(eq(guilds.name, cleaned)).get();
  if (existing) return { ok: false, error: ACTION_ERROR.guildExists };

  const id = nanoid();
  const inviteCode = allocateInviteCode();
  db.insert(guilds)
    .values({
      id,
      name: cleaned,
      ownerPlayerId: player.id,
      inviteCode,
      createdAt: Date.now(),
    })
    .run();
  db.update(players)
    .set({ guildId: id, guildRank: "owner" })
    .where(eq(players.id, player.id))
    .run();
  return { ok: true, guildName: cleaned, inviteCode };
}

/**
 * Joins a guild via invite code as a member.
 */
export function joinGuildByInvite(
  userId: string,
  inviteCode: string,
): ActionResult {
  const player = playerByUserId(userId);
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (player.guildId) return { ok: false, error: ACTION_ERROR.guildAlreadyIn };

  const cleaned = inviteCode.trim().toUpperCase();
  if (cleaned.length < 4) {
    return { ok: false, error: ACTION_ERROR.guildInviteInvalid };
  }
  const guild = db
    .select()
    .from(guilds)
    .where(eq(guilds.inviteCode, cleaned))
    .get();
  if (!guild) return { ok: false, error: ACTION_ERROR.guildInviteInvalid };

  db.update(players)
    .set({ guildId: guild.id, guildRank: "member" })
    .where(eq(players.id, player.id))
    .run();
  return { ok: true };
}

/**
 * Leaves the current guild; owner succession or dissolve when last member.
 */
export function leaveGuild(userId: string): ActionResult {
  const player = playerByUserId(userId);
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!player.guildId) return { ok: false, error: ACTION_ERROR.guildNotIn };

  const guildId = player.guildId;
  const members = db
    .select()
    .from(players)
    .where(eq(players.guildId, guildId))
    .all();

  db.update(players)
    .set({ guildId: null, guildRank: null })
    .where(eq(players.id, player.id))
    .run();

  const remaining = members.filter((m) => m.id !== player.id);
  if (remaining.length === 0) {
    clearGuildBank(guildId);
    db.delete(claimContestScores)
      .where(eq(claimContestScores.guildId, guildId))
      .run();
    db.update(claimNodes)
      .set({
        claimedGuildId: null,
        claimedAt: null,
        lastProduceAt: null,
        storedQty: 0,
        contestEndsAt: null,
      })
      .where(eq(claimNodes.claimedGuildId, guildId))
      .run();
    db.delete(guilds).where(eq(guilds.id, guildId)).run();
    return { ok: true };
  }

  const guild = db.select().from(guilds).where(eq(guilds.id, guildId)).get();
  if (guild && guild.ownerPlayerId === player.id) {
    const successor =
      remaining.find((m) => normalizeRank(m.guildRank) === "officer") ??
      remaining[0]!;
    db.update(players)
      .set({ guildRank: "owner" })
      .where(eq(players.id, successor.id))
      .run();
    db.update(guilds)
      .set({ ownerPlayerId: successor.id })
      .where(eq(guilds.id, guildId))
      .run();
  }

  return { ok: true };
}

/**
 * Rotates the invite code (owner or officer).
 */
export function regenerateInviteCode(userId: string): ActionResult & {
  inviteCode?: string;
} {
  const player = playerByUserId(userId);
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!player.guildId) return { ok: false, error: ACTION_ERROR.guildNotIn };
  const rank = normalizeRank(player.guildRank);
  if (rank !== "owner" && rank !== "officer") {
    return { ok: false, error: ACTION_ERROR.guildInviteForbidden };
  }

  const inviteCode = allocateInviteCode();
  db.update(guilds)
    .set({ inviteCode })
    .where(eq(guilds.id, player.guildId))
    .run();
  return { ok: true, inviteCode };
}

/**
 * Owner sets a member's rank to officer or member.
 */
export function setGuildMemberRank(
  userId: string,
  targetUsername: string,
  nextRank: string,
): ActionResult {
  if (nextRank !== "officer" && nextRank !== "member") {
    return { ok: false, error: ACTION_ERROR.guildRankInvalid };
  }
  const player = playerByUserId(userId);
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!player.guildId) return { ok: false, error: ACTION_ERROR.guildNotIn };
  if (normalizeRank(player.guildRank) !== "owner") {
    return { ok: false, error: ACTION_ERROR.guildRankForbidden };
  }

  const targetUser = db
    .select()
    .from(users)
    .where(eq(users.username, targetUsername.trim().toLowerCase()))
    .get();
  if (!targetUser) return { ok: false, error: ACTION_ERROR.guildTargetMissing };
  const target = db
    .select()
    .from(players)
    .where(
      and(
        eq(players.userId, targetUser.id),
        eq(players.guildId, player.guildId),
      ),
    )
    .get();
  if (!target) return { ok: false, error: ACTION_ERROR.guildTargetMissing };
  if (target.id === player.id) {
    return { ok: false, error: ACTION_ERROR.guildRankInvalid };
  }
  if (normalizeRank(target.guildRank) === "owner") {
    return { ok: false, error: ACTION_ERROR.guildRankInvalid };
  }

  db.update(players)
    .set({ guildRank: nextRank })
    .where(eq(players.id, target.id))
    .run();
  return { ok: true };
}

/**
 * Lists guild members for the caller's guild.
 */
export function listGuildMembers(
  userId: string,
): Array<{ username: string; rank: GuildRank }> {
  const player = playerByUserId(userId);
  if (!player?.guildId) return [];

  const rows = db
    .select({
      username: users.username,
      guildRank: players.guildRank,
    })
    .from(players)
    .innerJoin(users, eq(users.id, players.userId))
    .where(eq(players.guildId, player.guildId))
    .all();

  return rows.map((r) => ({
    username: r.username,
    rank: normalizeRank(r.guildRank) ?? "member",
  }));
}

/**
 * Lists guilds for discovery (names only — join requires invite).
 */
export function listGuilds(): Array<{ name: string; members: number }> {
  const rows = db.select().from(guilds).all();
  return rows.map((g) => ({
    name: g.name,
    members: db
      .select()
      .from(players)
      .where(eq(players.guildId, g.id))
      .all().length,
  }));
}

/**
 * Soft-offers the current guild invite code to a nearby player (PL189.2).
 * Does not change join-by-code / rank rules — only shares the existing code.
 *
 * @param userId - Offering officer / owner.
 * @param toUsername - Nearby recipient username.
 * @returns Action result plus payload for WS push when ok.
 */
export function offerGuildInviteToNearby(
  userId: string,
  toUsername: string,
): ActionResult & {
  toUserId?: string;
  code?: string;
  guildName?: string;
  fromUsername?: string;
} {
  const player = playerByUserId(userId);
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!player.guildId) return { ok: false, error: ACTION_ERROR.guildNotIn };
  const rank = normalizeRank(player.guildRank);
  if (rank !== "owner" && rank !== "officer") {
    return { ok: false, error: ACTION_ERROR.guildInviteForbidden };
  }

  const fromUser = db.select().from(users).where(eq(users.id, userId)).get();
  if (!fromUser) return { ok: false, error: ACTION_ERROR.playerMissing };

  const cleanedTo = toUsername.trim().toLowerCase();
  if (!cleanedTo) return { ok: false, error: ACTION_ERROR.mailPlayerMissing };
  if (cleanedTo === fromUser.username) {
    return { ok: false, error: ACTION_ERROR.mailSelf };
  }

  const toUser = db
    .select()
    .from(users)
    .where(eq(users.username, cleanedTo))
    .get();
  if (!toUser) return { ok: false, error: ACTION_ERROR.mailPlayerMissing };

  const toPlayer = db
    .select()
    .from(players)
    .where(eq(players.userId, toUser.id))
    .get();
  if (!toPlayer) return { ok: false, error: ACTION_ERROR.mailPlayerMissing };

  const guild = db
    .select()
    .from(guilds)
    .where(eq(guilds.id, player.guildId))
    .get();
  if (!guild?.inviteCode) {
    return { ok: false, error: ACTION_ERROR.guildInviteInvalid };
  }

  return {
    ok: true,
    toUserId: toUser.id,
    code: guild.inviteCode,
    guildName: guild.name,
    fromUsername: fromUser.username,
  };
}

/**
 * Resolves rank + invite visibility for player state DTO.
 */
export function guildStateForPlayer(player: {
  guildId: string | null;
  guildRank: string | null;
}): {
  guildName: string | null;
  guildRank: GuildRank | null;
  guildInviteCode: string | null;
} {
  if (!player.guildId) {
    return { guildName: null, guildRank: null, guildInviteCode: null };
  }
  const guild = db
    .select()
    .from(guilds)
    .where(eq(guilds.id, player.guildId))
    .get();
  const rank = normalizeRank(player.guildRank);
  const canSeeInvite = rank === "owner" || rank === "officer";
  return {
    guildName: guild?.name ?? null,
    guildRank: rank,
    guildInviteCode: canSeeInvite ? (guild?.inviteCode ?? null) : null,
  };
}
