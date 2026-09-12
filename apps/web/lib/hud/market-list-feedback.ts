/**
 * Market-list soft world reinforce (PL138.1).
 * Brief soft commerce rim when a market listing posts successfully —
 * complements Listed ephemeral (PL10.2) + coins-gain rim (PL126.2) for sells.
 * Market escrow / listing fees unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful market list (PL138.1).
 * Cool market-teal board kinship — distinct from warm coin gold + quest verdant.
 */
export const MARKET_LIST_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.88,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(48, 96, 100, 0.22)",
  outerRgba: "rgba(24, 56, 60, 0.42)",
} as const;

/**
 * Whether a successful market list should flash the world reinforce (PL138.1).
 * True only on ok list; fail / refuse stay quiet. Fees / escrow unchanged.
 *
 * @param ok - Whether the market list action succeeded.
 * @returns True when the soft market-list rim should briefly flash.
 */
export function shouldFlashMarketListWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the market-list reinforce (PL138.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function marketListWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = MARKET_LIST_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
