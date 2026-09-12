/**
 * WebSocket hub — land channels for presence + chat push (F8.3).
 * RF4.3: land / user indexes avoid full-set scans on land broadcast.
 */

import type { WebSocket } from "ws";
import type { ChatMessage } from "../game/chat.js";

export interface WsClient {
  socket: WebSocket;
  userId: string;
  username: string;
  landId: string | null;
}

const clients = new Set<WsClient>();
const byLand = new Map<string, Set<WsClient>>();
const byUser = new Map<string, Set<WsClient>>();

function addToIndex(
  map: Map<string, Set<WsClient>>,
  key: string,
  client: WsClient,
): void {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(client);
}

function removeFromIndex(
  map: Map<string, Set<WsClient>>,
  key: string,
  client: WsClient,
): void {
  const set = map.get(key);
  if (!set) return;
  set.delete(client);
  if (set.size === 0) map.delete(key);
}

/**
 * Registers an authenticated socket (not yet on a land).
 */
export function addClient(client: WsClient): void {
  clients.add(client);
  addToIndex(byUser, client.userId, client);
  if (client.landId) addToIndex(byLand, client.landId, client);
}

/**
 * Removes a socket from the hub.
 */
export function removeClient(socket: WebSocket): void {
  for (const c of clients) {
    if (c.socket !== socket) continue;
    clients.delete(c);
    removeFromIndex(byUser, c.userId, c);
    if (c.landId) removeFromIndex(byLand, c.landId, c);
    return;
  }
}

/**
 * Puts client on a land channel.
 */
export function joinLand(socket: WebSocket, landId: string): void {
  for (const c of clients) {
    if (c.socket !== socket) continue;
    if (c.landId) removeFromIndex(byLand, c.landId, c);
    c.landId = landId;
    addToIndex(byLand, landId, c);
    return;
  }
}

/**
 * Broadcast JSON to everyone on a land (optional exclude userId).
 */
export function broadcastLand(
  landId: string,
  payload: unknown,
  excludeUserId?: string,
): number {
  const raw = JSON.stringify(payload);
  let n = 0;
  const set = byLand.get(landId);
  if (!set) return 0;
  for (const c of set) {
    if (excludeUserId && c.userId === excludeUserId) continue;
    if (c.socket.readyState !== 1 /* OPEN */) continue;
    c.socket.send(raw);
    n += 1;
  }
  return n;
}

/**
 * Pushes a chat message to a land channel (and world listeners on that land).
 */
export function pushChat(landId: string | null, message: ChatMessage): void {
  const payload = { type: "chat", message };
  if (landId) {
    broadcastLand(landId, payload);
    return;
  }
  // World chat: send to all connected clients.
  const raw = JSON.stringify(payload);
  for (const c of clients) {
    if (c.socket.readyState !== 1) continue;
    c.socket.send(raw);
  }
}

/**
 * Pushes presence snapshot or update to a land.
 */
export function pushPresence(
  landId: string,
  others: Array<{ username: string; x: number; z: number }>,
): void {
  broadcastLand(landId, { type: "presence", others });
}

/**
 * Sends a JSON payload to one connected user (all their sockets).
 */
export function pushToUser(userId: string, payload: unknown): number {
  const raw = JSON.stringify(payload);
  let n = 0;
  const set = byUser.get(userId);
  if (!set) return 0;
  for (const c of set) {
    if (c.socket.readyState !== 1) continue;
    c.socket.send(raw);
    n += 1;
  }
  return n;
}

/**
 * Soft guild invite offer ping (PL189.2) — only if caller already checked nearby.
 * Shares the existing invite code; join-by-code SoT unchanged.
 */
export function pushGuildInvite(
  toUserId: string,
  invite: { code: string; fromUsername: string; guildName?: string },
): number {
  return pushToUser(toUserId, { type: "guild_invite", ...invite });
}

export function pushTradeInvite(
  toUserId: string,
  trade: { tradeId: string; fromUsername: string },
): number {
  return pushToUser(toUserId, { type: "trade_invite", ...trade });
}

/**
 * Test helper — clears hub state.
 */
export function resetHub(): void {
  clients.clear();
  byLand.clear();
  byUser.clear();
}

/**
 * Test helper — count clients on a land.
 */
export function countOnLand(landId: string): number {
  return byLand.get(landId)?.size ?? 0;
}
