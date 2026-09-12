/**
 * Named loot on the one ephemeral TopBar line (HUD-ACTION-CUE-1).
 * Complements gather / craft / harvest confirms — still min HUD, not a toast stack.
 * Yields come from the Content Lock catalog or an inventory delta; never invented.
 */

import {
  ANIMAL_PEN,
  FISHING_DOCK,
  ITEMS,
  WOOD_STUMP,
  getCrop,
  getOreNode,
  getRecipe,
  type ItemId,
} from "@game/shared";

/** Verb shown while a process-station job starts (not collect). */
export const CRAFT_START_SUCCESS_CUE = "Working";

/** Verb when an animal pen spends wheat feed. */
export const PEN_FEED_SUCCESS_CUE = "Fed";

/** Verb when an animal pen spends wood bedding. */
export const PEN_CLEAN_SUCCESS_CUE = "Bedded";

/** Verbs that may carry ` · Item ×N` on the success line. */
export const ACTION_LOOT_CUE_VERBS = [
  "Chopped",
  "Mined",
  "Caught",
  "Collected",
  "Gathered",
  "Harvested",
  "Planted",
  "Crafted",
  CRAFT_START_SUCCESS_CUE,
  PEN_FEED_SUCCESS_CUE,
  PEN_CLEAN_SUCCESS_CUE,
] as const;

/** Named qty the player just gained (or spent, for pen care). */
export interface ActionLootCue {
  /** Catalog item id when known. */
  itemId?: string;
  /** Player-facing catalog name. */
  name: string;
  /**
   * Positive qty for the cue.
   * `0` / omitted means name-only (`Working · Flour`, `Planted · Wheat Seed`).
   */
  qty: number;
}

/** Minimal inventory shape for qty-by-itemId deltas. */
export interface InventoryQtySnap {
  itemId: string;
  qty: number;
}

/**
 * Catalog display name for a known item id.
 *
 * @param itemId - Shared catalog item id.
 * @returns Item name, or null when unknown / empty.
 */
export function catalogItemDisplayName(
  itemId: string | null | undefined,
): string | null {
  if (!itemId) return null;
  const item = ITEMS[itemId as ItemId];
  return item?.name ?? null;
}

/**
 * Builds a loot cue from a catalog item id and qty.
 *
 * @param itemId - Shared catalog item id.
 * @param qty - Positive qty, or 0 for name-only.
 * @returns Loot cue, or null when the id is unknown.
 */
export function lootCueFromItem(
  itemId: string | null | undefined,
  qty: number,
): ActionLootCue | null {
  const name = catalogItemDisplayName(itemId);
  if (!name) return null;
  return { itemId: itemId ?? undefined, name, qty };
}

/**
 * One-line `Verb` or `Verb · Name` / `Verb · Name ×N`.
 *
 * @param verb - Short confirm verb (Chopped, Crafted, Working, …).
 * @param loot - Optional named qty. Qty ≤ 0 omits the multiplier.
 * @returns Player-facing ephemeral copy.
 */
export function formatActionLootCue(
  verb: string,
  loot?: ActionLootCue | null,
): string {
  const name = loot?.name?.trim();
  if (!name) return verb;
  const qty = loot.qty;
  if (qty == null || !Number.isFinite(qty) || qty <= 0) {
    return `${verb} · ${name}`;
  }
  return `${verb} · ${name} ×${Math.floor(qty)}`;
}

/**
 * Whether a TopBar line is a known verb or `Verb · Name ×N` loot cue.
 * Rejects sticky / invented prose (`Chopped · +3 wood sticky`).
 *
 * @param text - Current TopBar info string.
 * @returns True when the line matches a known action-loot shape.
 */
export function isActionLootCueLine(text: string | null | undefined): boolean {
  if (!text) return false;
  return ACTION_LOOT_CUE_VERBS.some((verb) => matchesActionLootCue(text, verb));
}

/**
 * Expected catalog yield for a gather station (Content Lock numbers).
 *
 * @param buildingType - Gather building type.
 * @param cropId - Ore kind on `ore_node.cropId` (null = iron).
 * @returns Catalog loot, or null when the type has no yield (pen care).
 */
