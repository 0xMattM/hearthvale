import { isCityLandKind, isStationContendedByPresence } from "@game/shared";
import { listPresenceOnLand } from "./presence.js";

/**
 * Soft scarce-city station lock (CL52.3 / CL60 / CL63 / CL65.2): another fresh presence
 * already standing in interact range of this station blocks the second crafter, gatherer,
 * or planter (kitchen/forge/mill/workshop/loom/alchemy + tree/ore + fishing dock + crop_plot).
 * Player land / Explore are unlimited — never contended. No daily/qty caps.
 * Presence geometry SoT: shared `isStationContendedByPresence` (PL8.1 client cue parity).
 */
export function isCityStationContendedByOther(
  landKind: string,
  landId: string,
  stationGridX: number,
  stationGridZ: number,
  excludeUserId: string,
  now = Date.now(),
): boolean {
  if (!isCityLandKind(landKind)) return false;
  const others = listPresenceOnLand(landId, excludeUserId, now);
  return isStationContendedByPresence(stationGridX, stationGridZ, others);
}
