/**
 * Vendor-buy soft world reinforce (PL153.1).
 * Brief soft rim after vendor buy ok —
 * complements Bought ephemeral (PL43.3) + coins-gain sell rim (PL126.2).
 * Prices unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful vendor buy (PL153.1).
 * Quiet warm stall honey-copper — purchase kinship, distinct from warm
 * coin-gold sell inflow + market-list teal.
 */
export const VENDOR_BUY_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.86,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(168, 112, 48, 0.24)",
  outerRgba: "rgba(64, 40, 16, 0.4)",
} as const;

/**
 * Whether a successful vendor buy should flash the soft world rim (PL153.1).
 * True only on ok buy; fail / refuse stay quiet. Prices unchanged.
 *
 * @param ok - Whether the buy action succeeded.
 * @returns True when the soft vendor-buy rim should briefly flash.
 */
export function shouldFlashVendorBuyWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the vendor-buy reinforce (PL153.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function vendorBuyWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = VENDOR_BUY_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
