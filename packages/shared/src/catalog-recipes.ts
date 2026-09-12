/**
 * Recipes, crops, professions, and energy craft costs (RF6.2) — split from catalog.ts.
 * Content Lock: docs/19_development_plan/MVPContentLock.md
 * Craft wait/collect: craftMs tiers (user override — start → wait → collect).
 */

import type { ItemId } from "./catalog-items.js";

export type ProfessionId =
  | "farmer"
  | "blacksmith"
  | "cook"
  | "hunter"
  | "animal_hunter"
  | "monster_hunter"
  | "carpenter"
  | "weaver"
  | "forester"
  | "miner"
  | "builder"
  | "fisher"
  | "animal_breeder"
  | "alchemist";

export type StationId =
  | "mill"
  | "forge"
  | "kitchen"
  | "workshop"
  | "loom"
  | "alchemy_bench";

/** Craft duration tiers (ms) — start at station, collect when ready. */
export const CRAFT_MS = {
  fast: 30_000,
  medium: 60_000,
  slow: 90_000,
  /** Fallback for any recipe without an explicit craftMs. */
  default: 60_000,
} as const;

export interface RecipeDefinition {
  id: string;
  name: string;
  profession: ProfessionId;
  station: StationId;
  inputs: Array<{ itemId: ItemId; qty: number }>;
  output: { itemId: ItemId; qty: number };
  energyCost: number;
  /** Minimum XP in recipe.profession required to craft. */
  minProfessionXp: number;
  /** Wall-clock wait after start before collect (ms). */
  craftMs: number;
}

export interface CropDefinition {
  id: string;
  seedItemId: ItemId;
  harvestItemId: ItemId;
  harvestQty: number;
  growMs: number;
  plantEnergy: number;
  harvestEnergy: number;
}

/**
 * Energy pool + action costs (Content Lock). Used by recipes/crops and gather/build.
 * Lives with craft tables so catalog-recipes does not import catalog.ts (cycle).
 */
export const ENERGY = {
  maxStart: 100,
  regenAmount: 1,
  regenIntervalMs: 30_000,
  /**
   * PL9.1 — soft TopBar warning when energy is at or below this % of max.
   * Clears automatically once recovered above the threshold (min HUD, no toast).
   */
  lowWarnPct: 25,
  costs: {
    plant: 5,
    harvest: 5,
    craft: 10,
    build: 15,
    gather: 8,
    hunt: 12,
  },
  breadRestore: 25,
  /** Fast corn mill food — between bread and cooked meat. */
  cornbreadRestore: 30,
  /** Slow potato roast — between cornbread and cooked meat. */
  roastPotatoRestore: 35,
  cookedMeatRestore: 40,
  cookedFishRestore: 40,
  stewRestore: 55,
  rationRestore: 75,
  /** Non-combat Alchemist brew (CL28.2) — between cooked fish and stew. */
  herbalTonicRestore: 45,
  /** Weaver cloth bandage (CL29.2) — light food-adjacent restore below bread. */
  bandageRestore: 20,
} as const;

/** Crop SoT — wheat stays 3 minutes (Content Lock); others trade wait vs coin value. */
export const CROPS: Record<string, CropDefinition> = {
  wheat: {
    id: "wheat",
    seedItemId: "wheat_seed",
    harvestItemId: "wheat",
    harvestQty: 2,
    growMs: 3 * 60 * 1000,
    plantEnergy: ENERGY.costs.plant,
    harvestEnergy: ENERGY.costs.harvest,
  },
  corn: {
    id: "corn",
    seedItemId: "corn_seed",
    harvestItemId: "corn",
    harvestQty: 2,
    growMs: 2 * 60 * 1000,
    plantEnergy: ENERGY.costs.plant,
    harvestEnergy: ENERGY.costs.harvest,
  },
  potato: {
    id: "potato",
    seedItemId: "potato_seed",
    harvestItemId: "potato",
    harvestQty: 2,
    growMs: 4 * 60 * 1000,
    plantEnergy: ENERGY.costs.plant,
    harvestEnergy: ENERGY.costs.harvest,
  },
  cotton: {
    id: "cotton",
    seedItemId: "cotton_seed",
    harvestItemId: "cotton",
    harvestQty: 2,
    growMs: 5 * 60 * 1000,
    plantEnergy: ENERGY.costs.plant,
    harvestEnergy: ENERGY.costs.harvest,
  },
  herb: {
    id: "herb",
    seedItemId: "herb_seed",
    harvestItemId: "herb",
    harvestQty: 1,
    growMs: 6 * 60 * 1000,
    plantEnergy: ENERGY.costs.plant,
    harvestEnergy: ENERGY.costs.harvest,
  },
};

