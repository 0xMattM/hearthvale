import { describe, expect, it } from "vitest";
import { ITEMS, type ItemDefinition } from "@game/shared";
import {
  filterMarketListings,
  marketListingMatchesQuery,
  marketListingsEmptyMessage,
} from "../../apps/web/lib/hud/market-listing-filter";
import { normalizeInventorySearch } from "../../apps/web/lib/hud/inventory-filter";

const ITEMS_MAP = ITEMS as Record<string, ItemDefinition>;

const LISTINGS = [
  { id: "1", itemId: "wheat", sellerUsername: "Ada", qty: 4, priceCoins: 5, mine: false },
  { id: "2", itemId: "iron_ore", sellerUsername: "Bram", qty: 2, priceCoins: 12, mine: true },
  { id: "3", itemId: "bread", sellerUsername: "Ada", qty: 1, priceCoins: 8, mine: false },
];

/**
 * Market open-listings search (board chrome).
 * List/buy/cancel / fee / TTL unchanged.
 */
describe("market open listings search", () => {
  it("matches item name, id, and seller (happy)", () => {
    const byName = filterMarketListings(LISTINGS, ITEMS_MAP, "wheat");
    expect(byName.map((row) => row.id)).toEqual(["1"]);
    const byId = filterMarketListings(LISTINGS, ITEMS_MAP, "iron ore");
    expect(byId.map((row) => row.itemId)).toEqual(["iron_ore"]);
    const bySeller = filterMarketListings(LISTINGS, ITEMS_MAP, "ada");
    expect(bySeller.map((row) => row.id)).toEqual(["1", "3"]);
    expect(marketListingsEmptyMessage(0, "")).toBe(
      "Empty board — be the first to list.",
    );
  });

  it("keeps empty query as show-all and normalizes case/underscores (edge)", () => {
    expect(normalizeInventorySearch("  Iron_Ore  ")).toBe("iron ore");
    expect(filterMarketListings(LISTINGS, ITEMS_MAP, "")).toHaveLength(3);
    expect(filterMarketListings(LISTINGS, ITEMS_MAP, "   ")).toHaveLength(3);
    expect(
      marketListingMatchesQuery(
        { itemId: "iron_ore", sellerUsername: "Bram" },
        ITEMS.iron_ore,
        "",
      ),
    ).toBe(true);
    expect(
      filterMarketListings(LISTINGS, ITEMS_MAP, "IRON_ORE").map((row) => row.id),
    ).toEqual(["2"]);
    expect(marketListingsEmptyMessage(2, "zzz")).toBe("No listings match");
    expect(marketListingsEmptyMessage(0, "wheat")).toBe(
      "Empty board — be the first to list.",
    );
  });

  it("returns empty on no match and refuses non-list input (failure)", () => {
    expect(filterMarketListings(LISTINGS, ITEMS_MAP, "zzz-nope")).toEqual([]);
    expect(filterMarketListings(null, ITEMS_MAP, "wheat")).toEqual([]);
    expect(filterMarketListings(undefined, ITEMS_MAP, "ada")).toEqual([]);
    expect(
      marketListingMatchesQuery(
        { itemId: "wheat", sellerUsername: "Ada" },
        ITEMS.wheat,
        "bram",
      ),
    ).toBe(false);
    expect(
      marketListingMatchesQuery(null, ITEMS.wheat, "wheat"),
    ).toBe(false);
    expect(marketListingsEmptyMessage(4, "no-such-sku")).toBe("No listings match");
  });
});
