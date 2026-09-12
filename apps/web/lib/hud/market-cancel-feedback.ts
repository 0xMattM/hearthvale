/**
 * Market-cancel soft world reinforce (PL156.2).
 * Brief soft rim after market cancel ok —
 * complements Cancelled listing cue (PL10.2 / PL56.2) + list rim (PL138.1).
 * Escrow / fees unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful market cancel (PL156.2).
 * Quiet cool dusty board-ash — listing withdrawn kinship, distinct from
 * list teal post + buy parchment-gold + coins-gold inflow.
 */
export const MARKET_CANCEL_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(112, 116, 120, 0.22)",
  outerRgba: "rgba(40, 44, 48, 0.4)",
} as const;

/**
 * Whether a successful market cancel should flash the soft world rim (PL156.2).
 * True only on ok cancel; fail / refuse stay quiet. Escrow / fees unchanged.
 *
 * @param ok - Whether the cancel action succeeded.
 * @returns True when the soft market-cancel rim should briefly flash.
 */
export function shouldFlashMarketCancelWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the market-cancel reinforce (PL156.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function marketCancelWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = MARKET_CANCEL_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
