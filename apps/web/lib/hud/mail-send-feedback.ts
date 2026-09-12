/**
 * Mail-send soft world reinforce (PL149.1).
 * Brief soft rim after mail send ok —
 * complements Parcel sent ephemeral (PL28.2) + mail pending glance (PL133.1).
 * Escrow / mailbox rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful mail send (PL149.1).
 * Quiet warm parchment-gold kinship with unread mail accent — distinct from
 * coins gain gold + chat seafoam + invite kinship-blue.
 */
export const MAIL_SEND_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(196, 168, 104, 0.22)",
  outerRgba: "rgba(72, 56, 28, 0.38)",
} as const;

/**
 * Whether a successful mail send should flash the soft world rim (PL149.1).
 * True only on ok send; fail / refuse stay quiet. Escrow rules unchanged.
 *
 * @param ok - Whether the mail send action succeeded.
 * @returns True when the soft mail-send rim should briefly flash.
 */
export function shouldFlashMailSendWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the mail-send reinforce (PL149.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function mailSendWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = MAIL_SEND_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
