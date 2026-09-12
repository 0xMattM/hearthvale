import { describe, expect, it } from "vitest";
import {
  CREDITCOIN_DEFAULT_TAB,
  CREDITCOIN_TAB_LABELS,
  CREDITCOIN_TABS,
  isCreditcoinTab,
} from "../../apps/web/lib/hud/creditcoin-tabs";

describe("Creditcoin desk tabs", () => {
  it("exposes Wallet, NFT Lands, History, and Contracts (happy)", () => {
    expect(CREDITCOIN_TABS).toEqual([
      "wallet",
      "lands",
      "history",
      "contracts",
    ]);
    expect(CREDITCOIN_TAB_LABELS.wallet).toBe("Wallet");
    expect(CREDITCOIN_TAB_LABELS.lands).toBe("NFT Lands");
    expect(CREDITCOIN_TAB_LABELS.history).toBe("History");
    expect(CREDITCOIN_TAB_LABELS.contracts).toBe("Contracts");
    expect(CREDITCOIN_DEFAULT_TAB).toBe("wallet");
  });

  it("accepts only the four desk tabs (edge)", () => {
    expect(isCreditcoinTab("wallet")).toBe(true);
    expect(isCreditcoinTab("lands")).toBe(true);
    expect(isCreditcoinTab("history")).toBe(true);
    expect(isCreditcoinTab("contracts")).toBe(true);
    expect(isCreditcoinTab("")).toBe(false);
  });

  it("keeps REALM market off the B desk (failure)", () => {
    expect(CREDITCOIN_TABS).not.toContain("market");
    expect(CREDITCOIN_TABS).not.toContain("realm_market");
    expect(isCreditcoinTab("realm_market")).toBe(false);
    expect(Object.values(CREDITCOIN_TAB_LABELS).join(" ")).not.toMatch(
      /REALM Market/i,
    );
  });
});
