/**
 * Craft panel chrome — recipe-book tiles + workbench copy (HUD only).
 * Recipes, costs, and gates stay in the catalog / recipe-book helpers.
 */

import { PLAYER_LAND_STATIONS, type StationId } from "@game/shared";
import type { CraftRecipeAffordMode } from "@/lib/hud/craft-afford";

/** Flags that pick the Start / Locked / Busy label on the workbench. */
export interface CraftRecipeActionInput {
  canCraft: boolean;
  yoursWorking: boolean;
  yoursReady: boolean;
  peerBusy: boolean;
}

/**
 * Station title for the recipe-book header (catalog names, not raw ids).
 *
 * @param station - Craft station id.
 * @returns Player-facing station name.
 */
export function craftStationTitle(station: StationId): string {
  return PLAYER_LAND_STATIONS[station]?.name ?? station;
}

/**
 * Readable profession chip (underscores → spaces).
 *
 * @param profession - Catalog profession id.
 * @returns Lowercase display label.
 */
export function craftProfessionLabel(profession: string): string {
  return profession.replaceAll("_", " ");
}

/**
 * Workbench action label. Copy matches the legacy Start / Locked / Busy buttons.
 *
 * @param input - Recipe gate plus station occupancy.
 * @returns Button label.
 */
export function craftRecipeActionLabel(input: CraftRecipeActionInput): string {
  if (!input.canCraft) return "Locked";
  if (input.yoursWorking || input.yoursReady) return "In progress";
  if (input.peerBusy) return "Busy";
  return "Start";
}

/**
 * Keeps the selected recipe when it is still in the book; otherwise first row.
 *
 * @param recipeIds - Book order (can-craft first from `buildRecipeBook`).
 * @param currentId - Current selection, if any.
 * @returns Id to show on the workbench, or null when the book is empty.
 */
export function defaultSelectedCraftRecipeId(
  recipeIds: readonly string[],
  currentId: string | null,
): string | null {
  if (currentId && recipeIds.includes(currentId)) return currentId;
  return recipeIds[0] ?? null;
}

/**
 * Tile class list — keeps PL35.1 afford tints plus selected chrome.
 *
 * @param afford - Afford mode from `craftRecipeAffordMode`.
 * @param selected - Whether this tile is the workbench recipe.
 * @returns Space-separated class names.
 */
export function craftRecipeTileClassName(
  afford: CraftRecipeAffordMode,
  selected: boolean,
): string {
  return [
    "craft-panel__tile",
    "craft-panel__recipe",
    `craft-panel__recipe--${afford}`,
    selected ? "craft-panel__tile--selected" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
