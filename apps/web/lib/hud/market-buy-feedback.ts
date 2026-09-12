/**

 * Market-buy soft world reinforce (PL155.2).

 * Brief soft rim after market buy ok —

 * complements Bought ephemeral + market-list rim (PL138.1).

 * Escrow / fees unchanged; mute ok; fail silent.

 */



/**

 * Brief soft world rim flash after a successful market buy (PL155.2).

 * Quiet warm parchment-gold listing kinship — purchase read beside list teal

 * + vendor stall honey-copper + coins-gold sell inflow.

 */

export const MARKET_BUY_WORLD_REINFORCE = {

  durationMs: 500,

  opacityPeak: 0.86,

  clearPct: 48,

  midPct: 74,

  midRgba: "rgba(168, 136, 64, 0.24)",

  outerRgba: "rgba(56, 44, 16, 0.4)",

} as const;



/**

 * Whether a successful market buy should flash the soft world rim (PL155.2).

 * True only on ok buy; fail / refuse stay quiet. Escrow / fees unchanged.

 *

 * @param ok - Whether the buy action succeeded.

 * @returns True when the soft market-buy rim should briefly flash.

 */

export function shouldFlashMarketBuyWorldReinforce(ok: boolean): boolean {

  return ok === true;

}



/**

 * CSS `background` radial gradient for the market-buy reinforce (PL155.2).

 *

 * @returns Radial-gradient string for the one-shot overlay.

 */

export function marketBuyWorldReinforceBackground(): string {

  const { clearPct, midPct, midRgba, outerRgba } = MARKET_BUY_WORLD_REINFORCE;

  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;

}