export const RECIPES: RecipeDefinition[] = [
  {
    id: "mill_flour",
    name: "Mill Flour",
    profession: "farmer",
    station: "mill",
    inputs: [{ itemId: "wheat", qty: 2 }],
    output: { itemId: "flour", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "smelt_iron_bar",
    name: "Smelt Iron Bar",
    profession: "blacksmith",
    station: "forge",
    inputs: [{ itemId: "iron_ore", qty: 2 }],
    output: { itemId: "iron_bar", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "forge_iron_hoe",
    name: "Forge Iron Hoe",
    profession: "blacksmith",
    station: "forge",
    inputs: [{ itemId: "iron_bar", qty: 2 }],
    output: { itemId: "iron_hoe", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 20,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "forge_iron_hoe_fine",
    name: "Forge Fine Iron Hoe",
    profession: "blacksmith",
    station: "forge",
    inputs: [
      { itemId: "iron_bar", qty: 3 },
      { itemId: "iron_hoe", qty: 1 },
    ],
    output: { itemId: "iron_hoe_fine", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 50,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "forge_iron_hammer",
    name: "Forge Iron Hammer",
    profession: "blacksmith",
    station: "forge",
    inputs: [{ itemId: "iron_bar", qty: 2 }],
    output: { itemId: "iron_hammer", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 20,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "bake_bread",
    name: "Bake Bread",
    profession: "cook",
    station: "kitchen",
    inputs: [{ itemId: "flour", qty: 2 }],
    output: { itemId: "bread", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "cook_meat",
    name: "Cook Meat",
    profession: "cook",
    station: "kitchen",
    inputs: [{ itemId: "raw_meat", qty: 1 }],
    output: { itemId: "cooked_meat", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "cook_fish",
    name: "Cook Fish",
    profession: "cook",
    station: "kitchen",
    inputs: [{ itemId: "fish", qty: 1 }],
    output: { itemId: "cooked_fish", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "cook_stew",
    name: "Cook Hearty Stew",
    profession: "cook",
    station: "kitchen",
    inputs: [
      { itemId: "flour", qty: 1 },
      { itemId: "raw_meat", qty: 1 },
    ],
    output: { itemId: "stew", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 15,
    craftMs: CRAFT_MS.medium,
  },
  {
    // Reason: CL28.2 / CL31.3 — distinct non-combat brew at alchemy_bench (not kitchen stew).
    id: "brew_herbal_tonic",
    name: "Brew Herbal Tonic",
    profession: "alchemist",
    station: "alchemy_bench",
    inputs: [
      { itemId: "wheat", qty: 2 },
      { itemId: "leather", qty: 1 },
    ],
    output: { itemId: "herbal_tonic", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "pack_travel_ration",
    name: "Pack Travel Ration",
    profession: "cook",
    station: "kitchen",
    inputs: [
      { itemId: "bread", qty: 1 },
      { itemId: "cooked_meat", qty: 1 },
    ],
    output: { itemId: "travel_ration", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 25,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "bind_tool_wrap",
    name: "Bind Tool Wrap",
    profession: "blacksmith",
    station: "forge",
    inputs: [
      { itemId: "leather", qty: 2 },
      { itemId: "iron_bar", qty: 1 },
    ],
    output: { itemId: "iron_hoe", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 20,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "forge_hoe_tusk_grip",
    name: "Forge Hoe (Tusk Grip)",
    profession: "blacksmith",
    station: "forge",
    inputs: [
      { itemId: "iron_bar", qty: 1 },
      { itemId: "boar_tusk", qty: 1 },
      { itemId: "leather", qty: 1 },
    ],
    output: { itemId: "iron_hoe", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 10,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "saw_planks",
    name: "Saw Planks",
    profession: "carpenter",
    station: "workshop",
    inputs: [{ itemId: "wood", qty: 2 }],
    output: { itemId: "plank", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "craft_wooden_hoe",
    name: "Craft Wooden Hoe",
    profession: "carpenter",
    station: "workshop",
    inputs: [
      { itemId: "wood", qty: 2 },
      { itemId: "plank", qty: 1 },
    ],
    output: { itemId: "wooden_hoe", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 10,
    craftMs: CRAFT_MS.slow,
  },
  {
    // Reason: CL36.1 — second light carpenter recipe; sinks planks into housing crate.
    id: "assemble_wood_crate",
    name: "Assemble Wood Crate",
    profession: "carpenter",
    station: "workshop",
    inputs: [{ itemId: "plank", qty: 2 }],
    output: { itemId: "wood_crate", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "carve_wooden_club",
    name: "Carve Wooden Club",
    profession: "carpenter",
    station: "workshop",
    inputs: [{ itemId: "wood", qty: 2 }],
    output: { itemId: "wooden_club", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "carve_wooden_bow",
    name: "Carve Wooden Bow",
    profession: "carpenter",
    station: "workshop",
    inputs: [
      { itemId: "plank", qty: 2 },
      { itemId: "cloth", qty: 1 },
    ],
    output: { itemId: "wooden_bow", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 10,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "carve_wooden_shield",
    name: "Carve Wooden Shield",
    profession: "carpenter",
    station: "workshop",
    inputs: [
      { itemId: "plank", qty: 2 },
      { itemId: "leather", qty: 1 },
    ],
    output: { itemId: "wooden_shield", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 10,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "forge_iron_sword",
    name: "Forge Iron Sword",
    profession: "blacksmith",
    station: "forge",
    inputs: [
      { itemId: "iron_bar", qty: 2 },
      { itemId: "leather", qty: 1 },
    ],
    output: { itemId: "iron_sword", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 20,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "stitch_leather_armor",
    name: "Stitch Leather Armor",
    profession: "weaver",
    station: "loom",
    inputs: [
      { itemId: "leather", qty: 3 },
      { itemId: "cloth", qty: 1 },
    ],
    output: { itemId: "leather_armor", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 10,
    craftMs: CRAFT_MS.medium,
  },
  // Homestead station kits — workshop wait/collect; mats from former place costs.
  {
    id: "craft_crop_plot_kit",
    name: "Craft Crop Plot Kit",
    profession: "builder",
    station: "workshop",
    inputs: [{ itemId: "wood", qty: 2 }],
    output: { itemId: "crop_plot_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "craft_tree_stump_kit",
    name: "Craft Tree Kit",
    profession: "builder",
    station: "workshop",
    inputs: [{ itemId: "wood", qty: 1 }],
    output: { itemId: "tree_stump_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "craft_ore_node_kit",
    name: "Craft Ore Rock Kit",
    profession: "builder",
    station: "workshop",
    inputs: [{ itemId: "iron_ore", qty: 1 }],
    output: { itemId: "ore_node_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "craft_workshop_kit",
    name: "Craft Workshop Kit",
    profession: "builder",
    station: "workshop",
    inputs: [
      { itemId: "wood", qty: 4 },
      { itemId: "plank", qty: 2 },
    ],
    output: { itemId: "workshop_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "craft_mill_kit",
    name: "Craft Mill Kit",
    profession: "builder",
    station: "workshop",
    inputs: [
      { itemId: "wood", qty: 3 },
      { itemId: "iron_bar", qty: 1 },
    ],
    output: { itemId: "mill_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 8,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "craft_forge_kit",
    name: "Craft Forge Kit",
    profession: "builder",
    station: "workshop",
    inputs: [
      { itemId: "iron_bar", qty: 2 },
      { itemId: "wood", qty: 2 },
    ],
    output: { itemId: "forge_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 8,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "craft_kitchen_kit",
    name: "Craft Kitchen Kit",
    profession: "builder",
    station: "workshop",
    inputs: [
      { itemId: "wood", qty: 3 },
      { itemId: "iron_ore", qty: 1 },
    ],
    output: { itemId: "kitchen_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "craft_loom_kit",
    name: "Craft Loom Kit",
    profession: "builder",
    station: "workshop",
    inputs: [
      { itemId: "wood", qty: 3 },
      { itemId: "plank", qty: 2 },
    ],
    output: { itemId: "loom_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 8,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "craft_fishing_dock_kit",
    name: "Craft Fishing Dock Kit",
    profession: "builder",
    station: "workshop",
    inputs: [
      { itemId: "wood", qty: 3 },
      { itemId: "plank", qty: 1 },
    ],
    output: { itemId: "fishing_dock_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 8,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "craft_animal_pen_kit",
    name: "Craft Animal Pen Kit",
    profession: "builder",
    station: "workshop",
    inputs: [
      { itemId: "wood", qty: 4 },
      { itemId: "plank", qty: 2 },
    ],
    output: { itemId: "animal_pen_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 8,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "craft_alchemy_bench_kit",
    name: "Craft Alchemy Bench Kit",
    profession: "builder",
    station: "workshop",
    inputs: [
      { itemId: "wood", qty: 3 },
      { itemId: "iron_ore", qty: 1 },
    ],
    output: { itemId: "alchemy_bench_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 8,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "craft_planter_kit",
    name: "Craft Flower Planter Kit",
    profession: "builder",
    station: "workshop",
    inputs: [{ itemId: "wood", qty: 2 }],
    output: { itemId: "planter_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "craft_banner_kit",
    name: "Craft Yard Banner Kit",
    profession: "builder",
    station: "workshop",
    inputs: [
      { itemId: "wood", qty: 1 },
      { itemId: "plank", qty: 1 },
    ],
    output: { itemId: "banner_kit", qty: 1 },
    energyCost: ENERGY.costs.build,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "weave_cloth",
    name: "Weave Cloth",
    profession: "weaver",
    station: "loom",
    inputs: [{ itemId: "leather", qty: 2 }],
    output: { itemId: "cloth", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    // Reason: CL29.2 — second loom recipe sinks cloth; weaver XP; light edible.
    id: "weave_cloth_bandage",
    name: "Sew Cloth Bandage",
    profession: "weaver",
    station: "loom",
    inputs: [{ itemId: "cloth", qty: 1 }],
    output: { itemId: "cloth_bandage", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "mill_cornmeal",
    name: "Mill Cornmeal",
    profession: "farmer",
    station: "mill",
    inputs: [{ itemId: "corn", qty: 2 }],
    output: { itemId: "cornmeal", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "bake_cornbread",
    name: "Bake Cornbread",
    profession: "cook",
    station: "kitchen",
    inputs: [{ itemId: "cornmeal", qty: 2 }],
    output: { itemId: "cornbread", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "roast_potato",
    name: "Roast Potato",
    profession: "cook",
    station: "kitchen",
    inputs: [{ itemId: "potato", qty: 1 }],
    output: { itemId: "roast_potato", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "cook_harvest_stew",
    name: "Cook Harvest Stew",
    profession: "cook",
    station: "kitchen",
    inputs: [
      { itemId: "potato", qty: 1 },
      { itemId: "corn", qty: 1 },
      { itemId: "flour", qty: 1 },
    ],
    output: { itemId: "stew", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 15,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "weave_cotton",
    name: "Weave Cotton Cloth",
    profession: "weaver",
    station: "loom",
    inputs: [{ itemId: "cotton", qty: 2 }],
    output: { itemId: "cloth", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "brew_herb_tonic",
    name: "Brew Herb Tonic",
    profession: "alchemist",
    station: "alchemy_bench",
    inputs: [{ itemId: "herb", qty: 1 }],
    output: { itemId: "herbal_tonic", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "smelt_copper_bar",
    name: "Smelt Copper Bar",
    profession: "blacksmith",
    station: "forge",
    inputs: [{ itemId: "copper_ore", qty: 2 }],
    output: { itemId: "copper_bar", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.fast,
  },
  {
    id: "smelt_gold_bar",
    name: "Smelt Gold Bar",
    profession: "blacksmith",
    station: "forge",
    inputs: [{ itemId: "gold_ore", qty: 2 }],
    output: { itemId: "gold_bar", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 10,
    craftMs: CRAFT_MS.medium,
  },
  {
    id: "bind_copper_wrap",
    name: "Bind Copper Wrap",
    profession: "blacksmith",
    station: "forge",
    inputs: [
      { itemId: "copper_bar", qty: 1 },
      { itemId: "leather", qty: 2 },
    ],
    output: { itemId: "iron_hoe", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 20,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "gild_iron_hoe",
    name: "Gild Iron Hoe",
    profession: "blacksmith",
    station: "forge",
    inputs: [
      { itemId: "gold_bar", qty: 1 },
      { itemId: "iron_hoe", qty: 1 },
    ],
    output: { itemId: "iron_hoe_fine", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 50,
    craftMs: CRAFT_MS.slow,
  },
  {
    id: "assemble_copper_crate",
    name: "Assemble Copper-Nail Crate",
    profession: "carpenter",
    station: "workshop",
    inputs: [
      { itemId: "plank", qty: 2 },
      { itemId: "copper_bar", qty: 1 },
    ],
    output: { itemId: "wood_crate", qty: 1 },
    energyCost: ENERGY.costs.craft,
    minProfessionXp: 0,
    craftMs: CRAFT_MS.medium,
  },
];

/**
 * Resolves craft wait ms for a recipe (defaults to CRAFT_MS.default).
 *
 * @param recipe - Recipe row or null.
 * @returns Duration in milliseconds.
 */
export function recipeCraftMs(
  recipe: Pick<RecipeDefinition, "craftMs"> | null | undefined,
): number {
  const ms = recipe?.craftMs;
  if (typeof ms === "number" && ms > 0) return ms;
  return CRAFT_MS.default;
}
