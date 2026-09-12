/**
 * Player-market price discovery helpers (board + sales + vendor NPC).
 * Does not set prices — it only summarizes what players and the city NPC pay.
 */

import type { ItemDefinition, ItemId } from "./catalog-items.js";
import { getVendorPrices } from "./catalog-cues-30.js";

/** How many sold rows feed the recent-sales band. */
export const MARKET_ANALYTICS_SOLD_LIMIT = 50;

/** Why a suggested list unit was chosen. */
export type MarketSuggestReason =
  | "undercut_ask"
  | "match_ask"
  | "last_sold"
  | "above_vendor"
  | "none";

/** Compact labels for the analytics panel. */
export const MARKET_SUGGEST_REASON_LABEL: Record<MarketSuggestReason, string> = {
  undercut_ask: "Undercut lowest ask",
  match_ask: "Match lowest ask",
  last_sold: "Last sold",
  above_vendor: "Above vendor NPC",
  none: "No market data yet",
};

/** Open-board price band for one item (unit = coins per item). */
export interface MarketPriceBand {
  listingCount: number;
  qtyOnBoard: number;
  lowestUnit: number | null;
  medianUnit: number | null;
  highestUnit: number | null;
}

/** Recent sold-listing band for one item. */
export interface MarketSoldBand {
  saleCount: number;
  qtySold: number;
  lastUnit: number | null;
  avgUnit: number | null;
  minUnit: number | null;
  maxUnit: number | null;
}

/** Full analytics DTO for one tradable item. */
export interface MarketItemAnalytics {
  itemId: ItemId;
  board: MarketPriceBand;
  sold: MarketSoldBand;
  vendorNpcCoins: number | null;
  suggestedUnitCoins: number | null;
  suggestedReason: MarketSuggestReason;
}

/** Listing row used to build board / sold summaries. */
export interface MarketAnalyticsRow {
  qty: number;
  priceCoins: number;
  createdAt: number;
}

const EMPTY_BOARD: MarketPriceBand = {
  listingCount: 0,
  qtyOnBoard: 0,
  lowestUnit: null,
  medianUnit: null,
  highestUnit: null,
};

const EMPTY_SOLD: MarketSoldBand = {
  saleCount: 0,
  qtySold: 0,
  lastUnit: null,
  avgUnit: null,
  minUnit: null,
  maxUnit: null,
};

/**
 * Normalizes free-text item search (case, underscores, extra spaces).
 *
 * @param query - Raw search input.
 * @returns Lowercase collapsed query, or empty string.
 */
