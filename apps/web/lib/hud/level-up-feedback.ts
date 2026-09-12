/**
 * Level-up soft world reinforce (PL135.2).
 * Brief soft progress rim when character level rises — complements
 * Level N ephemeral (PL47.1) + coins-gain rim (PL126.2).
 * XP curve / titles unchanged; mute ok; no XP bar invent.
 */

/**
 * Brief soft world rim flash after character level rises (PL135.2).
 * Cool sage-teal progress kinship — distinct from warm coin gold.
 */
export const LEVEL_UP_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.9,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(56, 96, 84, 0.24)",
  outerRgba: "rgba(28, 56, 48, 0.44)",
} as const;

/**
 * Whether character level rise should flash the world reinforce (PL135.2).
 * True only when level rises vs a prior snapshot (login hydrate skips).
 *
 * @param prevLevel - Character level before the change (null skips).
 * @param nextLevel - Character level after the change.
 * @returns True when the soft progress rim should briefly flash.
 */
export function shouldFlashLevelUpWorldReinforce(
  prevLevel: number | null | undefined,
  nextLevel: number,
): boolean {
  if (prevLevel == null || !Number.isFinite(prevLevel)) return false;
  if (!Number.isFinite(nextLevel)) return false;
  return nextLevel > prevLevel;
}

/**
 * CSS `background` radial gradient for the level-up reinforce (PL135.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function levelUpWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = LEVEL_UP_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
