import { describe, expect, it } from "vitest";
import { ITEMS } from "@game/shared";
import {
  filterTradableMarketItems,
  formatCoinsEach,
  suggestedListingTotal,
} from "../../packages/shared/src/market-analytics";

/**
 * Market analytics HUD — item search + suggested list total for the Use button.
 */
describe("market analytics HUD lookup", () => {
  it("finds a stackable by name and formats a list total (happy)", () => {
    expect(filterTradableMarketItems(ITEMS, "flour")).toEqual(["flour"]);
    expect(formatCoinsEach(5)).toBe("5c/ea");
    expect(suggestedListingTotal(5, 2)).toBe(10);
  });

  it("shows all stackables on empty query and keeps fractional units (edge)", () => {
    const all = filterTradableMarketItems(ITEMS, "  ");
    expect(all.length).toBeGreaterThan(8);
    expect(all).toContain("wheat");
    expect(all).not.toContain("wooden_hoe");
    expect(formatCoinsEach(2.5)).toBe("2.5c/ea");
    expect(suggestedListingTotal(3, 1)).toBe(3);
  });

  it("returns no matches and refuses a zero qty list total (failure)", () => {
    expect(filterTradableMarketItems(ITEMS, "zzz-nope")).toEqual([]);
    expect(filterTradableMarketItems(undefined, "wheat")).toEqual([]);
    expect(formatCoinsEach(null)).toBe("—");
    expect(suggestedListingTotal(5, 0)).toBeNull();
  });
});
