/**
 * Achievement unlock soft world reinforce (PL136.1).
 * Brief soft unlock rim when an achievement flips locked→unlocked —
 * complements Unlocked · ephemeral (PL47.2) + level-up rim (PL135.2).
 * Unlock rules unchanged; mute ok; hydrate quiet; no HUD column invent.
 */

/**
 * Brief soft world rim flash after an achievement unlock (PL136.1).
 * Soft amber-violet unlock kinship — distinct from sage level-up + gold coins.
 */
export const ACHIEVEMENT_UNLOCK_WORLD_REINFORCE = {
  durationMs: 540,
  opacityPeak: 0.88,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(96, 72, 110, 0.22)",
  outerRgba: "rgba(56, 36, 72, 0.42)",
} as const;

/**
 * Whether newly unlocked achievement titles should flash the world reinforce (PL136.1).
 * True when at least one title flipped; empty / hydrate stay quiet.
 *
 * @param newlyUnlockedTitles - Titles from `newlyUnlockedAchievementTitles`.
 * @returns True when the soft unlock rim should briefly flash.
 */
export function shouldFlashAchievementUnlockWorldReinforce(
  newlyUnlockedTitles: readonly string[],
): boolean {
  return newlyUnlockedTitles.length > 0;
}

/**
 * CSS `background` radial gradient for the achievement-unlock reinforce (PL136.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function achievementUnlockWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    ACHIEVEMENT_UNLOCK_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
