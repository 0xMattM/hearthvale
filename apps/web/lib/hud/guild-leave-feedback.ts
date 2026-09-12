/**
 * Guild-leave soft world reinforce (PL158.2).
 * Brief soft rim after guild leave ok —
 * complements Left ephemeral (PL50.2) + membership open accent (PL140.2).
 * Guild / rank rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful guild leave (PL158.2).
 * Quiet cool membership-release mist — departure kinship, distinct from
 * create founding teal + invite welcome blue + trade cancel mist.
 */
export const GUILD_LEAVE_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.82,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(108, 124, 140, 0.2)",
  outerRgba: "rgba(40, 52, 64, 0.36)",
} as const;

/**
 * Whether a successful guild leave should flash the soft world rim (PL158.2).
 * True only on ok leave; fail / refuse stay quiet. Guild rules unchanged.
 *
 * @param ok - Whether the guild leave action succeeded.
 * @returns True when the soft guild-leave rim should briefly flash.
 */
export function shouldFlashGuildLeaveWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the guild-leave reinforce (PL158.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function guildLeaveWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = GUILD_LEAVE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
