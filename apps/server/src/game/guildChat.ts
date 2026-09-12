/**
 * Per-guild chat ring buffers (F12.5) — separate from world chat.
 */

import { ACTION_ERROR } from "@game/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { players, users } from "../db/schema.js";
import type { ChatMessage } from "./chat.js";
import { pushToUser } from "../ws/hub.js";

const MAX = 80;
const buffers = new Map<string, ChatMessage[]>();
let seq = 0;

/**
 * Clears all guild chat buffers (tests).
 */
export function resetGuildChat(): void {
  buffers.clear();
  seq = 0;
}

function bufferFor(guildId: string): ChatMessage[] {
  let list = buffers.get(guildId);
  if (!list) {
    list = [];
    buffers.set(guildId, list);
  }
  return list;
}

/**
 * Recent guild chat lines for the caller's guild (newest-last).
 */
export function listGuildChat(
  userId: string,
  limit = 40,
): { ok: true; messages: ChatMessage[] } | { ok: false; error: string } {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!player.guildId) return { ok: false, error: ACTION_ERROR.guildNotIn };
  const list = bufferFor(player.guildId);
  return {
    ok: true,
    messages: list.slice(-Math.max(1, Math.min(limit, MAX))),
  };
}

/**
 * Posts to the caller's guild channel and pushes to online members.
 */
export function postGuildChat(
  userId: string,
  text: string,
):
  | { ok: true; message: ChatMessage; guildId: string }
  | { ok: false; error: string } {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!player.guildId) return { ok: false, error: ACTION_ERROR.guildNotIn };

  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return { ok: false, error: ACTION_ERROR.playerMissing };

  const cleaned = text.trim().slice(0, 160);
  if (!cleaned) return { ok: false, error: "Type a message first." };

  const message: ChatMessage = {
    id: `g${++seq}`,
    username: user.username,
    text: cleaned,
    t: Date.now(),
  };
  const list = bufferFor(player.guildId);
  list.push(message);
  if (list.length > MAX) list.shift();

  broadcastGuildChat(player.guildId, message);
  return { ok: true, message, guildId: player.guildId };
}

/**
 * Pushes a guild chat line to all connected guild members.
 */
export function broadcastGuildChat(
  guildId: string,
  message: ChatMessage,
): void {
  const members = db
    .select({ userId: players.userId })
    .from(players)
    .where(eq(players.guildId, guildId))
    .all();
  const payload = { type: "guild_chat" as const, message };
  for (const m of members) {
    pushToUser(m.userId, payload);
  }
}
