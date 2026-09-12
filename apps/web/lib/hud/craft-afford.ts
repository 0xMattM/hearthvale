/**
 * Craft panel afford cues — recipe rows (PL35.1) + station T2 upgrade (PL39.1).
 * Recipes / upgrade costs unchanged; no always-on HUD column.
 */

import {
  BUILDING_UPGRADES,
  ITEMS,
  type ItemId,
  type UpgradableBuildingType,
} from "@game/shared";

/** Affordability of a craft recipe row (mats + energy; XP lock separate). */
export type CraftRecipeAffordMode = "affordable" | "short" | "xp_locked";

/**
 * Whether a recipe-book row is fully affordable vs short mats/energy.
 * XP-gated rows stay `xp_locked` (not green) even when mats/energy cover.
 *
 * @param entry - Flags from `describeRecipeBookEntry` / recipe book.
 * @returns `affordable` when craftable, `short` when mats/energy block, else `xp_locked`.
 */
export function craftRecipeAffordMode(entry: {
  xpLocked: boolean;
  missingMaterials: boolean;
  energyOk: boolean;
}): CraftRecipeAffordMode {
  if (entry.xpLocked) return "xp_locked";
  if (entry.missingMaterials || !entry.energyOk) return "short";
  return "affordable";
}

/** First blocking shortfall for mill/forge T2 upgrade (server order). */
export type CraftUpgradeShortfall =
  | { kind: "coins"; need: number }
  | { kind: "materials"; itemId: ItemId; qty: number; name: string }
  | { kind: "energy"; need: number };

/** Affordability of the craft panel Upgrade to T2 row. */
export type CraftUpgradeAffordMode = "affordable" | "short";

/** Inputs for upgrade afford checks (mirrors server `upgradeBuilding` gates). */
export interface CraftUpgradeAffordInput {
  buildingType: UpgradableBuildingType;
  softCurrency: number;
  energy: number;
  inventoryQty: (itemId: string) => number;
}

/**
 * First shortfall for upgrading mill/forge T1→T2 (coins → mats → energy).
 *
 * @param input - Building type + wallet / energy / inventory counts.
 * @returns Shortfall, or null when the upgrade is affordable.
 */
export function craftUpgradeShortfall(
  input: CraftUpgradeAffordInput,
): CraftUpgradeShortfall | null {
  const def = BUILDING_UPGRADES[input.buildingType];
  // Reason: PL39.1 — same gate order as server `upgradeBuilding` (coins → mats → energy).
  if (input.softCurrency < def.coinCost) {
    return { kind: "coins", need: def.coinCost };
  }
  for (const mat of def.materials) {
    if (input.inventoryQty(mat.itemId) < mat.qty) {
      return {
        kind: "materials",
        itemId: mat.itemId,
        qty: mat.qty,
        name: ITEMS[mat.itemId]?.name ?? mat.itemId,
      };
    }
  }
  if (input.energy < def.energyCost) {
    return { kind: "energy", need: def.energyCost };
  }
  return null;
}

/**
 * Whether the craft Upgrade to T2 row is affordable.
 *
 * @param input - Same as `craftUpgradeShortfall`.
 * @returns `affordable` when upgradable, else `short`.
 */
export function craftUpgradeAffordMode(
  input: CraftUpgradeAffordInput,
): CraftUpgradeAffordMode {
  return craftUpgradeShortfall(input) ? "short" : "affordable";
}

/**
 * Soft short-funds/mats/energy hint for the Upgrade to T2 row (PL39.1).
 * Null when affordable.
 *
 * @param input - Same as `craftUpgradeShortfall`.
 * @returns Compact `Need …` line, or null when affordable.
 */
export function craftUpgradeShortFundsHint(
  input: CraftUpgradeAffordInput,
): string | null {
  const shortfall = craftUpgradeShortfall(input);
  if (!shortfall) return null;
  if (shortfall.kind === "coins") return `Need ${shortfall.need}c`;
  if (shortfall.kind === "energy") return `Need ${shortfall.need} energy`;
  return `Need ${shortfall.qty}× ${shortfall.name}`;
}
