/**
 * Hunt-win soft world reinforce leftover (PL159.1).
 * Brief soft rim after hunt win ok —
 * complements Won · foe ephemeral (PL33.2) + trail ready wayfinding cues.
 * Hunt rates / XP unchanged; mute ok; fail silent (lose uses PL179.1 rim).
 */

/**
 * Brief soft world rim flash after a successful Explore hunt win (PL159.1).
 * Quiet warm trail-gold kinship with ready path / creature cues — distinct from
 * soft-war ember deliver + level-up sage + coins gold.
 */
export const HUNT_WIN_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(180, 148, 88, 0.24)",
  outerRgba: "rgba(72, 52, 28, 0.4)",
} as const;

/**
 * Whether a hunt encounter should flash the soft win rim (PL159.1).
 * True only on won encounter; lose uses its own rim; missing / fail stay quiet. Hunt rules unchanged.
 *
 * @param won - Whether the hunt encounter was won.
 * @returns True when the soft hunt-win rim should briefly flash.
 */
export function shouldFlashHuntWinWorldReinforce(
  won: boolean | null | undefined,
): boolean {
  return won === true;
}

/**
 * CSS `background` radial gradient for the hunt-win reinforce (PL159.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function huntWinWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = HUNT_WIN_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
