/**
 * Stub on-chain marketplace mirror (F15.4). Read-only; not required to play.
 */

export const CHAIN_MARKET = {
  network: "stub-testnet",
  /** Soft coins → display wei (1 coin = 10^15 wei). */
  weiPerCoin: 1_000_000_000_000_000n,
  disclaimer:
    "Read-only price mirror of the stub deed board. Not required to play. Cosmetic / production upside only — never combat power.",
} as const;

export interface ChainMarketListingDto {
  id: string;
  title: string;
  seller: string;
  landKind: string;
  softPriceCoins: number;
  chainPriceWei: string;
  mintTxStub: string | null;
  source: "live_listing" | "catalog_floor";
}

/**
 * Mirrors soft-currency coins into a stub chain wei string.
 */
export function mirrorCoinsToChainWei(coins: number): string {
  const n = Math.max(0, Math.floor(coins));
  return (BigInt(n) * CHAIN_MARKET.weiPerCoin).toString();
}

/**
 * Formats wei for HUD (e.g. 40 → "0.040 stubETH").
 */
export function formatChainPriceLabel(wei: string): string {
  try {
    const w = BigInt(wei);
    const whole = w / CHAIN_MARKET.weiPerCoin;
    const frac = w % CHAIN_MARKET.weiPerCoin;
    const fracStr = frac
      .toString()
      .padStart(15, "0")
      .slice(0, 3);
    return `${whole}.${fracStr} stubETH`;
  } catch {
    return "—";
  }
}

/**
 * True when a marketplace view is informational only (always for F15.4).
 */
export function chainMarketIsReadOnly(): boolean {
  return true;
}
