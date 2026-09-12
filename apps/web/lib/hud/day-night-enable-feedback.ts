/**
 * Day-night-enable soft world reinforce leftover (PL164.2).
 * Brief soft rim when day/night cycle is enabled from settings —
 * complements soft confirm chip (PL130.1) + day-phase rim (PL160.2).
 * Clocks unchanged; mute ok; disable / no-op quiet.
 */

import { shouldFlashDayNightEnableConfirm } from "./day-night-enable-confirm";

/**
 * Brief soft world rim flash when enabling the cosmetic day/night cycle
 * (PL164.2). Quiet dawn-slate kinship with settings enable chrome — distinct
 * from phase-edge twilight (PL160.2) and cool Free travel cyan (PL164.1).
 */
export const DAY_NIGHT_ENABLE_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.84,
  clearPct: 50,
  midPct: 76,
  midRgba: "rgba(156, 176, 220, 0.22)",
  outerRgba: "rgba(44, 56, 92, 0.38)",
} as const;

/**
 * Whether enabling day/night should flash the soft world rim (PL164.2).
 * Same gate as settings-row confirm (PL130.1): false→true only.
 * Clocks unchanged; disable / no-op stay quiet.
 *
 * @param previousEnabled - Day/night flag before the change.
 * @param nextEnabled - Day/night flag after the change.
 * @returns True when the soft day-night-enable rim should briefly flash.
 */
export function shouldFlashDayNightEnableWorldReinforce(
  previousEnabled: boolean,
  nextEnabled: boolean,
): boolean {
  return shouldFlashDayNightEnableConfirm(previousEnabled, nextEnabled);
}

/**
 * CSS `background` radial gradient for the day-night-enable reinforce (PL164.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function dayNightEnableWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    DAY_NIGHT_ENABLE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
