/**
 * Soft-refuse busy soft world reinforce leftover (PL179.2).
 * Brief soft rim when scarce/busy interact soft-refuses —
 * complements Busy ephemeral (PL42.1) + busy peer pulse (PL115.1).
 * Distinct from observational free→busy rim (PL166.1). Contention unchanged; mute ok.
 */

import { ACTION_ERROR } from "@game/shared";

/**
 * Brief soft world rim flash when a scarce busy interact soft-refuses (PL179.2).
 * Quiet dusty rose refuse settle — kinship with Busy ephemeral, distinct from
 * warm Busy coral free→busy rim (PL166.1) + Free settle cyan.
 */
export const SOFT_REFUSE_BUSY_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.82,
  clearPct: 50,
  midPct: 76,
  midRgba: "rgba(176, 112, 120, 0.2)",
  outerRgba: "rgba(56, 28, 36, 0.36)",
} as const;

/**
 * Whether a failed action should flash the soft-refuse busy world rim (PL179.2).
 * Same gate as Busy ephemeral (PL42.1). Contention unchanged; other refuses quiet.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the soft busy-refuse rim should briefly flash.
 */
export function shouldFlashSoftRefuseBusyWorldReinforce(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.stationBusy;
}

/**
 * CSS `background` radial gradient for the soft-refuse busy reinforce (PL179.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function softRefuseBusyWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    SOFT_REFUSE_BUSY_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
