/**

 * Vendor-sell soft world reinforce leftover (PL156.1).

 * Brief soft rim after vendor sell ok —

 * complements Sold ephemeral (PL43.2) + coins-gain rim (PL126.2).

 * Prices unchanged; mute ok; fail silent.

 */



/**

 * Brief soft world rim flash after a successful vendor sell (PL156.1).

 * Quiet warm stall amber-copper — sale kinship, distinct from warm

 * coin-gold inflow + vendor-buy honey-copper + market parchment.

 */

export const VENDOR_SELL_WORLD_REINFORCE = {

  durationMs: 500,

  opacityPeak: 0.86,

  clearPct: 48,

  midPct: 74,

  midRgba: "rgba(176, 120, 56, 0.24)",

  outerRgba: "rgba(72, 44, 16, 0.4)",

} as const;



/**

 * Whether a successful vendor sell should flash the soft world rim (PL156.1).

 * True only on ok sell; fail / refuse stay quiet. Prices unchanged.

 *

 * @param ok - Whether the sell action succeeded.

 * @returns True when the soft vendor-sell rim should briefly flash.

 */

export function shouldFlashVendorSellWorldReinforce(ok: boolean): boolean {

  return ok === true;

}



/**

 * CSS `background` radial gradient for the vendor-sell reinforce (PL156.1).

 *

 * @returns Radial-gradient string for the one-shot overlay.

 */

export function vendorSellWorldReinforceBackground(): string {

  const { clearPct, midPct, midRgba, outerRgba } = VENDOR_SELL_WORLD_REINFORCE;

  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;

}


