/**
 * Market board open-listing search (HUD chrome only).
 * List/buy/cancel rules unchanged — this only hides rows in the panel.
 */

import type { ItemDefinition } from "@game/shared";
import { normalizeInventorySearch } from "./inventory-filter";

/** Minimal listing shape used by the open-board search. */
export interface MarketListingFilterRow {
  itemId: string;
  sellerUsername: string;
}

/**
 * Returns true when a listing matches the free-text query.
 * Empty query matches everything. Matches item name, item id, or seller.
 *
 * @param listing - Open listing row.
 * @param def - Catalog definition when known.
 * @param query - Raw search input.
 * @returns Whether the listing should stay visible.
 */
export function marketListingMatchesQuery(
  listing: MarketListingFilterRow | null | undefined,
  def: ItemDefinition | undefined,
  query: string,
): boolean {
  const q = normalizeInventorySearch(query);
  if (!q) return true;
  if (!listing || typeof listing.itemId !== "string") return false;
  const name = (def?.name ?? "").toLowerCase();
  const id = normalizeInventorySearch(listing.itemId);
  const seller = normalizeInventorySearch(listing.sellerUsername ?? "");
  return name.includes(q) || id.includes(q) || seller.includes(q);
}

/**
 * Filters open listings by search query.
 * Non-arrays yield []. Empty / whitespace query shows every listing.
 *
 * @param listings - Current open board rows.
 * @param items - Catalog map keyed by item id.
 * @param query - Free-text search (item name, id, or seller).
 * @returns Listings that should render on the board.
 */
export function filterMarketListings<T extends MarketListingFilterRow>(
  listings: readonly T[] | null | undefined,
  items: Record<string, ItemDefinition>,
  query: string,
): T[] {
  if (!Array.isArray(listings)) return [];
  const catalog = items ?? {};
  return listings.filter((listing) =>
    marketListingMatchesQuery(listing, catalog[listing?.itemId], query),
  );
}

/**
 * Empty-copy for the open listings list.
 * Distinguishes a vacant board from a search with no hits.
 *
 * @param listingCount - Unfiltered open listing count.
 * @param query - Raw search input.
 * @returns Player-facing empty message.
 */
export function marketListingsEmptyMessage(
  listingCount: number,
  query: string,
): string {
  if (listingCount <= 0) return "Empty board — be the first to list.";
  if (normalizeInventorySearch(query)) return "No listings match";
  return "Empty board — be the first to list.";
}
