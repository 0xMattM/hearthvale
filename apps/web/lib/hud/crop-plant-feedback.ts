/**
 * Crop plant success soft world reinforce (PL127.2).
 * Brief sprout-green edge rim on successful seed plant — complements
 * plant SFX + Planted cue so empty→growing reads clearly.
 * Grow timers / seed rules unchanged; mute ok; not a HUD column.
 */

/**
 * Brief soft world rim flash after a successful crop plant (PL127.2).
 * Fresh sprout-green kinship with growing sway pad — distinct from eat olive.
 */
export const CROP_PLANT_SUCCESS_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.94,
  clearPct: 47,
  midPct: 73,
  midRgba: "rgba(72, 110, 42, 0.22)",
  outerRgba: "rgba(36, 72, 28, 0.42)",
} as const;

/**
 * Whether a successful plant should flash the world reinforce (PL127.2).
 * True only on ok plant; refuse / occupied / missing seed stay quiet.
 *
 * @param ok - Whether the plant API / apply succeeded.
 * @returns True when the soft sprout rim should briefly flash.
 */
export function shouldFlashCropPlantSuccessWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the plant-success reinforce (PL127.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function cropPlantSuccessWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    CROP_PLANT_SUCCESS_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
