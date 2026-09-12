/**
 * Inventory bag search + category filter (grid HUD).
 * Capacity / stack rules unchanged — this only hides rows in the panel.
 */

import type { ItemDefinition } from "@game/shared";
import { isEdibleItemId, isHomesteadKitItemId } from "@game/shared";

/** Chip ids shown above the inventory grid. */
export const INVENTORY_FILTER_CATEGORIES = [
  "all",
  "materials",
  "food",
  "tools",
  "gear",
  "kits",
] as const;

export type InventoryFilterCategory =
  (typeof INVENTORY_FILTER_CATEGORIES)[number];

/** Short chip labels (min HUD). */
export const INVENTORY_FILTER_LABELS: Record<InventoryFilterCategory, string> =
  {
    all: "All",
    materials: "Mats",
    food: "Food",
    tools: "Tools",
    gear: "Gear",
    kits: "Kits",
  };

/** Cook-chain raw food that is not yet edible. */
const RAW_FOOD_ITEM_IDS = new Set(["raw_meat", "fish", "potato", "corn"]);

/** Minimal stack shape used by the filter (id + catalog item). */
export interface InventoryFilterStack {
  id: string;
  itemId: string;
}

/**
 * Returns the bag category for a catalog item.
 *
 * Tools win over kits; kits over food; everything else is materials.
 *
 * @param itemId - Catalog item id (unknown ids fall through to materials).
 * @param def - Catalog definition when known.
 * @returns Category excluding `all`.
 */
export function inventoryItemCategory(
  itemId: string,
  def: ItemDefinition | undefined,
): Exclude<InventoryFilterCategory, "all"> {
  if (def?.equipSlot === "tool") return "tools";
  if (
    def?.equipSlot === "weapon" ||
    def?.equipSlot === "armor" ||
    def?.equipSlot === "shield"
  ) {
    return "gear";
  }
  if (isHomesteadKitItemId(itemId)) return "kits";
  if (isEdibleItemId(itemId) || RAW_FOOD_ITEM_IDS.has(itemId)) return "food";
  return "materials";
}

/**
 * Normalizes a search string for case / underscore insensitive match.
 *
 * @param query - Raw search input.
 * @returns Lowercased, collapsed query; empty when blank.
 */
export function normalizeInventorySearch(query: string): string {
  if (typeof query !== "string") return "";
  return query
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Returns true when a stack matches the free-text query.
 * Empty query matches everything. Matches name, item id, or category label.
 *
 * @param stack - Inventory stack.
 * @param def - Catalog definition when known.
 * @param query - Raw search input.
 * @returns Whether the stack should stay visible.
 */
export function inventoryStackMatchesQuery(
  stack: InventoryFilterStack,
  def: ItemDefinition | undefined,
  query: string,
): boolean {
  const q = normalizeInventorySearch(query);
  if (!q) return true;
  if (!stack || typeof stack.itemId !== "string") return false;
  const name = (def?.name ?? "").toLowerCase();
  const id = normalizeInventorySearch(stack.itemId);
  const category = inventoryItemCategory(stack.itemId, def);
  const categoryLabel = INVENTORY_FILTER_LABELS[category].toLowerCase();
  return name.includes(q) || id.includes(q) || categoryLabel.includes(q);
}

/**
 * Filters bag stacks by category chip and search query.
 * Unknown category values fall back to `all`. Non-arrays yield [].
 *
 * @param stacks - Current inventory stacks.
 * @param items - Catalog map keyed by item id.
 * @param query - Free-text search.
 * @param category - Active chip (`all` shows every category).
 * @returns Stacks that should render in the grid.
 */
export function filterInventoryStacks<T extends InventoryFilterStack>(
  stacks: readonly T[] | null | undefined,
  items: Record<string, ItemDefinition>,
  query: string,
  category: InventoryFilterCategory | string,
): T[] {
  if (!Array.isArray(stacks)) return [];
  const catalog = items ?? {};
  const known = INVENTORY_FILTER_CATEGORIES as readonly string[];
  const cat: InventoryFilterCategory = known.includes(category)
    ? (category as InventoryFilterCategory)
    : "all";
  return stacks.filter((stack) => {
    const def = catalog[stack.itemId];
    if (cat !== "all" && inventoryItemCategory(stack.itemId, def) !== cat) {
      return false;
    }
    return inventoryStackMatchesQuery(stack, def, query);
  });
}
