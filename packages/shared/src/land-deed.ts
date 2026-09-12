/**
 * Off-chain land deed stubs (F15.2–F15.3). Ownership only — never combat power.
 */

export const LAND_DEED = {
  claimCostCoins: 25,
  title: "Premium Forest Deed",
  /** Deed targets exploration-class land (legacy forest alias). */
  landKind: "explore" as const,
  /** Mock list price bounds (soft currency mirror). */
  minListPrice: 10,
  maxListPrice: 500,
  defaultListPrice: 40,
  disclaimer:
    "Cosmetic / production upside only — never combat power. Not required to play. Mint/list are mock (testnet stub).",
} as const;

export type LandDeedStatus = "held" | "listed";

export interface LandDeedDto {
  id: string;
  title: string;
  landId: string;
  landKind: string;
  createdAt: number;
  status: LandDeedStatus;
  listPriceCoins: number | null;
  /** Mock mint tx hash when "minted" on stub chain. */
  mintTxStub: string | null;
  sellerUsername?: string;
}

/**
 * Builds a deterministic mock mint transaction id.
 */
export function stubMintTx(deedId: string): string {
  let h = 2166136261;
  for (let i = 0; i < deedId.length; i++) {
    h ^= deedId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return `0xmint${hex}${deedId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)}`.slice(
    0,
    42,
  );
}

/**
 * Validates a mock list price.
 */
export function isValidDeedListPrice(price: number): boolean {
  if (!Number.isFinite(price)) return false;
  const p = Math.floor(price);
  return p >= LAND_DEED.minListPrice && p <= LAND_DEED.maxListPrice;
}
