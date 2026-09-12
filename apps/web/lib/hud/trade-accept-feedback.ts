/**
 * Trade-accept soft world reinforce (PL143.1).
 * Brief soft rim when a trade completes ok —
 * complements Trade open accent (PL29.1) + Trade accepted ephemeral (PL18.2).
 * Escrow / accept rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful trade accept (PL143.1).
 * Soft handshake sage kinship with trade-panel open accent — distinct from
 * market teal + chat seafoam.
 */
export const TRADE_ACCEPT_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.86,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(72, 120, 96, 0.22)",
  outerRgba: "rgba(36, 64, 52, 0.4)",
} as const;

/**
 * Whether a successful trade accept should flash the world reinforce (PL143.1).
 * True only on ok accept; fail / refuse stay quiet. Escrow rules unchanged.
 *
 * @param ok - Whether the trade accept action succeeded.
 * @returns True when the soft trade-accept rim should briefly flash.
 */
export function shouldFlashTradeAcceptWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the trade-accept reinforce (PL143.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function tradeAcceptWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = TRADE_ACCEPT_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
