/**
 * Craft-complete soft world reinforce leftover (PL159.2).
 * Brief soft rim after craft ok —
 * complements craft olive bench pad (PL131.1) + inventory pickup flash (PL128.2).
 * Recipes / XP unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful craft (PL159.2).
 * Quiet sprout-olive kinship with bench settle pad — distinct from
 * inventory mint-olive pickup chrome + eat olive recovery + plant sprout green.
 */
export const CRAFT_COMPLETE_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(140, 168, 80, 0.22)",
  outerRgba: "rgba(48, 64, 28, 0.38)",
} as const;

/**
 * Whether a successful craft should flash the soft world rim (PL159.2).
 * True only on ok craft; fail / refuse stay quiet. Recipes unchanged.
 *
 * @param ok - Whether the craft action succeeded.
 * @returns True when the soft craft-complete rim should briefly flash.
 */
export function shouldFlashCraftCompleteWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the craft-complete reinforce (PL159.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function craftCompleteWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    CRAFT_COMPLETE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
