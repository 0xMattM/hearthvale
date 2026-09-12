/**
 * Guild-create soft world reinforce (PL158.1).
 * Brief soft rim after guild create ok —
 * complements Created ephemeral (PL50.1) + membership open accent (PL140.2).
 * Guild / rank rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful guild create (PL158.1).
 * Quiet warm founding crest teal — charter kinship with membership open,
 * distinct from invite welcome blue + bank deposit/withdraw rims.
 */
export const GUILD_CREATE_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(112, 156, 148, 0.24)",
  outerRgba: "rgba(36, 64, 60, 0.4)",
} as const;

/**
 * Whether a successful guild create should flash the soft world rim (PL158.1).
 * True only on ok create; fail / refuse stay quiet. Guild rules unchanged.
 *
 * @param ok - Whether the guild create action succeeded.
 * @returns True when the soft guild-create rim should briefly flash.
 */
export function shouldFlashGuildCreateWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the guild-create reinforce (PL158.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function guildCreateWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = GUILD_CREATE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
