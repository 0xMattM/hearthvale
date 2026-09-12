/**
 * Invite-accept soft world reinforce (PL148.2).
 * Brief soft rim when a guild invite accept (join-by-code) succeeds —
 * complements Joined ephemeral (PL50.1) + membership open accent (PL140.2).
 * Invite / rank rules unchanged; mute ok; fail silent. No invite column invent.
 */

/**
 * Brief soft world rim flash after a successful guild invite accept (PL148.2).
 * Quiet welcome kinship-blue with membership open accent — distinct from
 * bank deposit/withdraw rims + trade handshake sage.
 */
export const INVITE_ACCEPT_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(96, 140, 164, 0.22)",
  outerRgba: "rgba(44, 72, 92, 0.38)",
} as const;

/**
 * Whether a successful invite accept should flash the soft world rim (PL148.2).
 * True only on ok join-by-code; fail / refuse stay quiet. Invite rules unchanged.
 *
 * @param ok - Whether the invite accept (join) action succeeded.
 * @returns True when the soft invite-accept rim should briefly flash.
 */
export function shouldFlashInviteAcceptWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the invite-accept reinforce (PL148.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function inviteAcceptWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = INVITE_ACCEPT_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
