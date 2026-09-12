/**
 * Crop-harvest soft world reinforce (PL151.2).
 * Brief soft rim after harvest ok — complements plant sprout PL127.2 +
 * ready rim PL142.2 + Harvested ephemeral. Grow timers / yield unchanged;
 * mute ok; fail silent; not a HUD column.
 */

/**
 * Brief soft world rim flash after a successful crop harvest (PL151.2).
 * Quiet wheat-gold kinship with yield — distinct from ready lime + sprout green.
 */
export const CROP_HARVEST_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.88,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(184, 152, 56, 0.22)",
  outerRgba: "rgba(96, 72, 24, 0.4)",
} as const;

/**
 * Whether a successful harvest should flash the soft world rim (PL151.2).
 * True only on ok harvest; fail / not-ready stay quiet. Yield unchanged.
 *
 * @param ok - Whether the harvest action succeeded.
 * @returns True when the soft harvest rim should briefly flash.
 */
export function shouldFlashCropHarvestWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the crop-harvest reinforce (PL151.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function cropHarvestWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = CROP_HARVEST_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
