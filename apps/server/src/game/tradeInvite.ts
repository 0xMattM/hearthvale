import { WORLD } from "@game/shared";
import { getPresence } from "./presence.js";

/** Soft trade-ping radius — about two grid cells. */
export const TRADE_PING_RANGE = WORLD.GRID * 2;

/**
 * Whether two players share a land and are within trade-ping range.
 */
export function arePlayersNearbyForTrade(
  userIdA: string,
  userIdB: string,
  now = Date.now(),
): boolean {
  const a = getPresence(userIdA, now);
  const b = getPresence(userIdB, now);
  if (!a || !b) return false;
  if (a.landId !== b.landId) return false;
  return Math.hypot(a.x - b.x, a.z - b.z) <= TRADE_PING_RANGE;
}
