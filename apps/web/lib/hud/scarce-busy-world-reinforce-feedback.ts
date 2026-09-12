/**
 * Scarce-busy soft world reinforce leftover (PL166.1).
 * Brief soft rim when a city scarce station edges free→busy —
 * complements busy peer pulse PL115.1 + Free settle rim PL165.2.
 * Contention unchanged; mute ok; busy→free / idle quiet.
 */

import { shouldPulseScarceBusyPeerEdge } from "@game/shared";

/**
 * Brief soft world rim flash when a scarce city station becomes busy (PL166.1).
 * Quiet warm Busy coral kinship with sticky Busy cue — distinct from cool
 * Free settle cyan rim and travel-arrive Free cyan alone.
 */
export const SCARCE_BUSY_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.84,
  clearPct: 50,
  midPct: 76,
  midRgba: "rgba(232, 120, 80, 0.22)",
  outerRgba: "rgba(72, 28, 24, 0.38)",
} as const;

/**
 * Whether a scarce station free→busy edge should flash the soft world rim
 * (PL166.1). Same gate as pad busy peer pulse (PL115.1).
 * Contention unchanged; busy→free / idle stay quiet.
 *
 * @param wasBusy - Prior contended state.
 * @param isBusy - Current contended state.
 * @returns True when the soft scarce-busy rim should briefly flash.
 */
export function shouldFlashScarceBusyWorldReinforce(
  wasBusy: boolean,
  isBusy: boolean,
): boolean {
  return shouldPulseScarceBusyPeerEdge(wasBusy, isBusy);
}

/**
 * CSS `background` radial gradient for the scarce-busy reinforce (PL166.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function scarceBusyWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = SCARCE_BUSY_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
