/**
 * Gather-success soft world reinforce leftover (PL161.1).
 * Brief soft rim after gather ok —
 * complements Chopped/Mined/Collected (PL43.1) + mint pad (PL131.2).
 * Yields / cooldowns unchanged; mute ok; fail silent.
 */

import { isGatherSuccessPadFlashBuilding } from "@game/shared";

/**
 * Brief soft world rim flash after a successful gather (PL161.1).
 * Quiet mint-lime kinship with gather settle pad — distinct from craft olive,
 * plant sprout green, inventory mint-olive pickup, and fish cool splash.
 */
export const GATHER_SUCCESS_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(126, 196, 120, 0.22)",
  outerRgba: "rgba(36, 72, 40, 0.38)",
} as const;

/**
 * Whether a successful gather should flash the soft world rim (PL161.1).
 * True only on ok gather for stump / ore / pen (same gate as mint pad PL131.2);
 * fishing dock → PL161.2; fail / refuse stay quiet. Yields unchanged.
 *
 * @param ok - Whether the gather action succeeded.
 * @param buildingType - Building that was gathered.
 * @returns True when the soft gather-success rim should briefly flash.
 */
export function shouldFlashGatherSuccessWorldReinforce(
  ok: boolean,
  buildingType: string,
): boolean {
  return ok === true && isGatherSuccessPadFlashBuilding(buildingType);
}

/**
 * CSS `background` radial gradient for the gather-success reinforce (PL161.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function gatherSuccessWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    GATHER_SUCCESS_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
