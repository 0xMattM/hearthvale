/**
 * Trade-cancel soft world reinforce (PL157.1).
 * Brief soft rim after trade cancel ok —
 * complements Cancelled ephemeral (PL62.1) + accept rim (PL143.1).
 * Escrow unchanged; mute ok; fail silent; incoming reject stays quiet.
 */

/**
 * Brief soft world rim flash after a successful outgoing trade cancel (PL157.1).
 * Quiet cool release mist — withdrawn-offer kinship, distinct from
 * accept handshake sage + market list teal + chat seafoam.
 */
export const TRADE_CANCEL_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(96, 116, 112, 0.22)",
  outerRgba: "rgba(36, 48, 48, 0.4)",
} as const;

/**
 * Whether a successful trade cancel should flash the soft world rim (PL157.1).
 * True only on ok outgoing cancel (same gate as Cancelled cue); incoming
 * reject / fail stay quiet. Escrow unchanged.
 *
 * @param ok - Whether the cancel/reject action succeeded.
 * @param direction - Pending trade direction from the panel list.
 * @returns True when the soft trade-cancel rim should briefly flash.
 */
export function shouldFlashTradeCancelWorldReinforce(
  ok: boolean,
  direction: "incoming" | "outgoing" | null | undefined,
): boolean {
  return ok === true && direction === "outgoing";
}

/**
 * CSS `background` radial gradient for the trade-cancel reinforce (PL157.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function tradeCancelWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = TRADE_CANCEL_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
