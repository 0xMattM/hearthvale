/**
 * In-memory player presence for multiplayer feel (F8.1+).
 * HTTP heartbeat + WebSocket land push (F8.3). Redis later.
 */

import { db } from "../db/client.js";
import { players } from "../db/schema.js";
import { getActiveLand } from "./land.js";
import { eq } from "drizzle-orm";
import { ACTION_ERROR } from "@game/shared";

const TTL_MS = 20_000;

export interface PresenceEntry {
  userId: string;
  username: string;
  landId: string;
  x: number;
  z: number;
  updatedAt: number;
}

const byUser = new Map<string, PresenceEntry>();

/**
 * Upserts a player's last known position on a land.
 */
export function reportPresence(input: {
  userId: string;
  username: string;
  landId: string;
  x: number;
  z: number;
}): { ok: true } | { ok: false; error: string } {
  if (!input.landId || typeof input.x !== "number" || typeof input.z !== "number") {
    return { ok: false, error: "Invalid presence payload." };
  }
  if (Number.isNaN(input.x) || Number.isNaN(input.z)) {
    return { ok: false, error: "Invalid presence payload." };
  }
  byUser.set(input.userId, {
    userId: input.userId,
    username: input.username,
    landId: input.landId,
    x: input.x,
    z: input.z,
    updatedAt: Date.now(),
  });
  return { ok: true };
}

/**
 * Active land id for presence / WS join (ignores client-claimed landId).
 *
 * Args:
 *   userId: Authenticated user.
 *
 * Returns:
 *   Land row id, or null if the player/land is missing.
 */
export function activeLandIdForUser(userId: string): string | null {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return null;
  return getActiveLand(player.id)?.id ?? null;
}

/**
 * Upserts presence on the player's server-authoritative active land.
 *
 * Args:
 *   input: userId, username, and claimed x/z (still client-trusted).
 *
 * Returns:
 *   ok plus the land id written, or an error.
 */
export function reportPresenceOnActiveLand(input: {
  userId: string;
  username: string;
  x: number;
  z: number;
}): { ok: true; landId: string } | { ok: false; error: string } {
  const landId = activeLandIdForUser(input.userId);
  if (!landId) return { ok: false, error: ACTION_ERROR.playerMissing };
  const result = reportPresence({
    userId: input.userId,
    username: input.username,
    landId,
    x: input.x,
    z: input.z,
  });
  if (!result.ok) return result;
  return { ok: true, landId };
}

/**
 * Lists fresh presence entries on a land, excluding the requester.
 */
export function listPresenceOnLand(
  landId: string,
  excludeUserId: string,
  now = Date.now(),
): Array<{ username: string; x: number; z: number; updatedAt: number }> {
  const out: Array<{
    username: string;
    x: number;
    z: number;
    updatedAt: number;
  }> = [];
  for (const entry of byUser.values()) {
    if (entry.userId === excludeUserId) continue;
    if (entry.landId !== landId) continue;
    if (now - entry.updatedAt > TTL_MS) continue;
    out.push({
      username: entry.username,
      x: entry.x,
      z: entry.z,
      updatedAt: entry.updatedAt,
    });
  }
  return out;
}

/**
 * Test helper.
 */
export function resetPresence(): void {
  byUser.clear();
}

/**
 * Fresh presence for one user, or null if missing/stale.
 */
export function getPresence(
  userId: string,
  now = Date.now(),
): PresenceEntry | null {
  const entry = byUser.get(userId);
  if (!entry) return null;
  if (now - entry.updatedAt > TTL_MS) return null;
  return entry;
}
