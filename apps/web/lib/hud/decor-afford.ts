/**
 * Housing decor place afford cues (PL39.2) — panel-open row clarity only.
 * Coin costs unchanged; no always-on HUD column.
 */

/** Affordability of a Housing decor place row. */
export type DecorPlaceAffordMode = "affordable" | "short";

/**
 * Whether a Housing decor place row is affordable (coins only).
 *
 * @param softCurrency - Player wallet.
 * @param coinCost - Decor catalog coin cost.
 * @returns `affordable` when placeable, else `short`.
 */
export function decorPlaceAffordMode(
  softCurrency: number,
  coinCost: number,
): DecorPlaceAffordMode {
  return softCurrency >= coinCost ? "affordable" : "short";
}

/**
 * Soft short-coins hint for Housing decor place rows (PL39.2).
 * Null when affordable.
 *
 * @param softCurrency - Player wallet.
 * @param coinCost - Decor catalog coin cost.
 * @returns Compact `Need Nc` line, or null when affordable.
 */
export function decorPlaceShortFundsHint(
  softCurrency: number,
  coinCost: number,
): string | null {
  if (softCurrency >= coinCost) return null;
  return `Need ${coinCost}c`;
}
