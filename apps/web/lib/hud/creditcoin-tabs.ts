/**
 * Creditcoin desk (B) tab ids — wallet path stays on this panel;
 * REALM listings live on the indigo stall, not here.
 */

export const CREDITCOIN_TABS = [
  "wallet",
  "lands",
  "history",
  "contracts",
] as const;

export type CreditcoinTab = (typeof CREDITCOIN_TABS)[number];

export const CREDITCOIN_TAB_LABELS: Record<CreditcoinTab, string> = {
  wallet: "Wallet",
  lands: "NFT Lands",
  history: "History",
  contracts: "Contracts",
};

export const CREDITCOIN_DEFAULT_TAB: CreditcoinTab = "wallet";

/**
 * Whether `id` is a Creditcoin desk tab.
 *
 * @param id - Candidate tab id.
 * @returns True when `id` is one of the four B-desk tabs.
 */
export function isCreditcoinTab(id: string): id is CreditcoinTab {
  return (CREDITCOIN_TABS as readonly string[]).includes(id);
}
