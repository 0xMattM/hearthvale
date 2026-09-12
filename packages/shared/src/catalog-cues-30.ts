/**
 * Visual cue configs part 30/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  CanonicalLandKind,
  LandKind,
  cssHexRgbDistance,
  isCityLandKind,
  isExploreLandKind
} from "./catalog-buildings.js";
import { CROPS, CropDefinition, ENERGY, ProfessionId, RECIPES, RecipeDefinition } from "./catalog-recipes.js";
import { ItemId, TOOL_HUNT_DAMAGE } from "./catalog-items.js";
import { EXPAND_FIELD_PAD_FLASH } from "./catalog-cues-28.js";
import { EXPAND_PAD_ATMOSPHERE_CUE, EXPAND_PAD_LANDMARK_CUE, ExpandSlotShortfall, expandSlotShortfall } from "./catalog-cues-29.js";
/**
 * Soft sine envelope for expand-pad atmosphere leftover (PL196.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function expandPadAtmospherePulseEnvelope(nowMs: number): number {
  const period = EXPAND_PAD_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the expand-pad atmosphere leftover (PL196.2).
 *
 * @param pulseEnvelope - 0..1 from `expandPadAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function expandPadAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EXPAND_PAD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under an expand pad (PL196.2).
 *
 * @param pulseEnvelope - 0..1 from `expandPadAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function expandPadAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = EXPAND_PAD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between expand leftover mist and warm landmark (PL196.2).
 *
 * @returns Soft distinct cool footing so leftover mist ≠ warm field-gold landmark alone.
 */
export function expandPadAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    EXPAND_PAD_ATMOSPHERE_CUE.emissive,
    EXPAND_PAD_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between expand leftover mist and field flash gold (PL196.2).
 *
 * @returns Soft distinct cool footing so leftover mist ≠ one-shot flash alone.
 */
export function expandPadAtmosphereVsFieldFlashContrast(): number {
  return cssHexRgbDistance(
    EXPAND_PAD_ATMOSPHERE_CUE.emissive,
    EXPAND_FIELD_PAD_FLASH.emissiveColor,
  );
}

/**
 * One-line shortfall copy for expand refuse / walk-up clarity (PL26.2).
 * Names coins / mats / energy without inventing costs.
 *
 * @param shortfall - From `expandSlotShortfall`.
 * @returns Player-facing fragment, or null when none.
 */
export function expandRefuseClarityText(
  shortfall: ExpandSlotShortfall | null,
): string | null {
  if (!shortfall) return null;
  if (shortfall.kind === "coins") return `Need ${shortfall.need} coins`;
  if (shortfall.kind === "energy") return `Need ${shortfall.need} energy`;
  return `Need ${shortfall.qty}× ${shortfall.name}`;
}

/** Mill/forge T1→T2 upgrades (F10.4) — coin + mat sink. */
export const BUILDING_UPGRADES = {
  mill: {
    fromTier: 1,
    toTier: 2,
    coinCost: 60,
    materials: [
      { itemId: "plank" as ItemId, qty: 4 },
      { itemId: "iron_bar" as ItemId, qty: 2 },
    ],
    energyCost: ENERGY.costs.build,
  },
  forge: {
    fromTier: 1,
    toTier: 2,
    coinCost: 60,
    materials: [
      { itemId: "iron_bar" as ItemId, qty: 3 },
      { itemId: "plank" as ItemId, qty: 2 },
    ],
    energyCost: ENERGY.costs.build,
  },
} as const;

export type UpgradableBuildingType = keyof typeof BUILDING_UPGRADES;

/**
 * Returns the upgrade definition when the building type/tier can advance.
 */
export function getBuildingUpgrade(type: string, fromTier: number) {
  if (!(type in BUILDING_UPGRADES)) return undefined;
  const def = BUILDING_UPGRADES[type as UpgradableBuildingType];
  if (def.fromTier !== fromTier) return undefined;
  return def;
}

/**
 * True when type is mill or forge (upgradeable stations).
 */
export function isUpgradableBuildingType(
  type: string,
): type is UpgradableBuildingType {
  return type in BUILDING_UPGRADES;
}

/**
 * T2 stations spend slightly less energy per craft.
 */
export function stationCraftEnergy(baseCost: number, stationTier: number): number {
  if (stationTier >= 2) return Math.max(1, baseCost - 2);
  return baseCost;
}

/**
 * T2 stations grant +1 stackable output (throughput bonus).
 */
export function stationCraftOutputBonus(
  stationTier: number,
  stackable: boolean,
): number {
  if (stationTier >= 2 && stackable) return 1;
  return 0;
}

export const STARTER_COINS = 40;

export const STARTER_INVENTORY: Array<{ itemId: ItemId; qty: number }> = [
  { itemId: "wheat_seed", qty: 6 },
  { itemId: "corn_seed", qty: 2 },
  { itemId: "iron_ore", qty: 4 },
  { itemId: "bread", qty: 3 },
  { itemId: "wooden_hoe", qty: 1 },
];