export function normalizeMarketItemQuery(query: string): string {
  return String(query ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Coins per item for a listing. Null when qty or price is not a positive amount.
 *
 * @param priceCoins - Listing total in coins.
 * @param qty - Stack size.
 * @returns Unit price, or null when the row cannot be priced.
 */
export function listingUnitPrice(
  priceCoins: number,
  qty: number,
): number | null {
  if (!Number.isFinite(priceCoins) || !Number.isFinite(qty)) return null;
  if (qty < 1 || priceCoins < 1) return null;
  return priceCoins / qty;
}

/**
 * Rounds a unit price to one decimal for display and bands.
 *
 * @param value - Raw unit price.
 * @returns Rounded unit, or 0 when not finite.
 */
export function roundMarketUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

/**
 * Player-facing unit price label.
 *
 * @param unit - Coins per item, or null.
 * @returns Compact `Nc/ea` (or `N.Nc/ea`), or an em dash.
 */
export function formatCoinsEach(unit: number | null): string {
  if (unit == null || !Number.isFinite(unit)) return "—";
  const rounded = roundMarketUnit(unit);
  if (Number.isInteger(rounded)) return `${rounded}c/ea`;
  return `${rounded.toFixed(1)}c/ea`;
}

/**
 * Median of unit prices (average of the two middle values when even).
 *
 * @param units - Unit prices.
 * @returns Rounded median, or null when empty.
 */
export function medianUnit(units: readonly number[]): number | null {
  if (!Array.isArray(units) || units.length === 0) return null;
  const sorted = [...units].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return roundMarketUnit(sorted[mid]!);
  return roundMarketUnit((sorted[mid - 1]! + sorted[mid]!) / 2);
}

/**
 * Summarizes open listings for one item.
 *
 * @param rows - Open board rows.
 * @returns Count, qty, and low/median/high unit asks.
 */
export function summarizeOpenBoard(
  rows: readonly MarketAnalyticsRow[] | null | undefined,
): MarketPriceBand {
  if (!Array.isArray(rows)) return { ...EMPTY_BOARD };
  const valid = rows.filter(
    (row) => listingUnitPrice(row.priceCoins, row.qty) != null,
  );
  if (valid.length === 0) return { ...EMPTY_BOARD };
  const units = valid.map((row) => listingUnitPrice(row.priceCoins, row.qty)!);
  return {
    listingCount: valid.length,
    qtyOnBoard: valid.reduce((sum, row) => sum + row.qty, 0),
    lowestUnit: roundMarketUnit(Math.min(...units)),
    medianUnit: medianUnit(units),
    highestUnit: roundMarketUnit(Math.max(...units)),
  };
}

/**
 * Summarizes sold listings (newest `createdAt` first for last-sold).
 *
 * @param rows - Sold rows (already capped by the caller if needed).
 * @returns Volume plus last/avg/min/max unit prices.
 */
export function summarizeSold(
  rows: readonly MarketAnalyticsRow[] | null | undefined,
): MarketSoldBand {
  if (!Array.isArray(rows)) return { ...EMPTY_SOLD };
  const valid = rows.filter(
    (row) => listingUnitPrice(row.priceCoins, row.qty) != null,
  );
  if (valid.length === 0) return { ...EMPTY_SOLD };
  const newest = [...valid].sort((a, b) => b.createdAt - a.createdAt)[0]!;
  const units = valid.map((row) => listingUnitPrice(row.priceCoins, row.qty)!);
  const qtySold = valid.reduce((sum, row) => sum + row.qty, 0);
  const coinSum = valid.reduce((sum, row) => sum + row.priceCoins, 0);
  const last = listingUnitPrice(newest.priceCoins, newest.qty);
  return {
    saleCount: valid.length,
    qtySold,
    lastUnit: last == null ? null : roundMarketUnit(last),
    avgUnit: roundMarketUnit(coinSum / qtySold),
    minUnit: roundMarketUnit(Math.min(...units)),
    maxUnit: roundMarketUnit(Math.max(...units)),
  };
}

/**
 * Suggests an integer unit list price from board, last sale, or vendor NPC.
 * Undercuts the lowest ask when possible; never invents a price from nothing.
 *
 * @param input - Lowest ask, last sold unit, and city NPC buyback.
 * @returns Suggested unit coins plus why it was chosen.
 */
export function suggestSellUnitCoins(input: {
  lowestAsk: number | null;
  lastSold: number | null;
  vendorNpcCoins: number | null;
}): { unit: number | null; reason: MarketSuggestReason } {
  const lowestAsk =
    input.lowestAsk != null && Number.isFinite(input.lowestAsk)
      ? input.lowestAsk
      : null;
  const lastSold =
    input.lastSold != null && Number.isFinite(input.lastSold)
      ? input.lastSold
      : null;
  const vendor =
    input.vendorNpcCoins != null &&
    Number.isFinite(input.vendorNpcCoins) &&
    input.vendorNpcCoins >= 1
      ? Math.floor(input.vendorNpcCoins)
      : null;

  if (lowestAsk != null && lowestAsk >= 1) {
    const floorAsk = Math.floor(lowestAsk);
    if (floorAsk > 1) {
      return { unit: floorAsk - 1, reason: "undercut_ask" };
    }
    return { unit: Math.max(1, Math.round(lowestAsk)), reason: "match_ask" };
  }
  if (lastSold != null && lastSold >= 1) {
    return { unit: Math.max(1, Math.round(lastSold)), reason: "last_sold" };
  }
  if (vendor != null) {
    return { unit: vendor + 1, reason: "above_vendor" };
  }
  return { unit: null, reason: "none" };
}

/**
 * City vendor NPC buyback for a stackable (what the stall pays).
 *
 * @param itemId - Catalog item.
 * @returns Coins the city NPC pays, or null when the stall will not buy it.
 */
export function vendorNpcBuybackCoins(itemId: ItemId): number | null {
  const price = getVendorPrices("city").sell[itemId];
  if (price == null || !Number.isFinite(price) || price < 1) return null;
  return Math.floor(price);
}

/**
 * Hint comparing a suggested market unit to the city NPC buyback.
 *
 * @param suggestedUnit - Suggested coins per item.
 * @param vendorNpcCoins - City NPC buyback.
 * @returns Short compare line, or null when the NPC does not buy it.
 */
export function vendorCompareHint(
  suggestedUnit: number | null,
  vendorNpcCoins: number | null,
): string | null {
  if (vendorNpcCoins == null || vendorNpcCoins < 1) return null;
  if (suggestedUnit == null || !Number.isFinite(suggestedUnit)) {
    return `Vendor NPC pays ${vendorNpcCoins}c`;
  }
  if (suggestedUnit > vendorNpcCoins) {
    return `Vendor NPC pays ${vendorNpcCoins}c — market is higher`;
  }
  if (suggestedUnit < vendorNpcCoins) {
    return `Vendor NPC pays ${vendorNpcCoins}c — NPC is higher`;
  }
  return `Vendor NPC pays the same ${vendorNpcCoins}c`;
}

/**
 * Listing form total from a suggested unit price × qty.
 *
 * @param unitCoins - Suggested coins per item.
 * @param qty - Stack size the player is listing.
 * @returns Integer total coins, or null when the inputs are invalid.
 */
export function suggestedListingTotal(
  unitCoins: number | null,
  qty: number,
): number | null {
  if (unitCoins == null || !Number.isFinite(unitCoins) || unitCoins < 1) {
    return null;
  }
  const amount = Math.floor(qty);
  if (amount < 1) return null;
  return Math.max(1, Math.round(unitCoins) * amount);
}

/**
 * Builds the analytics DTO from open + sold rows and the city NPC book.
 *
 * @param input - Item id plus board/sold rows.
 * @returns Analytics snapshot (suggested price is a hint, not a floor).
 */
export function buildMarketItemAnalytics(input: {
  itemId: ItemId;
  openRows: readonly MarketAnalyticsRow[];
  soldRows: readonly MarketAnalyticsRow[];
  vendorNpcCoins: number | null;
}): MarketItemAnalytics {
  const board = summarizeOpenBoard(input.openRows);
  const sold = summarizeSold(input.soldRows);
  const vendorNpcCoins =
    input.vendorNpcCoins != null && input.vendorNpcCoins >= 1
      ? Math.floor(input.vendorNpcCoins)
      : null;
  const suggestion = suggestSellUnitCoins({
    lowestAsk: board.lowestUnit,
    lastSold: sold.lastUnit,
    vendorNpcCoins,
  });
  return {
    itemId: input.itemId,
    board,
    sold,
    vendorNpcCoins,
    suggestedUnitCoins: suggestion.unit,
    suggestedReason: suggestion.reason,
  };
}

/**
 * Stackable catalog ids matching a free-text query (name or id).
 * Empty query returns every stackable, sorted by display name.
 *
 * @param items - Catalog map.
 * @param query - Raw search input.
 * @returns Matching tradable item ids.
 */
export function filterTradableMarketItems(
  items: Record<string, ItemDefinition> | null | undefined,
  query: string,
): ItemId[] {
  if (!items || typeof items !== "object") return [];
  const q = normalizeMarketItemQuery(query);
  const ids = (Object.keys(items) as ItemId[]).filter(
    (id) => items[id]?.stackable === true,
  );
  ids.sort((a, b) =>
    (items[a]?.name ?? a).localeCompare(items[b]?.name ?? b),
  );
  if (!q) return ids;
  return ids.filter((id) => {
    const name = (items[id]?.name ?? "").toLowerCase();
    const nid = normalizeMarketItemQuery(id);
    return name.includes(q) || nid.includes(q);
  });
}
