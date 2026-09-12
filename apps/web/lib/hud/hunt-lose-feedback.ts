/**
 * Hunt-lose soft world reinforce leftover (PL179.1).
 * Brief soft rim after hunt lose ok —
 * complements Lost · foe ephemeral (PL33.2) + hunt-win rim (PL159.1).
 * Hunt rates / XP unchanged; mute ok; fail silent (missing encounter stays quiet).
 */

/**
 * Brief soft world rim flash after an Explore hunt lose (PL179.1).
 * Quiet cool trail-ash settle — kinship with Lost · foe, distinct from
 * warm trail-gold win rim + guild-leave cool mist + soft-war ember.
 */
export const HUNT_LOSE_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.8,
  clearPct: 50,
  midPct: 76,
  midRgba: "rgba(112, 108, 132, 0.2)",
  outerRgba: "rgba(40, 36, 56, 0.36)",
} as const;

/**
 * Whether a hunt encounter should flash the soft lose rim (PL179.1).
 * True only on explicit lose; win / missing / fail stay quiet. Hunt rules unchanged.
 *
 * @param won - Whether the hunt encounter was won.
 * @returns True when the soft hunt-lose rim should briefly flash.
 */
export function shouldFlashHuntLoseWorldReinforce(
  won: boolean | null | undefined,
): boolean {
  return won === false;
}

/**
 * CSS `background` radial gradient for the hunt-lose reinforce (PL179.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function huntLoseWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = HUNT_LOSE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
