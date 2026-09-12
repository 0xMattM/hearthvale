/**
 * Title-change soft world reinforce (PL136.2).
 * Brief soft cosmetic rim when character title changes —
 * complements Title · ephemeral (PL49.1) + level-up rim (PL135.2).
 * Titles stay cosmetic (no combat power); mute ok; hydrate quiet.
 */

/**
 * Brief soft world rim flash after a cosmetic title change (PL136.2).
 * Soft warm ochre title kinship — distinct from sage level-up, violet unlock, gold coins.
 */
export const TITLE_CHANGE_WORLD_REINFORCE = {
  durationMs: 530,
  opacityPeak: 0.86,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(120, 92, 48, 0.22)",
  outerRgba: "rgba(64, 44, 24, 0.4)",
} as const;

/**
 * Whether a cosmetic title change should flash the world reinforce (PL136.2).
 * True only when title string changes vs a prior snapshot (login hydrate skips).
 * Same gate as Title · ephemeral (PL49.1).
 *
 * @param prevTitle - Title before the change (null skips).
 * @param nextTitle - Title after the change.
 * @returns True when the soft title rim should briefly flash.
 */
export function shouldFlashTitleChangeWorldReinforce(
  prevTitle: string | null | undefined,
  nextTitle: string | null | undefined,
): boolean {
  if (prevTitle == null || nextTitle == null) return false;
  const prev = prevTitle.trim();
  const next = nextTitle.trim();
  if (!prev || !next) return false;
  return prev !== next;
}

/**
 * CSS `background` radial gradient for the title-change reinforce (PL136.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function titleChangeWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = TITLE_CHANGE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
