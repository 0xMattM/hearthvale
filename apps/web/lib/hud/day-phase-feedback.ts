/**
 * Day-phase soft world reinforce leftover (PL160.2).
 * Brief soft rim when cosmetic day phase flips into Dawn / Dusk / Night —
 * complements TopBar day phase (PL2.2) + phase soft cue (PL57.2) +
 * city day-phase atmosphere / edge haze (PL122.2).
 * Clocks unchanged; mute ok; Day / hydrate seed / cycle-off quiet.
 */

import { shouldFlashDayPhaseChangeCue } from "./success-cue";

/**
 * Brief soft world rim flash when cosmetic day phase edges into
 * Dawn / Dusk / Night (PL160.2). Quiet twilight-sky kinship with phase
 * chrome — distinct from hunt trail-gold / craft olive / arena dust rims.
 */
export const DAY_PHASE_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.82,
  clearPct: 50,
  midPct: 76,
  midRgba: "rgba(128, 148, 196, 0.2)",
  outerRgba: "rgba(36, 44, 72, 0.36)",
} as const;

/**
 * Whether a cosmetic day-phase edge should flash the soft world rim (PL160.2).
 * Same gate as TopBar Dawn/Dusk/Night cue (PL57.2): cycle on; Day quiet;
 * first hydrate sample seeds without flashing. Clocks unchanged.
 *
 * @param prevLabel - Previous cosmetic phase label (null before first sample).
 * @param nextLabel - Current cosmetic phase label.
 * @param cycleEnabled - Client dayNightCycle preference.
 * @returns True when the soft day-phase rim should briefly flash.
 */
export function shouldFlashDayPhaseWorldReinforce(
  prevLabel: string | null | undefined,
  nextLabel: string | null | undefined,
  cycleEnabled: boolean,
): boolean {
  return shouldFlashDayPhaseChangeCue(prevLabel, nextLabel, cycleEnabled);
}

/**
 * CSS `background` radial gradient for the day-phase reinforce (PL160.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function dayPhaseWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = DAY_PHASE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
