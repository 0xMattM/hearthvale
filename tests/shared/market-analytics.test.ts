import { describe, expect, it } from "vitest";
import { ITEMS, VENDOR } from "@game/shared";
import {
  MARKET_SUGGEST_REASON_LABEL,
  buildMarketItemAnalytics,
  filterTradableMarketItems,
  formatCoinsEach,
  listingUnitPrice,
  medianUnit,
  suggestSellUnitCoins,
  suggestedListingTotal,
  summarizeOpenBoard,
  summarizeSold,
  vendorCompareHint,
  vendorNpcBuybackCoins,
} from "../../packages/shared/src/market-analytics";

/**
 * Market analytics — unit price bands, suggested list, item search.
 */
describe("market analytics helpers", () => {
  it("computes unit prices, board bands, and undercut suggestion (happy)", () => {
    expect(listingUnitPrice(12, 3)).toBe(4);
    expect(formatCoinsEach(4)).toBe("4c/ea");
    expect(medianUnit([2, 4, 6])).toBe(4);

    const analytics = buildMarketItemAnalytics({
      itemId: "wheat",
      openRows: [
        { qty: 2, priceCoins: 10, createdAt: 100 },
        { qty: 1, priceCoins: 4, createdAt: 110 },
      ],
      soldRows: [{ qty: 1, priceCoins: 5, createdAt: 90 }],
      vendorNpcCoins: VENDOR.sell.wheat ?? null,
    });
    expect(analytics.board.lowestUnit).toBe(4);
    expect(analytics.board.qtyOnBoard).toBe(3);
    expect(analytics.sold.lastUnit).toBe(5);
    expect(analytics.suggestedUnitCoins).toBe(3);
    expect(analytics.suggestedReason).toBe("undercut_ask");
    expect(MARKET_SUGGEST_REASON_LABEL.undercut_ask).toContain("Undercut");
    expect(suggestedListingTotal(3, 2)).toBe(6);
    expect(vendorNpcBuybackCoins("wheat")).toBe(2);
    expect(vendorCompareHint(3, 2)).toContain("market is higher");
    expect(filterTradableMarketItems(ITEMS, "wheat")).toContain("wheat");
  });

  it("handles empty bands, even median, and vendor fallback (edge)", () => {
    expect(summarizeOpenBoard([])).toEqual({
      listingCount: 0,
      qtyOnBoard: 0,
      lowestUnit: null,
      medianUnit: null,
      highestUnit: null,
    });
    expect(summarizeSold(undefined)).toMatchObject({ saleCount: 0, lastUnit: null });
    expect(medianUnit([2, 4])).toBe(3);
    expect(formatCoinsEach(3.5)).toBe("3.5c/ea");
    expect(formatCoinsEach(null)).toBe("—");
    expect(suggestSellUnitCoins({
      lowestAsk: 1,
      lastSold: 9,
      vendorNpcCoins: 2,
    })).toEqual({ unit: 1, reason: "match_ask" });
    expect(suggestSellUnitCoins({
      lowestAsk: null,
      lastSold: 4.4,
      vendorNpcCoins: 2,
    })).toEqual({ unit: 4, reason: "last_sold" });
    expect(suggestSellUnitCoins({
      lowestAsk: null,
      lastSold: null,
      vendorNpcCoins: 2,
    })).toEqual({ unit: 3, reason: "above_vendor" });
    expect(filterTradableMarketItems(ITEMS, "")).toContain("iron_ore");
    expect(filterTradableMarketItems(ITEMS, "IRON_ORE")).toEqual(
      expect.arrayContaining(["iron_ore"]),
    );
    expect(vendorNpcBuybackCoins("iron_bar")).toBeNull();
    expect(vendorCompareHint(null, 5)).toBe("Vendor NPC pays 5c");
    expect(suggestedListingTotal(4, 0)).toBeNull();
  });

  it("refuses invalid rows, non-list input, and tools (failure)", () => {
    expect(listingUnitPrice(0, 1)).toBeNull();
    expect(listingUnitPrice(5, 0)).toBeNull();
    expect(listingUnitPrice(Number.NaN, 2)).toBeNull();
    expect(medianUnit([])).toBeNull();
    expect(summarizeOpenBoard(null)).toMatchObject({ listingCount: 0 });
    expect(suggestSellUnitCoins({
      lowestAsk: null,
      lastSold: null,
      vendorNpcCoins: null,
    })).toEqual({ unit: null, reason: "none" });
    expect(suggestedListingTotal(null, 3)).toBeNull();
    expect(filterTradableMarketItems(null, "wheat")).toEqual([]);
    expect(filterTradableMarketItems(ITEMS, "zzz-nope")).toEqual([]);
    expect(filterTradableMarketItems(ITEMS, "hoe")).not.toContain("wooden_hoe");
    expect(ITEMS.wooden_hoe.stackable).toBe(false);
  });
});
