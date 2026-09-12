/**
 * Decor-place soft world reinforce (PL149.2).
 * Brief soft rim after decor place ok —
 * complements decor SFX + Decor placed ephemeral (PL16.2).
 * Decor costs / slots unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful decor place (PL149.2).
 * Quiet warm rosewood blush — distinct from mail parchment, title amber,
 * and build-place timber pad flashes.
 */
export const DECOR_PLACE_WORLD_REINFORCE = {
  durationMs: 480,
  opacityPeak: 0.82,
  clearPct: 49,
  midPct: 75,
  midRgba: "rgba(168, 120, 108, 0.22)",
  outerRgba: "rgba(72, 44, 40, 0.36)",
} as const;

/**
 * Whether a successful decor place should flash the soft world rim (PL149.2).
 * True only on ok place; fail / refuse stay quiet. Costs / slots unchanged.
 *
 * @param ok - Whether the decor place action succeeded.
 * @returns True when the soft decor-place rim should briefly flash.
 */
export function shouldFlashDecorPlaceWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the decor-place reinforce (PL149.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function decorPlaceWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = DECOR_PLACE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
