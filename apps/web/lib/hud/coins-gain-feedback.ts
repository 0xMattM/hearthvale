/**

 * Coins-gain soft world reinforce (PL126.2).

 * Brief warm gold edge rim when soft currency rises from vendor sell /

 * market (delta-gated) / quest claim — complements Sold/Bought ephemerals.

 * Prices / sinks unchanged; mute ok; not a HUD column.

 */



/**

 * Brief soft world rim flash after soft-currency inflow (PL126.2).

 * Warm coin-gold kinship with TopBar coins — inflow glanceable beside Sold.

 */

export const COINS_GAIN_WORLD_REINFORCE = {

  durationMs: 480,

  opacityPeak: 0.92,

  clearPct: 48,

  midPct: 74,

  midRgba: "rgba(120, 96, 36, 0.22)",

  outerRgba: "rgba(88, 64, 18, 0.44)",

} as const;



/**

 * Whether a successful action should flash the coins-gain world reinforce (PL126.2).

 * True only when soft currency actually rose; spends / flat stay quiet.

 *

 * @param ok - Whether the commerce / quest action succeeded.

 * @param prevSoftCurrency - Soft coins before the action.

 * @param nextSoftCurrency - Soft coins after the action.

 * @returns True when the soft gold rim should briefly flash.

 */

export function shouldFlashCoinsGainWorldReinforce(

  ok: boolean,

  prevSoftCurrency: number,

  nextSoftCurrency: number,

): boolean {

  if (ok !== true) return false;

  if (!Number.isFinite(prevSoftCurrency) || !Number.isFinite(nextSoftCurrency)) {

    return false;

  }

  return nextSoftCurrency > prevSoftCurrency;

}



/**

 * CSS `background` radial gradient for the coins-gain reinforce (PL126.2).

 *

 * @returns Radial-gradient string for the one-shot overlay.

 */

export function coinsGainWorldReinforceBackground(): string {

  const { clearPct, midPct, midRgba, outerRgba } = COINS_GAIN_WORLD_REINFORCE;

  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;

}


