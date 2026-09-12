/**
 * Commerce buy afford cues (PL32.1–PL32.2) — panel-open row clarity only.
 * Prices / listings / TTL unchanged; no always-on economy HUD column.
 */

/** Affordability of a coin-priced buy row. */
export type CommerceBuyAffordMode = "affordable" | "short";

/**
 * Whether the wallet covers a buy price (vendor or market listing).
 *
 * @param softCurrency - Player soft coins.
 * @param priceCoins - Row buy price in coins.
 * @returns `affordable` when coins cover price, else `short`.
 */
export function commerceBuyAffordMode(
  softCurrency: number,
  priceCoins: number,
): CommerceBuyAffordMode {
  if (priceCoins <= 0) return "affordable";
  return softCurrency >= priceCoins ? "affordable" : "short";
}

/**
 * Soft short-funds hint for market buy rows (PL32.2).
 * Null when affordable (or non-positive price).
 *
 * @param softCurrency - Player soft coins.
 * @param priceCoins - Listing price in coins.
 * @returns Compact `Need Nc` line, or null when affordable.
 */
export function marketBuyShortFundsHint(
  softCurrency: number,
  priceCoins: number,
): string | null {
  if (commerceBuyAffordMode(softCurrency, priceCoins) === "affordable") {
    return null;
  }
  return `Need ${priceCoins}c`;
}