export function expectedGatherLoot(
  buildingType: string | null | undefined,
  cropId?: string | null,
): ActionLootCue | null {
  switch (buildingType) {
    case "tree_stump":
      return lootCueFromItem(WOOD_STUMP.yieldItemId, WOOD_STUMP.yieldQty);
    case "ore_node": {
      const node = getOreNode(cropId);
      return lootCueFromItem(node.yieldItemId, node.yieldQty);
    }
    case "fishing_dock":
      return lootCueFromItem(FISHING_DOCK.yieldItemId, FISHING_DOCK.yieldQty);
    default:
      return null;
  }
}

/**
 * Largest item-id qty rise between two inventory snapshots.
 *
 * @param previous - Inventory before the action (null skips).
 * @param next - Inventory after the action.
 * @returns Biggest gain, or null when none / first hydrate.
 */
export function biggestInventoryGain(
  previous: readonly InventoryQtySnap[] | null | undefined,
  next: readonly InventoryQtySnap[] | null | undefined,
): ActionLootCue | null {
  return biggestInventoryDelta(previous, next, "gain");
}

/**
 * Largest item-id qty drop between two inventory snapshots.
 *
 * @param previous - Inventory before the action (null skips).
 * @param next - Inventory after the action.
 * @returns Biggest loss as a positive qty, or null when none / first hydrate.
 */
export function biggestInventoryLoss(
  previous: readonly InventoryQtySnap[] | null | undefined,
  next: readonly InventoryQtySnap[] | null | undefined,
): ActionLootCue | null {
  return biggestInventoryDelta(previous, next, "loss");
}

/**
 * Loot line for chop / mine / fish / pen after a successful gather.
 * Prefers a real inventory delta; falls back to catalog yield.
 *
 * @param buildingType - Gather station type.
 * @param cropId - Ore kind when mining.
 * @param previousInventory - Bags before the action.
 * @param nextInventory - Bags after the action.
 * @returns Named loot, or null when nothing can be named.
 */
export function resolveGatherLootCue(
  buildingType: string | null | undefined,
  cropId?: string | null,
  previousInventory?: readonly InventoryQtySnap[] | null,
  nextInventory?: readonly InventoryQtySnap[] | null,
): ActionLootCue | null {
  if (buildingType === "animal_pen") {
    const lost = biggestInventoryLoss(previousInventory, nextInventory);
    if (
      lost?.itemId === ANIMAL_PEN.feedItemId ||
      lost?.itemId === ANIMAL_PEN.cleanItemId
    ) {
      return lost;
    }
    return null;
  }
  const gained = biggestInventoryGain(previousInventory, nextInventory);
  if (gained) return gained;
  return expectedGatherLoot(buildingType, cropId);
}

/**
 * Harvest loot from inventory delta, else crop catalog yield.
 *
 * @param cropId - Plot `cropId` (wheat / corn / …).
 * @param previousInventory - Bags before harvest.
 * @param nextInventory - Bags after harvest.
 * @returns Named harvest loot, or null when unknown.
 */
export function resolveHarvestLootCue(
  cropId?: string | null,
  previousInventory?: readonly InventoryQtySnap[] | null,
  nextInventory?: readonly InventoryQtySnap[] | null,
): ActionLootCue | null {
  const gained = biggestInventoryGain(previousInventory, nextInventory);
  if (gained) return gained;
  if (!cropId) return null;
  const crop = getCrop(cropId);
  if (!crop) return null;
  return lootCueFromItem(crop.harvestItemId, crop.harvestQty);
}

/**
 * Craft-collect loot from inventory delta, else recipe output.
 *
 * @param recipeId - Job recipe id captured before collect.
 * @param previousInventory - Bags before collect.
 * @param nextInventory - Bags after collect.
 * @returns Named output loot, or null when unknown.
 */
export function resolveCraftOutputLoot(
  recipeId?: string | null,
  previousInventory?: readonly InventoryQtySnap[] | null,
  nextInventory?: readonly InventoryQtySnap[] | null,
): ActionLootCue | null {
  const gained = biggestInventoryGain(previousInventory, nextInventory);
  if (gained) return gained;
  if (!recipeId) return null;
  const recipe = getRecipe(recipeId);
  if (!recipe) return null;
  return lootCueFromItem(recipe.output.itemId, recipe.output.qty);
}

/**
 * Ephemeral line when a process-station job starts.
 *
 * @param recipeId - Recipe that just began working.
 * @returns `Working · Flour` (output name), or bare Working.
 */
