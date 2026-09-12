/**
 * Item catalog SoT (RF6.1) — split from catalog.ts.
 * Content Lock: docs/19_development_plan/MVPContentLock.md
 */

export type ItemId =
  | "wheat_seed"
  | "wheat"
  | "flour"
  | "corn_seed"
  | "corn"
  | "cornmeal"
  | "cornbread"
  | "potato_seed"
  | "potato"
  | "roast_potato"
  | "cotton_seed"
  | "cotton"
  | "herb_seed"
  | "herb"
  | "iron_ore"
  | "iron_bar"
  | "copper_ore"
  | "copper_bar"
  | "gold_ore"
  | "gold_bar"
  | "wooden_hoe"
  | "iron_hoe"
  | "iron_hoe_fine"
  | "iron_hammer"
  | "bread"
  | "leather"
  | "raw_meat"
  | "cooked_meat"
  | "boar_tusk"
  | "wood"
  | "plank"
  | "stew"
  | "travel_ration"
  | "cloth"
  | "fish"
  | "cooked_fish"
  | "herbal_tonic"
  /** Weaver cloth sink (CL29.2) — light edible bandage. */
  | "cloth_bandage"
  /** Carpenter plank sink (CL36.1) — housing-adjacent crate. */
  | "wood_crate"
  /** Homestead station kits (layout editor) — place on player land. */
  | "crop_plot_kit"
  | "tree_stump_kit"
  | "ore_node_kit"
  | "workshop_kit"
  | "mill_kit"
  | "forge_kit"
  | "kitchen_kit"
  | "loom_kit"
  | "fishing_dock_kit"
  | "animal_pen_kit"
  | "alchemy_bench_kit"
  /** Homestead decor kits (layout editor) — cosmetic only. */
  | "planter_kit"
  | "banner_kit"
  /** v1 combat gear — Explore / Arena fights (not gather tools). */
  | "wooden_club"
  | "iron_sword"
  | "wooden_bow"
  | "leather_armor"
  | "wooden_shield";

export interface ItemDefinition {
  id: ItemId;
  name: string;
  stackable: boolean;
  maxDurability?: number;
  equipSlot?: "tool" | "weapon" | "armor" | "shield";
}

/**
 * Soft hunt damage from equipped tools (F9.4). No NFT/combat power — craft sinks only.
 */
export const TOOL_HUNT_DAMAGE: Partial<Record<ItemId, number>> = {
  wooden_hoe: 1,
  iron_hoe: 2,
  iron_hoe_fine: 3,
  iron_hammer: 4,
};

