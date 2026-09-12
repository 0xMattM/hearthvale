/**
 * Scarce-Free-settle soft world reinforce leftover (PL165.2).
 * Brief soft rim when a city scarce station settles busy→Free —
 * complements Free settle flash PL119.1 + sticky Free/Busy PL8 / PL135.1.
 * Contention unchanged; mute ok; free→busy / idle quiet.
 */

import { shouldFlashScarceFreeSettleEdge } from "@game/shared";

/**
 * Brief soft world rim flash when a scarce city station frees (PL165.2).
 * Quiet cool Free cyan kinship with sticky Free cue — distinct from warm
 * busy peer pulse and travel-arrive Free cyan alone.
 */
export const SCARCE_FREE_SETTLE_WORLD_REINFORCE = {
  durationMs: 480,
  opacityPeak: 0.82,
  clearPct: 50,
  midPct: 76,
  midRgba: "rgba(120, 196, 208, 0.2)",
  outerRgba: "rgba(24, 56, 64, 0.36)",
} as const;

/**
 * Whether a scarce station busy→free edge should flash the soft world rim
 * (PL165.2). Same gate as pad settle flash (PL119.1).
 * Contention unchanged; free→busy / idle stay quiet.
 *
 * @param wasBusy - Prior contended state.
 * @param isBusy - Current contended state.
 * @returns True when the soft scarce-Free-settle rim should briefly flash.
 */
export function shouldFlashScarceFreeSettleWorldReinforce(
  wasBusy: boolean,
  isBusy: boolean,
): boolean {
  return shouldFlashScarceFreeSettleEdge(wasBusy, isBusy);
}

/**
 * CSS `background` radial gradient for the scarce-Free-settle reinforce (PL165.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function scarceFreeSettleWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    SCARCE_FREE_SETTLE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
