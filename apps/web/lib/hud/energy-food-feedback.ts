/**
 * Energy / food / health world feedback (PL124.1–PL124.2 / PL126.1).
 * Soft edge vignette while energy is low (complements TopBar PL9.1);
 * brief recovery rim flash on successful eat (complements eat SFX + Ate cue);
 * soft cool/danger edge vignette while health is low (complements TopBar PL67.1).
 * Threshold SoT / food restore rules unchanged; mute ok; not a HUD column.
 */

import { isEnergyLow, isHealthLow } from "@game/shared";

/**
 * Quiet edge vignette while energy is in the low band (PL124.1).
 * Warm danger-amber kinship with TopBar meter warn — world-readable, min HUD.
 */
export const ENERGY_LOW_WORLD_VIGNETTE = {
  /** Peak CSS opacity while low (clears when recovered). */
  opacity: 0.9,
  /** Clear center so gameplay stays readable. */
  clearPct: 52,
  midPct: 76,
  midRgba: "rgba(90, 48, 28, 0.2)",
  outerRgba: "rgba(68, 28, 22, 0.48)",
} as const;

/**
 * Quiet cool/danger edge vignette while health is in the low band (PL126.1).
 * Cool crimson kinship with TopBar HP · low — distinct from energy amber rim.
 */
export const HEALTH_LOW_WORLD_VIGNETTE = {
  opacity: 0.88,
  clearPct: 50,
  midPct: 74,
  midRgba: "rgba(48, 22, 36, 0.22)",
  outerRgba: "rgba(52, 14, 28, 0.5)",
} as const;

/**
 * Brief soft world rim flash after a successful eat (PL124.2).
 * Warm olive recovery — food→energy loop, not the low-band warn rim.
 */
export const EAT_SUCCESS_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.95,
  clearPct: 46,
  midPct: 72,
  midRgba: "rgba(88, 112, 48, 0.2)",
  outerRgba: "rgba(42, 68, 32, 0.4)",
} as const;

/**
 * Whether the energy-low world vignette should render (PL124.1).
 * Uses ENERGY.lowWarnPct via `isEnergyLow`; clears when recovered.
 *
 * @param energy - Current energy.
 * @param maxEnergy - Max energy for this character.
 * @returns True when the soft edge vignette should show.
 */
export function shouldShowEnergyLowWorldVignette(
  energy: number,
  maxEnergy: number,
): boolean {
  return isEnergyLow(energy, maxEnergy);
}

/**
 * CSS `background` radial gradient for the energy-low edge vignette (PL124.1).
 *
 * @returns Radial-gradient string for the overlay.
 */
export function energyLowWorldVignetteBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = ENERGY_LOW_WORLD_VIGNETTE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}

/**
 * Whether the health-low world vignette should render (PL126.1).
 * Uses COMBAT.lowWarnPct via `isHealthLow`; clears when recovered.
 *
 * @param health - Current health.
 * @param maxHealth - Max health for this character.
 * @returns True when the soft cool/danger edge vignette should show.
 */
export function shouldShowHealthLowWorldVignette(
  health: number,
  maxHealth: number,
): boolean {
  return isHealthLow(health, maxHealth);
}

/**
 * CSS `background` radial gradient for the health-low edge vignette (PL126.1).
 *
 * @returns Radial-gradient string for the overlay.
 */
export function healthLowWorldVignetteBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = HEALTH_LOW_WORLD_VIGNETTE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}

/**
 * Whether a successful eat should flash the world reinforce (PL124.2).
 * True only on ok eat; empty / refuse stay quiet.
 *
 * @param ok - Whether the eat API / apply succeeded.
 * @returns True when the soft recovery rim should briefly flash.
 */
export function shouldFlashEatSuccessWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the eat-success reinforce (PL124.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function eatSuccessWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = EAT_SUCCESS_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
