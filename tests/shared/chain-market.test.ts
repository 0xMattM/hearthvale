import { describe, expect, it } from "vitest";
import {
  CHAIN_MARKET,
  chainMarketIsReadOnly,
  formatChainPriceLabel,
  mirrorCoinsToChainWei,
} from "../../packages/shared/src/chain-market";

describe("chain marketplace mirror F15.4", () => {
  it("mirrors soft coins into stub wei (happy)", () => {
    expect(mirrorCoinsToChainWei(40)).toBe(
      (40n * CHAIN_MARKET.weiPerCoin).toString(),
    );
    expect(formatChainPriceLabel(mirrorCoinsToChainWei(40))).toContain("stubETH");
    expect(chainMarketIsReadOnly()).toBe(true);
  });

  it("keeps catalog floor readable when zero coins (edge)", () => {
    expect(mirrorCoinsToChainWei(0)).toBe("0");
    expect(formatChainPriceLabel("0")).toBe("0.000 stubETH");
    expect(CHAIN_MARKET.disclaimer.toLowerCase()).toContain("not required");
  });

  it("rejects treating the mirror as a gameplay gate (failure)", () => {
    expect(chainMarketIsReadOnly()).toBe(true);
    expect(CHAIN_MARKET.disclaimer.toLowerCase()).toContain("never combat");
    expect(formatChainPriceLabel("nope")).toBe("—");
  });
});