export const ITEMS: Record<ItemId, ItemDefinition> = {
  wheat_seed: { id: "wheat_seed", name: "Wheat Seed", stackable: true },
  wheat: { id: "wheat", name: "Wheat", stackable: true },
  flour: { id: "flour", name: "Flour", stackable: true },
  corn_seed: { id: "corn_seed", name: "Corn Seed", stackable: true },
  corn: { id: "corn", name: "Corn", stackable: true },
  cornmeal: { id: "cornmeal", name: "Cornmeal", stackable: true },
  cornbread: { id: "cornbread", name: "Cornbread", stackable: true },
  potato_seed: { id: "potato_seed", name: "Potato Seed", stackable: true },
  potato: { id: "potato", name: "Potato", stackable: true },
  roast_potato: { id: "roast_potato", name: "Roast Potato", stackable: true },
  cotton_seed: { id: "cotton_seed", name: "Cotton Seed", stackable: true },
  cotton: { id: "cotton", name: "Cotton", stackable: true },
  herb_seed: { id: "herb_seed", name: "Herb Seed", stackable: true },
  herb: { id: "herb", name: "Herb", stackable: true },
  iron_ore: { id: "iron_ore", name: "Iron Ore", stackable: true },
  iron_bar: { id: "iron_bar", name: "Iron Bar", stackable: true },
  copper_ore: { id: "copper_ore", name: "Copper Ore", stackable: true },
  copper_bar: { id: "copper_bar", name: "Copper Bar", stackable: true },
  gold_ore: { id: "gold_ore", name: "Gold Ore", stackable: true },
  gold_bar: { id: "gold_bar", name: "Gold Bar", stackable: true },
  wooden_hoe: {
    id: "wooden_hoe",
    name: "Wooden Hoe",
    stackable: false,
    maxDurability: 25,
    equipSlot: "tool",
  },
  iron_hoe: {
    id: "iron_hoe",
    name: "Iron Hoe",
    stackable: false,
    maxDurability: 60,
    equipSlot: "tool",
  },
  iron_hoe_fine: {
    id: "iron_hoe_fine",
    name: "Fine Iron Hoe",
    stackable: false,
    maxDurability: 100,
    equipSlot: "tool",
  },
  iron_hammer: {
    id: "iron_hammer",
    name: "Iron Hammer",
    stackable: false,
    maxDurability: 50,
    equipSlot: "tool",
  },
  bread: { id: "bread", name: "Bread", stackable: true },
  leather: { id: "leather", name: "Leather", stackable: true },
  raw_meat: { id: "raw_meat", name: "Raw Meat", stackable: true },
  cooked_meat: { id: "cooked_meat", name: "Cooked Meat", stackable: true },
  boar_tusk: { id: "boar_tusk", name: "Boar Tusk", stackable: true },
  wood: { id: "wood", name: "Wood", stackable: true },
  plank: { id: "plank", name: "Plank", stackable: true },
  stew: { id: "stew", name: "Hearty Stew", stackable: true },
  travel_ration: { id: "travel_ration", name: "Travel Ration", stackable: true },
  cloth: { id: "cloth", name: "Cloth", stackable: true },
  fish: { id: "fish", name: "Fish", stackable: true },
  cooked_fish: { id: "cooked_fish", name: "Cooked Fish", stackable: true },
  herbal_tonic: {
    id: "herbal_tonic",
    name: "Herbal Tonic",
    stackable: true,
  },
  // Reason: CL29.2 — loom cloth sink; edible first-aid, not combat gear.
  cloth_bandage: {
    id: "cloth_bandage",
    name: "Cloth Bandage",
    stackable: true,
  },
  // Reason: CL36.1 — workshop plank sink; housing-adjacent stackable (no combat).
  wood_crate: {
    id: "wood_crate",
    name: "Wood Crate",
    stackable: true,
  },
  // Reason: Homestead editor — kits are placeable buildings; durability stores tier on pickup.
  crop_plot_kit: {
    id: "crop_plot_kit",
    name: "Crop Plot Kit",
    stackable: false,
  },
  tree_stump_kit: {
    id: "tree_stump_kit",
    name: "Tree Kit",
    stackable: false,
  },
  ore_node_kit: {
    id: "ore_node_kit",
    name: "Ore Rock Kit",
    stackable: false,
  },
  workshop_kit: {
    id: "workshop_kit",
    name: "Workshop Kit",
    stackable: false,
  },
  mill_kit: {
    id: "mill_kit",
    name: "Mill Kit",
    stackable: false,
  },
  forge_kit: {
    id: "forge_kit",
    name: "Forge Kit",
    stackable: false,
  },
  kitchen_kit: {
    id: "kitchen_kit",
    name: "Kitchen Kit",
    stackable: false,
  },
  loom_kit: {
    id: "loom_kit",
    name: "Loom Kit",
    stackable: false,
  },
  fishing_dock_kit: {
    id: "fishing_dock_kit",
    name: "Fishing Dock Kit",
    stackable: false,
  },
  animal_pen_kit: {
    id: "animal_pen_kit",
    name: "Animal Pen Kit",
    stackable: false,
  },
  alchemy_bench_kit: {
    id: "alchemy_bench_kit",
    name: "Alchemy Bench Kit",
    stackable: false,
  },
  planter_kit: {
    id: "planter_kit",
    name: "Flower Planter Kit",
    stackable: false,
  },
  banner_kit: {
    id: "banner_kit",
    name: "Yard Banner Kit",
    stackable: false,
  },
  wooden_club: {
    id: "wooden_club",
    name: "Wooden Club",
    stackable: false,
    maxDurability: 40,
    equipSlot: "weapon",
  },
  iron_sword: {
    id: "iron_sword",
    name: "Iron Sword",
    stackable: false,
    maxDurability: 70,
    equipSlot: "weapon",
  },
  wooden_bow: {
    id: "wooden_bow",
    name: "Wooden Bow",
    stackable: false,
    maxDurability: 50,
    equipSlot: "weapon",
  },
  leather_armor: {
    id: "leather_armor",
    name: "Leather Armor",
    stackable: false,
    maxDurability: 60,
    equipSlot: "armor",
  },
  wooden_shield: {
    id: "wooden_shield",
    name: "Wooden Shield",
    stackable: false,
    maxDurability: 50,
    equipSlot: "shield",
  },
};
