/**
 * Mail-cancel soft world reinforce (PL157.2).
 * Brief soft rim after mail cancel ok —
 * complements Parcel cancelled (PL28.2) + send/claim rims (PL149.1 / PL152.2).
 * Escrow unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful mail cancel (PL157.2).
 * Quiet cool dusty parchment-ash — parcel withdrawn kinship, distinct from
 * send parchment-gold + claim sage-parchment + pending glance chrome.
 */
export const MAIL_CANCEL_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(140, 132, 112, 0.22)",
  outerRgba: "rgba(52, 48, 40, 0.38)",
} as const;

/**
 * Whether a successful mail cancel should flash the soft world rim (PL157.2).
 * True only on ok cancel; fail / refuse stay quiet. Escrow unchanged.
 *
 * @param ok - Whether the cancel action succeeded.
 * @returns True when the soft mail-cancel rim should briefly flash.
 */
export function shouldFlashMailCancelWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the mail-cancel reinforce (PL157.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function mailCancelWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = MAIL_CANCEL_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
