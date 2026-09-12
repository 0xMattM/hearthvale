/**
 * Quest-claim soft world reinforce (PL138.2).
 * Brief soft progress rim when a starter quest claim succeeds —
 * complements Quest claimed ephemeral (PL29.3) + coins-gain rim (PL126.2).
 * Quest rewards / catalog unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful quest claim (PL138.2).
 * Soft verdant quest kinship — distinct from warm coin gold + market teal.
 */
export const QUEST_CLAIM_WORLD_REINFORCE = {
  durationMs: 510,
  opacityPeak: 0.9,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(56, 100, 64, 0.22)",
  outerRgba: "rgba(28, 56, 36, 0.42)",
} as const;

/**
 * Whether a successful quest claim should flash the world reinforce (PL138.2).
 * True only on ok claim; fail / already-claimed refuse stay quiet.
 *
 * @param ok - Whether the quest claim action succeeded.
 * @returns True when the soft quest-claim rim should briefly flash.
 */
export function shouldFlashQuestClaimWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the quest-claim reinforce (PL138.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function questClaimWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = QUEST_CLAIM_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
