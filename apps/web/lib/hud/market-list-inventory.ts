/**
 * Owned stackables a player can list on the coin board or REALM stall.
 * Catalog-wide dropdowns are wrong — only bag qty is listable (MARKET-LIST-INV-1).
 */

import type { ItemId } from "@game/shared";

/** One stackable kind in the bag, collapsed across stacks. */
export interface ListableInventoryItem {
  itemId: ItemId;
  name: string;
  qty: number;
}

/** Empty-bag copy when there is nothing stackable to list. */
export const MARKET_LIST_EMPTY_INVENTORY = "Nothing in the bag to list.";

/** Catalog row used to decide stackable + display name. */
export interface ListableCatalogItem {
  name?: string;
  stackable?: boolean;
}

/** Inventory row used to sum bag qty. */
export interface ListableInventorySnap {
  itemId: string;
  qty: number;
}

/**
 * Collapses the bag into stackable kinds the player actually holds.
 * Tools / empty / unknown ids stay out — markets only escrow stackables.
 *
 * @param inventory - Player inventory stacks.
 * @param items - Catalog keyed by item id.
 * @returns Sorted list of owned stackables with available qty.
 */
export function listableInventoryItems(
  inventory: readonly ListableInventorySnap[] | null | undefined,
  items: Record<string, ListableCatalogItem | undefined>,
): ListableInventoryItem[] {
  if (!inventory?.length) return [];
  const qtyById = new Map<string, number>();
  for (const stack of inventory) {
    if (!stack.itemId) continue;
    if (!Number.isFinite(stack.qty) || stack.qty <= 0) continue;
    const def = items[stack.itemId];
    if (!def?.stackable) continue;
    qtyById.set(stack.itemId, (qtyById.get(stack.itemId) ?? 0) + stack.qty);
  }
  const rows: ListableInventoryItem[] = [];
  for (const [itemId, qty] of qtyById) {
    const def = items[itemId];
    rows.push({
      itemId: itemId as ItemId,
      name: def?.name?.trim() || itemId,
      qty,
    });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

/**
 * Selected list row, or the first owned stackable when the id is missing.
 *
 * @param rows - Owned stackables.
 * @param itemId - Currently chosen item id.
 * @returns Matching row, first row, or null when the bag is empty.
 */
export function selectedListableInventoryItem(
  rows: readonly ListableInventoryItem[],
  itemId: string | null | undefined,
): ListableInventoryItem | null {
  if (!rows.length) return null;
  return rows.find((row) => row.itemId === itemId) ?? rows[0] ?? null;
}

/**
 * Clamps a list qty to what the bag actually holds.
 *
 * @param qty - Requested list qty.
 * @param available - Owned qty of that item.
 * @returns Integer qty in `0..available` (0 when nothing is owned).
 */
export function clampMarketListQty(qty: number, available: number): number {
  if (!Number.isFinite(available) || available <= 0) return 0;
  const cap = Math.floor(available);
  if (!Number.isFinite(qty) || qty < 1) return cap >= 1 ? 1 : 0;
  return Math.min(Math.floor(qty), cap);
}
