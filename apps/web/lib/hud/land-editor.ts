/**
 * Land editor (P) helpers — bag kits, world picks, and move-after-pickup.
 */

import {
  HOUSING_DECOR,
  ITEMS,
  PLAYER_LAND_STATIONS,
  canPickupHomesteadBuilding,
  housingDecorIdFromBuildingType,
  isHomesteadKitItemId,
  isPlayerLandStationType,
  isStationKitItemId,
  kitItemIdForDecorBuilding,
  kitItemIdForStation,
  type BuildingDto,
  type ItemId,
} from "@game/shared";

/** Minimal inventory row used by the land editor bag list. */
export interface LandEditorKitStack {
  id: string;
  itemId: string;
  qty: number;
}

/** Placeable kit row shown in the P panel. */
export interface LandEditorPlaceableKit {
  id: string;
  itemId: string;
  qty: number;
  name: string;
  kind: "station" | "decor";
}

/**
 * Filters inventory to homestead kits the player can place on their land.
 * Stations sort before decor; unknown / non-kit rows are dropped.
 *
 * @param inventory - Current bag stacks, or null/undefined when state is missing.
 * @returns Placeable kit rows with display names.
 */
export function landEditorPlaceableKits(
  inventory: ReadonlyArray<LandEditorKitStack> | null | undefined,
): LandEditorPlaceableKit[] {
  if (!Array.isArray(inventory)) return [];
  const rows: LandEditorPlaceableKit[] = [];
  for (const stack of inventory) {
    if (!stack || typeof stack.itemId !== "string") continue;
    if (!isHomesteadKitItemId(stack.itemId)) continue;
    const def = ITEMS[stack.itemId];
    rows.push({
      id: stack.id,
      itemId: stack.itemId,
      qty: Number.isFinite(stack.qty) ? stack.qty : 1,
      name: def?.name ?? stack.itemId,
      kind: isStationKitItemId(stack.itemId) ? "station" : "decor",
    });
  }
  rows.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "station" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return rows;
}

/**
 * Placed homestead stations/decor that the land editor can move or pick up.
 *
 * @param buildings - Buildings on the active land.
 * @returns Pickup-eligible buildings in input order.
 */
export function landEditorPickupBuildings<
  T extends { type: string; slotIndex?: number },
>(buildings: ReadonlyArray<T> | null | undefined): T[] {
  if (!Array.isArray(buildings)) return [];
  return buildings.filter((b) =>
    canPickupHomesteadBuilding(b.type, b.slotIndex),
  );
}

/**
 * Display name for a placed land-editor building.
 *
 * @param building - Placed building with a catalog type.
 * @returns Station/decor name, or the raw type when unknown.
 */
export function landEditorBuildingLabel(
  building: Pick<BuildingDto, "type"> | null | undefined,
): string {
  if (!building || typeof building.type !== "string") return "";
  if (isPlayerLandStationType(building.type)) {
    return PLAYER_LAND_STATIONS[building.type].name;
  }
  const decorId = housingDecorIdFromBuildingType(building.type);
  if (decorId) return HOUSING_DECOR[decorId].name;
  return building.type;
}

/**
 * Kit item id restored when a placed homestead building is picked up.
 *
 * @param type - Building type on the land.
 * @returns Kit item id, or null when the building cannot be picked up.
 */
export function kitItemIdForHomesteadBuilding(type: string): ItemId | null {
  if (!type || typeof type !== "string") return null;
  if (isPlayerLandStationType(type)) return kitItemIdForStation(type);
  return kitItemIdForDecorBuilding(type);
}

/**
 * Whether a world click should select this building in the land editor.
 * Place-grid clicks win while a kit ghost is active.
 *
 * @param type - Building type under the cursor.
 * @param placingKit - True while the homestead place grid is open.
 * @returns True when the editor should select the building.
 */
export function isLandEditorWorldPickable(
  type: string,
  placingKit: boolean,
  slotIndex?: number,
): boolean {
  if (placingKit) return false;
  return canPickupHomesteadBuilding(type, slotIndex);
}

/**
 * Finds the inventory row to start placing after a successful pickup (move).
 * Prefers a newly created row; falls back to any matching kit.
 *
 * @param prevInventoryIds - Bag row ids before pickup.
 * @param nextInventory - Bag after pickup.
 * @param kitItemId - Expected kit catalog id.
 * @returns Inventory row id to place, or null when missing.
 */
export function kitInventoryIdAfterPickup(
  prevInventoryIds: ReadonlySet<string> | readonly string[] | null | undefined,
  nextInventory: ReadonlyArray<{ id: string; itemId: string }> | null | undefined,
  kitItemId: string,
): string | null {
  if (!kitItemId || typeof kitItemId !== "string") return null;
  if (!Array.isArray(nextInventory)) return null;
  const prev =
    prevInventoryIds instanceof Set
      ? prevInventoryIds
      : new Set(Array.isArray(prevInventoryIds) ? prevInventoryIds : []);
  const fresh = nextInventory.find(
    (row) => row && !prev.has(row.id) && row.itemId === kitItemId,
  );
  if (fresh) return fresh.id;
  return nextInventory.find((row) => row?.itemId === kitItemId)?.id ?? null;
}