export function craftStartCueText(recipeId?: string | null): string {
  if (!recipeId) return CRAFT_START_SUCCESS_CUE;
  const recipe = getRecipe(recipeId);
  if (!recipe) return CRAFT_START_SUCCESS_CUE;
  const loot = lootCueFromItem(recipe.output.itemId, 0);
  return formatActionLootCue(CRAFT_START_SUCCESS_CUE, loot);
}

/**
 * Ephemeral line after collecting a finished craft job.
 *
 * @param loot - Output item from delta or recipe.
 * @returns `Crafted · Flour ×1`, or bare Crafted.
 */
export function craftCollectCueText(loot?: ActionLootCue | null): string {
  return formatActionLootCue("Crafted", loot);
}

/**
 * Ephemeral line after planting a seed.
 *
 * @param seedItemId - Seed that was planted.
 * @returns `Planted · Wheat Seed`, or bare Planted.
 */
export function plantSuccessCueText(seedItemId?: string | null): string {
  const loot = lootCueFromItem(seedItemId, 0);
  return formatActionLootCue("Planted", loot);
}

/**
 * Ephemeral line after harvesting a ready crop.
 *
 * @param loot - Harvest item from delta or crop catalog.
 * @returns `Harvested · Wheat ×2`, or bare Harvested.
 */
export function harvestSuccessCueText(loot?: ActionLootCue | null): string {
  return formatActionLootCue("Harvested", loot);
}

/**
 * Pen-care verb: Fed / Bedded when the spent mat is known.
 *
 * @param fallbackVerb - Short confirm when the mat is unknown (`Collected`).
 * @param loot - Spent wheat or wood.
 * @returns Named pen-care cue.
 */
export function formatPenCareCue(
  fallbackVerb: string,
  loot?: ActionLootCue | null,
): string {
  if (!loot?.name) return fallbackVerb;
  const verb =
    loot.itemId === ANIMAL_PEN.feedItemId
      ? PEN_FEED_SUCCESS_CUE
      : loot.itemId === ANIMAL_PEN.cleanItemId
        ? PEN_CLEAN_SUCCESS_CUE
        : fallbackVerb;
  return formatActionLootCue(verb, loot);
}

/**
 * Matches `Verb` or `Verb · CatalogName` / `Verb · CatalogName ×N`.
 *
 * @param text - Full cue line.
 * @param verb - Known confirm verb.
 * @returns True when the line is that verb with an optional catalog loot suffix.
 */
function matchesActionLootCue(text: string, verb: string): boolean {
  if (text === verb) return true;
  const prefix = `${verb} · `;
  if (!text.startsWith(prefix)) return false;
  const rest = text.slice(prefix.length);
  const qtyMatch = rest.match(/^(.*) ×(\d{1,3})$/);
  const name = (qtyMatch ? qtyMatch[1] : rest).trim();
  if (!name) return false;
  return Object.values(ITEMS).some((item) => item.name === name);
}

/**
 * Sums stack qty per item id.
 *
 * @param stacks - Inventory rows.
 * @returns Map of itemId → total qty.
 */
function qtyByItemId(
  stacks: readonly InventoryQtySnap[] | null | undefined,
): Map<string, number> {
  const map = new Map<string, number>();
  if (!stacks) return map;
  for (const stack of stacks) {
    if (!stack.itemId || !Number.isFinite(stack.qty) || stack.qty < 0) continue;
    map.set(stack.itemId, (map.get(stack.itemId) ?? 0) + stack.qty);
  }
  return map;
}

/**
 * Largest positive item-id delta in one direction.
 *
 * @param previous - Inventory before the action.
 * @param next - Inventory after the action.
 * @param direction - Gain (inflow) or loss (spent mats).
 * @returns Named delta, or null when snapshots are missing / flat.
 */
function biggestInventoryDelta(
  previous: readonly InventoryQtySnap[] | null | undefined,
  next: readonly InventoryQtySnap[] | null | undefined,
  direction: "gain" | "loss",
): ActionLootCue | null {
  if (previous == null || next == null) return null;
  const before = qtyByItemId(previous);
  const after = qtyByItemId(next);
  const ids = new Set([...before.keys(), ...after.keys()]);
  let best: ActionLootCue | null = null;
  for (const itemId of ids) {
    const delta =
      (after.get(itemId) ?? 0) - (before.get(itemId) ?? 0);
    const qty = direction === "gain" ? delta : -delta;
    if (qty <= 0) continue;
    if (best && qty <= best.qty) continue;
    const loot = lootCueFromItem(itemId, qty);
    if (loot) best = loot;
  }
  return best;
}