export const VENDOR = {
  sell: {
    wheat: 2,
    flour: 5,
    corn: 1,
    cornmeal: 3,
    cornbread: 4,
    potato: 3,
    roast_potato: 4,
    cotton: 3,
    herb: 5,
    iron_ore: 1,
    copper_ore: 2,
    copper_bar: 5,
    gold_ore: 8,
    gold_bar: 16,
    leather: 3,
    raw_meat: 2,
    boar_tusk: 6,
    wood: 2,
    plank: 4,
    stew: 5,
    travel_ration: 8,
    /** Fisher catch sink (CL23.2) — low NPC rate; player market is the main outlet. */
    fish: 2,
    /**
     * Craft sinks (CL33.1) — low NPC buyback; below mat coin value so vendor is not wealth primary.
     * Herbal tonic (~45E) sits under stew (5); bandage (~20E) matches fish.
     */
    herbal_tonic: 4,
    cloth_bandage: 2,
    /**
     * Carpenter crate sink (CL39.1) — below 2× plank buyback (8) so vendor is not wealth primary.
     * Player market remains the main outlet for housing crates.
     */
    wood_crate: 3,
    /**
     * Cook bread sink (CL47.3) — below flour buyback (5) and stew (5); light energy food outlet.
     * Player market remains available (CL35.2).
     */
    bread: 3,
    /**
     * Cook fish sink (CL51.1) — above raw fish (2), under stew (5); parity with tonic (~40–45E).
     * Player market remains available for stackable cooked_fish.
     */
    cooked_fish: 4,
  } as Partial<Record<ItemId, number>>,
  buy: {
    wheat_seed: 8,
    corn_seed: 5,
    potato_seed: 10,
    cotton_seed: 12,
    herb_seed: 15,
  } as Partial<Record<ItemId, number>>,
};

/**
 * Regional vendor book (F11.3) — explore pays more for wood/hunt mats, seeds cost more.
 * City hub (CL2.3) sells basic tools + seeds.
 */
export function getVendorPrices(landKind: LandKind = "player_land"): {
  sell: Partial<Record<ItemId, number>>;
  buy: Partial<Record<ItemId, number>>;
} {
  if (isCityLandKind(landKind)) {
    return {
      sell: { ...VENDOR.sell },
      buy: {
        wheat_seed: 8,
        corn_seed: 5,
        potato_seed: 10,
        cotton_seed: 12,
        herb_seed: 15,
        wooden_hoe: 12,
        iron_hammer: 28,
        wooden_club: 16,
      },
    };
  }
  if (isExploreLandKind(landKind)) {
    return {
      sell: {
        ...VENDOR.sell,
        wheat: 1,
        flour: 3,
        corn: 1,
        potato: 2,
        wood: 3,
        plank: 6,
        /** Mine ore premium (CL44.1) — above City/Land base (1). */
        iron_ore: 2,
        copper_ore: 3,
        gold_ore: 10,
        leather: 5,
        raw_meat: 3,
        boar_tusk: 7,
      },
      buy: {
        wheat_seed: 10,
        corn_seed: 6,
        potato_seed: 12,
        cotton_seed: 14,
        herb_seed: 18,
      },
    };
  }
  return {
    sell: { ...VENDOR.sell },
    buy: { ...VENDOR.buy },
  };
}

/**
 * Hunt/gather mats that sell for more at the Exploration vendor than City (CL10.2 / CL44.1).
 */
export const EXPLORE_VENDOR_PREMIUM_SELL_ITEMS = [
  "wood",
  "plank",
  "iron_ore",
  "copper_ore",
  "gold_ore",
  "leather",
  "raw_meat",
  "boar_tusk",
] as const satisfies ReadonlyArray<ItemId>;

/**
 * Vendor prices for every canonical CityLands region (telemetry / UI).
 */
export function getAllRegionalVendorPrices(): Record<
  CanonicalLandKind,
  { sell: Partial<Record<ItemId, number>>; buy: Partial<Record<ItemId, number>> }

> {
  return {
    city: getVendorPrices("city"),
    player_land: getVendorPrices("player_land"),
    explore: getVendorPrices("explore"),
    warrior: getVendorPrices("warrior"),
  };
}

/**
 * Returns soft hunt damage bonus for an equipped tool item id.
 */
export function huntDamageBonus(itemId: string | null | undefined): number {
  if (!itemId) return 0;
  return TOOL_HUNT_DAMAGE[itemId as ItemId] ?? 0;
}

/** Energy restored by edible stackables (F10.3 tiers). */
export const FOOD_RESTORE = {
  bread: ENERGY.breadRestore,
  cornbread: ENERGY.cornbreadRestore,
  roast_potato: ENERGY.roastPotatoRestore,
  cooked_meat: ENERGY.cookedMeatRestore,
  cooked_fish: ENERGY.cookedFishRestore,
  stew: ENERGY.stewRestore,
  travel_ration: ENERGY.rationRestore,
  herbal_tonic: ENERGY.herbalTonicRestore,
  cloth_bandage: ENERGY.bandageRestore,
} as const;

/** HP restored by edible stackables (same tiers as energy). */
export const FOOD_HEAL = FOOD_RESTORE;

