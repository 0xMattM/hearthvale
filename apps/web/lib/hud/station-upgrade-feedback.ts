/**
 * Station-upgrade soft world reinforce leftover (PL162.1).
 * Brief soft rim after station upgrade ok —
 * complements Upgraded (PL48.1) + copper pad (PL137.1).
 * Costs / tiers unchanged; mute ok; fail silent.
 */

import { isUpgradableBuildingType } from "@game/shared";

/**
 * Brief soft world rim flash after a successful station upgrade (PL162.1).
 * Quiet warm copper kinship with upgrade settle pad — distinct from field-gold
 * expand, craft olive, and spawn amber.
 */
export const STATION_UPGRADE_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.86,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(200, 144, 88, 0.22)",
  outerRgba: "rgba(88, 52, 24, 0.4)",
} as const;

/**
 * Whether a successful station upgrade should flash the soft world rim (PL162.1).
 * True only on ok upgrade for an upgradable station (same gate as copper pad
 * PL137.1); fail / refuse stay quiet. Costs / tiers unchanged.
 *
 * @param ok - Whether the upgrade action succeeded.
 * @param buildingType - Station type that was upgraded.
 * @returns True when the soft upgrade rim should briefly flash.
 */
export function shouldFlashStationUpgradeWorldReinforce(
  ok: boolean,
  buildingType: string,
): boolean {
  return ok === true && isUpgradableBuildingType(buildingType);
}

/**
 * CSS `background` radial gradient for the station-upgrade reinforce (PL162.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function stationUpgradeWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    STATION_UPGRADE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
