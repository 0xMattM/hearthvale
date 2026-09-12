import {
  liveCombatDto,
  type LiveCombatDto,
  type LiveCombatState,
} from "@game/shared";

const sessions = new Map<string, LiveCombatState>();

/**
 * Returns the in-memory fight for a player, if any.
 *
 * @param playerId - Player row id.
 */
export function getCombatSession(
  playerId: string,
): LiveCombatState | undefined {
  return sessions.get(playerId);
}

/**
 * Stores or replaces the live fight session.
 *
 * @param playerId - Player row id.
 * @param state - Session snapshot.
 */
export function setCombatSession(
  playerId: string,
  state: LiveCombatState,
): void {
  sessions.set(playerId, state);
}

/**
 * Drops an in-progress fight (travel / settle / logout).
 *
 * @param playerId - Player row id.
 */
export function clearCombatSession(playerId: string): void {
  sessions.delete(playerId);
}

/**
 * Snapshot of every open fight (server heartbeat).
 *
 * @returns Player-id / session pairs.
 */
export function listCombatSessions(): Array<[string, LiveCombatState]> {
  return Array.from(sessions.entries());
}

/**
 * HUD snapshot for an open fight, or null when idle.
 *
 * @param playerId - Player row id.
 * @param now - Server epoch ms.
 */
export function combatDtoForPlayer(
  playerId: string,
  now = Date.now(),
): LiveCombatDto | null {
  const session = sessions.get(playerId);
  if (!session) return null;
  return liveCombatDto(session, now);
}