export type EdibleItemId = keyof typeof FOOD_RESTORE;

/**
 * Returns true when itemId is a known edible stackable.
 */
export function isEdibleItemId(itemId: string): itemId is EdibleItemId {
  return itemId in FOOD_RESTORE;
}

export function getRecipe(recipeId: string): RecipeDefinition | undefined {
  return RECIPES.find((recipe) => recipe.id === recipeId);
}

export function getCropBySeed(seedItemId: ItemId): CropDefinition | undefined {
  return Object.values(CROPS).find((crop) => crop.seedItemId === seedItemId);
}

export function getCrop(cropId: string): CropDefinition | undefined {
  return CROPS[cropId];
}

/**
 * True when the item is a plantable crop seed.
 *
 * @param itemId - Inventory item id.
 * @returns Whether a crop definition uses this seed.
 */
export function isSeedItemId(itemId: string): itemId is ItemId {
  return Object.values(CROPS).some((crop) => crop.seedItemId === itemId);
}

/** Seed stack the player can plant on an empty crop plot. */
export interface PlantableSeed {
  seedItemId: ItemId;
  crop: CropDefinition;
  qty: number;
}

/**
 * Lists distinct plantable seeds the player currently holds.
 *
 * @param stacks - Inventory stacks (item id + qty).
 * @returns Crops the player can plant, in catalog order.
 */
export function plantableSeedsFromInventory(
  stacks: ReadonlyArray<{ itemId: string; qty: number }> | null | undefined,
): PlantableSeed[] {
  if (!Array.isArray(stacks)) return [];
  const qtyBySeed = new Map<ItemId, number>();
  for (const stack of stacks) {
    if (!isSeedItemId(stack.itemId) || !(stack.qty > 0)) continue;
    qtyBySeed.set(
      stack.itemId,
      (qtyBySeed.get(stack.itemId) ?? 0) + stack.qty,
    );
  }
  return Object.values(CROPS)
    .filter((crop) => (qtyBySeed.get(crop.seedItemId) ?? 0) > 0)
    .map((crop) => ({
      seedItemId: crop.seedItemId,
      crop,
      qty: qtyBySeed.get(crop.seedItemId) ?? 0,
    }));
}

/**
 * Applies dabbling tax / specialist discount from Content Lock P0.2.
 * Cook, hunters, and gather/craft ladders use base energy (no farm/smith focus tax).
 */
export function focusedEnergyCost(
  baseCost: number,
  profession: ProfessionId,
  farmerXp: number,
  blacksmithXp: number,
): number {
  if (
    profession === "cook" ||
    profession === "hunter" ||
    profession === "animal_hunter" ||
    profession === "monster_hunter" ||
    profession === "carpenter" ||
    profession === "weaver" ||
    profession === "forester" ||
    profession === "miner" ||
    profession === "builder" ||
    profession === "fisher" ||
    profession === "animal_breeder" ||
    profession === "alchemist"
  )
    return baseCost;
  const xp = profession === "farmer" ? farmerXp : blacksmithXp;
  const other = profession === "farmer" ? blacksmithXp : farmerXp;

  if (xp + 15 < other) return Math.ceil(baseCost * 1.5);
  if (xp >= 25 && xp >= 2 * other) return Math.max(1, baseCost - 2);
  return baseCost;
}

/**
 * Extra harvest wheat for focused farmers (Content Lock P0.2).
 */
export function focusedHarvestBonus(
  farmerXp: number,
  blacksmithXp: number,
): number {
  if (farmerXp >= 25 && farmerXp >= 2 * blacksmithXp) return 1;
  return 0;
}

/**
 * Whether the player meets a recipe XP gate.
 */
export function meetsRecipeXpGate(
  recipe: RecipeDefinition,
  farmerXp: number,
  blacksmithXp: number,
  cookXp = 0,
  hunterXp = 0,
  carpenterXp = 0,
  weaverXp = 0,
  foresterXp = 0,
  minerXp = 0,
  builderXp = 0,
  fisherXp = 0,
  animalBreederXp = 0,
  animalHunterXp = 0,
  monsterHunterXp = 0,
  alchemistXp = 0,
): boolean {
  const animalXp = animalHunterXp || hunterXp;
  const xp =
    recipe.profession === "farmer"
      ? farmerXp
      : recipe.profession === "blacksmith"
        ? blacksmithXp
        : recipe.profession === "hunter" || recipe.profession === "animal_hunter"
          ? animalXp
          : recipe.profession === "monster_hunter"
            ? monsterHunterXp
            : recipe.profession === "carpenter"
              ? carpenterXp
              : recipe.profession === "weaver"
                ? weaverXp
                : recipe.profession === "forester"
                  ? foresterXp
                  : recipe.profession === "miner"
                    ? minerXp
                    : recipe.profession === "builder"
                      ? builderXp
                      : recipe.profession === "fisher"
                        ? fisherXp
                        : recipe.profession === "animal_breeder"
                          ? animalBreederXp
                          : recipe.profession === "alchemist"
                            ? alchemistXp
                            : cookXp;
  return xp >= recipe.minProfessionXp;
}
