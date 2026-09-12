/**
 * Mail-claim soft world reinforce (PL152.2).
 * Brief soft rim after mail claim ok —
 * complements Parcel claimed ephemeral (PL17.2) + send rim (PL149.1).
 * Escrow / mailbox rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful mail claim (PL152.2).
 * Quiet cool sage-parchment — parcel-in kinship, distinct from warm
 * send parchment-gold + pending glance chrome.
 */
export const MAIL_CLAIM_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(168, 176, 140, 0.22)",
  outerRgba: "rgba(44, 52, 40, 0.38)",
} as const;

/**
 * Whether a successful mail claim should flash the soft world rim (PL152.2).
 * True only on ok claim; fail / refuse stay quiet. Escrow rules unchanged.
 *
 * @param ok - Whether the claim action succeeded.
 * @returns True when the soft mail-claim rim should briefly flash.
 */
export function shouldFlashMailClaimWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the mail-claim reinforce (PL152.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function mailClaimWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = MAIL_CLAIM_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
