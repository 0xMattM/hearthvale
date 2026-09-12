/**
 * Gather / hunt node constants and tool repair (RF6.3).
 */

import type { ItemId } from "./catalog-items.js";
import { ENERGY } from "./catalog-recipes.js";

export const TOOL = {
  /**
   * Soft inventory + TopBar warn when remaining durability is at or below this % of max.
   * Clears when repaired/replaced (min HUD, no toast stack).
   * At 20%: wooden hoe 25 → ≤5 (prior hardcode); iron hammer 50 → ≤10.
   */
  lowWarnPct: 20,
  /**
   * Inventory repair restores durability to max (PL25.1).
   * One mat from the tool's craft chain — wear stays meaningful (Combat.md / GR-002).
   * Cue is confirm-only; do not retune these costs when polishing feedback.
   */
  repairMats: {
    wooden_hoe: { itemId: "wood" as ItemId, qty: 1 },
    iron_hoe: { itemId: "iron_bar" as ItemId, qty: 1 },
    iron_hoe_fine: { itemId: "iron_bar" as ItemId, qty: 1 },
    iron_hammer: { itemId: "iron_bar" as ItemId, qty: 1 },
    wooden_club: { itemId: "wood" as ItemId, qty: 1 },
    iron_sword: { itemId: "iron_bar" as ItemId, qty: 1 },
    wooden_bow: { itemId: "plank" as ItemId, qty: 1 },
    leather_armor: { itemId: "leather" as ItemId, qty: 1 },
    wooden_shield: { itemId: "plank" as ItemId, qty: 1 },
  },
} as const;

/**
 * Material cost to fully repair a worn tool (PL25.1).
 *
 * @param itemId - Tool item id.
 * @returns Mat stack, or null when the item is not a repairable tool.
 */
export function toolRepairMatCost(
  itemId: string,
): { itemId: ItemId; qty: number } | null {
  const entry =
    TOOL.repairMats[itemId as keyof typeof TOOL.repairMats] ?? null;
  return entry;
}

/**
 * Whether a tool stack can be repaired (worn but still present).
 * Broken tools are deleted on wear-out — only partial wear is repairable.
 *
 * @param durability - Remaining durability on the stack.
 * @param maxDurability - Catalog max for the tool.
 * @returns True when durability is below max and still positive.
 */
export function canRepairTool(
  durability: number | null | undefined,
  maxDurability: number | null | undefined,
): boolean {
  if (durability == null || maxDurability == null) return false;
  if (!Number.isFinite(durability) || !Number.isFinite(maxDurability)) return false;
  if (maxDurability <= 0) return false;
  return durability > 0 && durability < maxDurability;
}

/** Ore kinds stored on `buildings.cropId` for `ore_node` rows (null = iron). */
export type OreKind = "iron" | "copper" | "gold";

/** Ore rock — Miner gather source (CL18.2; was blacksmith XP). */
export const ORE_NODES = {
  iron: {
    id: "iron" as const,
    yieldItemId: "iron_ore" as ItemId,
    yieldQty: 1,
    cooldownMs: 90_000,
    energyCost: ENERGY.costs.gather,
    requiredTool: "iron_hammer" as ItemId,
    xp: 5,
  },
  copper: {
    id: "copper" as const,
    yieldItemId: "copper_ore" as ItemId,
    yieldQty: 1,
    cooldownMs: 60_000,
    energyCost: ENERGY.costs.gather,
    requiredTool: "iron_hammer" as ItemId,
    xp: 5,
  },
  gold: {
    id: "gold" as const,
    yieldItemId: "gold_ore" as ItemId,
    yieldQty: 1,
    cooldownMs: 120_000,
    energyCost: ENERGY.costs.gather,
    requiredTool: "iron_hammer" as ItemId,
    xp: 6,
  },
} as const;

/** Starter-land iron rock — hammer required; slow renewable ore. */
export const ORE_NODE = ORE_NODES.iron;

/**
 * Resolves an ore-node kind, defaulting unknown/null ids to iron.
 *
 * @param kind - Stored `cropId` on an ore_node, or a catalog ore id.
 * @returns Ore node definition.
 */
export function getOreNode(
  kind: string | null | undefined,
): (typeof ORE_NODES)[OreKind] {
  if (kind === "copper" || kind === "gold" || kind === "iron") {
    return ORE_NODES[kind];
  }
  return ORE_NODES.iron;
}

/** Starter-land stump — Forester wood source (CL18.1; was carpenter). */
export const WOOD_STUMP = {
  yieldItemId: "wood" as ItemId,
  yieldQty: 1,
  cooldownMs: 75_000,
  energyCost: ENERGY.costs.gather,
  xp: 5,
} as const;

/**
 * Fishing dock — light Fisher catch source (CL19.1 / CL23.1).
 * No rod required yet; catch grants fisher XP.
 */
export const FISHING_DOCK = {
  yieldItemId: "fish" as ItemId,
  yieldQty: 1,
  cooldownMs: 60_000,
  energyCost: ENERGY.costs.gather,
  xp: 5,
} as const;

/**
 * Animal pen care (CL27.1 / CL27.2 / CL34.2) — wheat feed or wood bedding refresh.
 * Shared pen cooldown; no livestock combat or animal loot.
 */
export const ANIMAL_PEN = {
  feedItemId: "wheat" as ItemId,
  feedQty: 1,
  /** CL34.2 — light second beat: refresh bedding with wood (existing mat). */
  cleanItemId: "wood" as ItemId,
  cleanQty: 1,
  cooldownMs: 45_000,
  energyCost: ENERGY.costs.gather,
  xp: 5,
} as const;

/** Care mode for land animal-pen interact (feed vs bedding clean). */
export type AnimalPenCare = "feed" | "clean";

/** Profession XP granted when `placeLandStation` succeeds (CL18.3). */
export const BUILDER_PLACE_XP = 8;

/** Edge-of-land hunting trail — light combat mat source. */
export const HUNT = {
  cooldownMs: 60_000,
  energyCost: ENERGY.costs.hunt,
  leatherQty: 1,
  meatQty: 1,
  hammerBonusLeather: 1,
  xp: 8,
} as const;

/** Starter trail creature (F9.2). Soft fight; mats on win only. */
export const TRAIL_CREATURE = {
  id: "forest_hare",
  name: "Forest Hare",
  health: 24,
  damage: 6,
  defense: 2,
} as const;

/** Public edge thicket creature (F9.3) — tougher; unique mat. */
export const EDGE_CREATURE = {
  id: "brush_boar",
  name: "Brush Boar",
  health: 40,
  damage: 9,
  defense: 4,
} as const;

/** Public edge hunt zone — shared edge feel on starter land. */
export const EDGE_HUNT = {
  cooldownMs: 90_000,
  energyCost: ENERGY.costs.hunt,
  tuskQty: 1,
  meatQty: 1,
  xp: 12,
} as const;

/**
 * Free player land (CityLands CL3.1) — small private plot; starts empty of production.
 * `buildSlots` is capacity hint; stations are placed via build board (CL3.2), not pre-seeded.
 */
