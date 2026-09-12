/**
 * Build Board place afford cues (PL35.2) — panel-open row clarity only.
 * Place costs / land unlimited unchanged; no always-on HUD column.
 */

import {
  ITEMS,
  PLAYER_LAND_STATIONS,
  type ItemId,
  type PlayerLandStationType,
} from "@game/shared";

/** First blocking shortfall for a station place (server order). */
export type BuildPlaceShortfall =
  | { kind: "xp"; need: number }
  | { kind: "coins"; need: number }
  | { kind: "materials"; itemId: ItemId; qty: number; name: string }
  | { kind: "energy"; need: number };

/** Affordability of a Build Board place row. */
export type BuildPlaceAffordMode = "affordable" | "short";

/** Inputs for place afford checks (mirrors expand pad shortfall shape). */
export interface BuildPlaceAffordInput {
  stationType: PlayerLandStationType;
  softCurrency: number;
  energy: number;
  builderXp: number;
  inventoryQty: (itemId: string) => number;
}

/**
 * First shortfall for placing a land station (XP → coins → mats → energy).
 *
 * @param input - Station type + wallet / energy / builder XP / inventory counts.
 * @returns Shortfall, or null when the place is affordable.
 */
export function buildPlaceShortfall(
  input: BuildPlaceAffordInput,
): BuildPlaceShortfall | null {
  const recipe = PLAYER_LAND_STATIONS[input.stationType];
  const minXp = recipe.minBuilderXp ?? 0;
  // Reason: PL35.2 — same gate order as server `buildStation` (XP then coins/mats/energy).
  if (input.builderXp < minXp) return { kind: "xp", need: minXp };
  // Reason: place is free; coinCost kept at 0 — skip unless a future fee returns.
  if (recipe.coinCost > 0 && input.softCurrency < recipe.coinCost) {
    return { kind: "coins", need: recipe.coinCost };
  }
  for (const mat of recipe.materials) {
    if (input.inventoryQty(mat.itemId) < mat.qty) {
      return {
        kind: "materials",
        itemId: mat.itemId,
        qty: mat.qty,
        name: ITEMS[mat.itemId]?.name ?? mat.itemId,
      };
    }
  }
  if (input.energy < recipe.energyCost) {
    return { kind: "energy", need: recipe.energyCost };
  }
  return null;
}

/**
 * Whether a Build Board place row is affordable.
 *
 * @param input - Same as `buildPlaceShortfall`.
 * @returns `affordable` when placeable, else `short`.
 */
export function buildPlaceAffordMode(
  input: BuildPlaceAffordInput,
): BuildPlaceAffordMode {
  return buildPlaceShortfall(input) ? "short" : "affordable";
}

/**
 * Soft short-funds/mats/energy/XP hint for Build place rows (PL35.2).
 * Null when affordable.
 *
 * @param input - Same as `buildPlaceShortfall`.
 * @returns Compact `Need …` line, or null when affordable.
 */
export function buildPlaceShortFundsHint(
  input: BuildPlaceAffordInput,
): string | null {
  const shortfall = buildPlaceShortfall(input);
  if (!shortfall) return null;
  if (shortfall.kind === "coins") return `Need ${shortfall.need}c`;
  if (shortfall.kind === "energy") return `Need ${shortfall.need} energy`;
  if (shortfall.kind === "xp") return `Need ${shortfall.need} builder XP`;
  return `Need ${shortfall.qty}× ${shortfall.name}`;
}
