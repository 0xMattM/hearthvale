/**
 * Fish-catch soft world reinforce leftover (PL161.2).
 * Brief soft rim after fish catch ok —
 * complements Caught + cool splash (PL132.1) + ready shimmer (PL118.2).
 * Catch rates / cooldown unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful fish catch (PL161.2).
 * Quiet cool water kinship with dock splash — distinct from mint gather rim,
 * ready teal shimmer, and craft olive.
 */
export const FISH_CATCH_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.86,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(110, 196, 216, 0.22)",
  outerRgba: "rgba(28, 64, 88, 0.4)",
} as const;

/**
 * Whether a successful fish catch should flash the soft world rim (PL161.2).
 * True only on ok catch for fishing_dock; stump/ore/pen → PL161.1;
 * fail / refuse stay quiet. Catch rates unchanged.
 *
 * @param ok - Whether the gather/catch action succeeded.
 * @param buildingType - Building that was gathered.
 * @returns True when the soft fish-catch rim should briefly flash.
 */
export function shouldFlashFishCatchWorldReinforce(
  ok: boolean,
  buildingType: string,
): boolean {
  return ok === true && buildingType === "fishing_dock";
}

/**
 * CSS `background` radial gradient for the fish-catch reinforce (PL161.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function fishCatchWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = FISH_CATCH_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
