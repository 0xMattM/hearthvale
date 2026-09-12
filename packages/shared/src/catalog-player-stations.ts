/**
 * Player-land stations, housing decor, process/gather ready labels (RF6.3).
 */

import type { ItemId } from "./catalog-items.js";
import { ENERGY } from "./catalog-recipes.js";
import type { BuildingType, CanonicalLandKind } from "./catalog-land.js";
import { BUILDER_PLACE_XP } from "./catalog-gather-nodes.js";
import { cityFishingSpotWorldName } from "./catalog-city-river.js";
import { homesteadYardHalf, WORLD } from "./world.js";

export const PLAYER_LAND = {
  buildSlots: 8,
  /** Fresh land has no production plots (CL3.1); players place their own. */
  cropPlotCount: 0,
  kind: "player_land" as CanonicalLandKind,
} as const;

/** Alias kept for older call sites / Content Lock history. */
export const STARTER_LAND = PLAYER_LAND;

/**
 * Non-production markers only on fresh player land (CL3.1).
 * Layout editor is a hotkey — no walk-up build board is seeded.
 * Visit/load may ensure these; never refill mill/forge/plots/etc.
 */
export const PLAYER_LAND_BUILDINGS: Array<{
  type: BuildingType;
  slotIndex: number;
  x: number;
  z: number;
}> = [];

/** Production / gather / craft stations placeable on player land (CL3.2). Unlimited per type. */
export type PlayerLandStationType =
  | "crop_plot"
  | "tree_stump"
  | "ore_node"
  | "workshop"
  | "mill"
  | "forge"
  | "kitchen"
  | "loom"
  | "fishing_dock"
  | "animal_pen"
  | "alchemy_bench";

/**
 * Build Board station groups for walk-up panel headers (PL3.2).
 * Costs stay in `PLAYER_LAND_STATIONS`; order within each group is place UX.
 */
export const PLAYER_LAND_STATION_BUILD_GROUPS: ReadonlyArray<{
  id: "gather" | "process" | "care";
  header: string;
  stations: ReadonlyArray<PlayerLandStationType>;
}> = [
  {
    id: "gather",
    header: "Gather",
    stations: ["crop_plot", "tree_stump", "ore_node", "fishing_dock"],
  },
  {
    id: "process",
    header: "Process",
    stations: ["workshop", "mill", "forge", "kitchen", "alchemy_bench", "loom"],
  },
  {
    id: "care",
    header: "Care",
    stations: ["animal_pen"],
  },
];

export const PLAYER_LAND_STATIONS: Record<
  PlayerLandStationType,
  {
    name: string;
    /** @deprecated Place is free; craft kits spend materials instead. */
    coinCost: number;
    materials: Array<{ itemId: ItemId; qty: number }>;
    /** @deprecated Place is free; craft spends ENERGY.costs.craft. */
    energyCost: number;
    /** Kit inventory item produced by workshop craft. */
    kitItemId: ItemId;
    /** Minimum builder XP to craft the kit (was place gate CL26.1). */
    minBuilderXp?: number;
  }
> = {
  crop_plot: {
    name: "Crop Plot",
    coinCost: 0,
    materials: [{ itemId: "wood", qty: 2 }],
    energyCost: ENERGY.costs.build,
    kitItemId: "crop_plot_kit",
  },
  tree_stump: {
    name: "Tree",
    coinCost: 0,
    materials: [{ itemId: "wood", qty: 1 }],
    energyCost: ENERGY.costs.build,
    kitItemId: "tree_stump_kit",
  },
  ore_node: {
    name: "Ore Rock",
    coinCost: 0,
    materials: [{ itemId: "iron_ore", qty: 1 }],
    energyCost: ENERGY.costs.build,
    kitItemId: "ore_node_kit",
  },
  workshop: {
    name: "Carpenter Table",
    coinCost: 0,
    materials: [
      { itemId: "wood", qty: 4 },
      { itemId: "plank", qty: 2 },
    ],
    energyCost: ENERGY.costs.build,
    kitItemId: "workshop_kit",
  },
  mill: {
    name: "Mill",
    coinCost: 0,
    materials: [
      { itemId: "wood", qty: 3 },
      { itemId: "iron_bar", qty: 1 },
    ],
    energyCost: ENERGY.costs.build,
    kitItemId: "mill_kit",
    minBuilderXp: BUILDER_PLACE_XP,
  },
  forge: {
    name: "Forge",
    coinCost: 0,
    materials: [
      { itemId: "iron_bar", qty: 2 },
      { itemId: "wood", qty: 2 },
    ],
    energyCost: ENERGY.costs.build,
    kitItemId: "forge_kit",
    minBuilderXp: BUILDER_PLACE_XP,
  },
  kitchen: {
    name: "Kitchen",
    coinCost: 0,
    materials: [
      { itemId: "wood", qty: 3 },
      { itemId: "iron_ore", qty: 1 },
    ],
    energyCost: ENERGY.costs.build,
    kitItemId: "kitchen_kit",
  },
  loom: {
    name: "Loom",
    coinCost: 0,
    materials: [
      { itemId: "wood", qty: 3 },
      { itemId: "plank", qty: 2 },
    ],
    energyCost: ENERGY.costs.build,
    kitItemId: "loom_kit",
    minBuilderXp: BUILDER_PLACE_XP,
  },
  fishing_dock: {
    name: "Fishing Dock",
    coinCost: 0,
    materials: [
      { itemId: "wood", qty: 3 },
      { itemId: "plank", qty: 1 },
    ],
    energyCost: ENERGY.costs.build,
    kitItemId: "fishing_dock_kit",
    minBuilderXp: BUILDER_PLACE_XP,
  },
  animal_pen: {
    name: "Animal Pen",
    coinCost: 0,
    materials: [
      { itemId: "wood", qty: 4 },
      { itemId: "plank", qty: 2 },
    ],
    energyCost: ENERGY.costs.build,
    kitItemId: "animal_pen_kit",
    minBuilderXp: BUILDER_PLACE_XP,
  },
  alchemy_bench: {
    name: "Alchemy Bench",
    coinCost: 0,
    materials: [
      { itemId: "wood", qty: 3 },
      { itemId: "iron_ore", qty: 1 },
    ],
    energyCost: ENERGY.costs.build,
    kitItemId: "alchemy_bench_kit",
    minBuilderXp: BUILDER_PLACE_XP,
  },
};

/** Kit item id → station type (homestead layout editor). */
export const STATION_KIT_TO_TYPE: Partial<
  Record<ItemId, PlayerLandStationType>
> = {
  crop_plot_kit: "crop_plot",
  tree_stump_kit: "tree_stump",
  ore_node_kit: "ore_node",
  workshop_kit: "workshop",
  mill_kit: "mill",
  forge_kit: "forge",
  kitchen_kit: "kitchen",
  loom_kit: "loom",
  fishing_dock_kit: "fishing_dock",
  animal_pen_kit: "animal_pen",
  alchemy_bench_kit: "alchemy_bench",
};

/** Decor kit → placed building type (cosmetic only). */
export const DECOR_KIT_TO_TYPE: Partial<
  Record<ItemId, "decor_planter" | "decor_banner">
> = {
  planter_kit: "decor_planter",
  banner_kit: "decor_banner",
};

/** All homestead placeable kits (stations + decor). */
export const HOMESTEAD_KIT_TO_BUILDING: Partial<Record<ItemId, BuildingType>> = {
  ...STATION_KIT_TO_TYPE,
  ...DECOR_KIT_TO_TYPE,
};

/**
 * True when item is a placeable homestead station kit.
 */
export function isStationKitItemId(itemId: string): itemId is ItemId {
  return itemId in STATION_KIT_TO_TYPE;
}

/**
 * True when item is a placeable homestead kit (station or decor).
 */
export function isHomesteadKitItemId(itemId: string): itemId is ItemId {
  return itemId in HOMESTEAD_KIT_TO_BUILDING;
}

/**
 * True when item is a decor kit.
 */
export function isDecorKitItemId(itemId: string): itemId is ItemId {
  return itemId in DECOR_KIT_TO_TYPE;
}

/**
 * Station type for a kit item, or null.
 */
export function stationTypeFromKitItemId(
  itemId: string,
): PlayerLandStationType | null {
  if (!isStationKitItemId(itemId)) return null;
  return STATION_KIT_TO_TYPE[itemId] ?? null;
}

/**
 * Building type for any homestead kit, or null.
 */
export function buildingTypeFromKitItemId(
  itemId: string,
): BuildingType | null {
  if (!isHomesteadKitItemId(itemId)) return null;
  return HOMESTEAD_KIT_TO_BUILDING[itemId] ?? null;
}

/**
 * Kit item id for a player-land station type.
 */
export function kitItemIdForStation(
  stationType: PlayerLandStationType,
): ItemId {
  return PLAYER_LAND_STATIONS[stationType].kitItemId;
}

/**
 * Kit item id for a placed decor building, or null.
 */
export function kitItemIdForDecorBuilding(
  type: string,
): ItemId | null {
  if (type === "decor_planter") return "planter_kit";
  if (type === "decor_banner") return "banner_kit";
  return null;
}

/**
 * True when a placed building can be picked up at the build board.
 */
export function isHomesteadPickupBuildingType(type: string): boolean {
  return (
    isPlayerLandStationType(type) ||
    type === "decor_planter" ||
    type === "decor_banner"
  );
}

/**
 * Relative ghost size for place preview (world units).
 */
export function homesteadKitGhostSize(
  buildingType: string,
): { w: number; h: number; d: number } {
  if (buildingType === "decor_planter") return { w: 0.7, h: 0.55, d: 0.7 };
  if (buildingType === "decor_banner") return { w: 0.35, h: 1.4, d: 0.35 };
  if (buildingType === "mill" || buildingType === "forge")
    return { w: 1.4, h: 1.6, d: 1.4 };
  if (buildingType === "animal_pen") return { w: 1.6, h: 0.9, d: 1.6 };
  if (buildingType === "fishing_dock") return { w: 1.5, h: 0.7, d: 1.2 };
  if (buildingType === "crop_plot") return { w: 1.1, h: 0.25, d: 1.1 };
  return { w: 1.2, h: 1.1, d: 1.2 };
}

/**
 * Max absolute grid index for player-land placement (fits walk bounds).
 */
export function playerLandGridHalfExtent(nftSize?: string | null): number {
  const half = homesteadYardHalf(nftSize);
  return Math.floor(half / WORLD.GRID);
}

/**
 * True when grid cell is inside the homestead placeable area.
 */
export function isPlayerLandPlaceCell(
  x: number,
  z: number,
  nftSize?: string | null,
): boolean {
  const lim = playerLandGridHalfExtent(nftSize);
  return (
    Number.isInteger(x) &&
    Number.isInteger(z) &&
    Math.abs(x) <= lim &&
    Math.abs(z) <= lim
  );
}

/**
 * Builder XP required to place a land station (CL26.1).
 *
 * @param stationType - Player-land station id.
 * @returns Minimum builder XP; 0 when ungated.
 */
export function stationMinBuilderXp(stationType: PlayerLandStationType): number {
  return PLAYER_LAND_STATIONS[stationType].minBuilderXp ?? 0;
}

/**
 * True when type is a station players may place on their land (CL3.2).
 */
export function isPlayerLandStationType(
  type: string,
): type is PlayerLandStationType {
  return type in PLAYER_LAND_STATIONS;
}

/**
 * True when building is a production/gather/craft station (not a land marker).
 */
export function isProductionBuildingType(type: string): boolean {
  return (
    type === "crop_plot" ||
    type === "mill" ||
    type === "forge" ||
    type === "ore_node" ||
    type === "kitchen" ||
    type === "game_trail" ||
    type === "edge_thicket" ||
    type === "tree_stump" ||
    type === "workshop" ||
    type === "loom" ||
    type === "fishing_dock" ||
    type === "animal_pen" ||
    type === "alchemy_bench"
  );
}

/**
 * Non-production markers allowed on an otherwise empty player land (CL3.1).
 */
export function isNonProductionLandMarker(type: string): boolean {
  return (
    type === "build_board" ||
    type === "decor_pad" ||
    type === "decor_planter" ||
    type === "decor_banner" ||
    type === "portal"
  );
}

/**
 * Legacy packed homestead layout — NOT auto-applied on bootstrap/load (CL1.1 / CL3.1).
 * Kept as a reference template; tests may seed it explicitly via ensureStarterYardBuildings.
 * Grid units → world via client GRID.
 */
export const STARTER_BUILDINGS: Array<{
  type: BuildingType;
  slotIndex: number;
  x: number;
  z: number;
}> = [
  { type: "crop_plot", slotIndex: 0, x: -1, z: -1 },
  { type: "crop_plot", slotIndex: 1, x: 0, z: -1 },
  { type: "crop_plot", slotIndex: 2, x: -1, z: 0 },
  { type: "crop_plot", slotIndex: 3, x: 0, z: 0 },
  { type: "mill", slotIndex: 4, x: 3, z: -1 },
  { type: "forge", slotIndex: 5, x: 3, z: 1 },
  { type: "vendor_stall", slotIndex: 8, x: -3, z: 2 },
  { type: "ore_node", slotIndex: 9, x: -3, z: -1 },
  { type: "kitchen", slotIndex: 10, x: -3, z: 0 },
  // Hunt trails live on Exploration (CL4.2) — not homestead.
  { type: "tree_stump", slotIndex: 13, x: -2, z: 3 },
  { type: "workshop", slotIndex: 14, x: 3, z: 3 },
  { type: "portal", slotIndex: 15, x: 0, z: -3 },
  { type: "decor_pad", slotIndex: 16, x: -2, z: -2 },
  { type: "decor_pad", slotIndex: 17, x: 2, z: -2 },
  { type: "claim_node", slotIndex: 18, x: -4, z: 1 },
];

/** Cosmetic housing decor — craft kits (layout editor); legacy coin pad still exists. */
export type HousingDecorId = "planter" | "banner";

export const HOUSING_DECOR: Record<
  HousingDecorId,
  {
    name: string;
    /** Legacy decor-pad coin place (still works alongside kits). */
    coinCost: number;
    buildingType: "decor_planter" | "decor_banner";
    kitItemId: ItemId;
    materials: Array<{ itemId: ItemId; qty: number }>;
  }
> = {
  planter: {
    name: "Flower Planter",
    coinCost: 12,
    buildingType: "decor_planter",
    kitItemId: "planter_kit",
    materials: [{ itemId: "wood", qty: 2 }],
  },
  banner: {
    name: "Yard Banner",
    coinCost: 18,
    buildingType: "decor_banner",
    kitItemId: "banner_kit",
    materials: [
      { itemId: "wood", qty: 1 },
      { itemId: "plank", qty: 1 },
    ],
  },
};

/**
 * True when id is a placeable housing decor option.
 */
export function isHousingDecorId(id: string): id is HousingDecorId {
  return id in HOUSING_DECOR;
}

/**
 * True when building type is a housing decor pad or placed cosmetic.
 */
export function isHousingDecorBuilding(type: string): boolean {
  return (
    type === "decor_pad" ||
    type === "decor_planter" ||
    type === "decor_banner"
  );
}

/** Soft secondary line under housing decor world names (PL22.2). */
export const HOUSING_DECOR_WORLD_SOFT = "Decor";

/**
 * Maps a placed housing decor building type to catalog id.
 *
 * @param type - Building type string.
 * @returns Housing decor id, or null when not a placed cosmetic.
 */
export function housingDecorIdFromBuildingType(
  type: string,
): HousingDecorId | null {
  if (type === "decor_planter") return "planter";
  if (type === "decor_banner") return "banner";
  return null;
}

/**
 * World-label hierarchy for placed planter/banner (PL22.2).
 * Name leads (PL2.1 spirit); soft "Decor" secondary — no costs / HUD invent.
 *
 * @param id - Housing decor catalog id.
 * @returns Bold-name + soft detail parts for world Html.
 */
export function housingDecorWorldLabelParts(id: HousingDecorId): {
  name: string;
  soft: string;
} {
  return {
    name: HOUSING_DECOR[id].name,
    soft: HOUSING_DECOR_WORLD_SOFT,
  };
}

/** Process / craft stations that get name-first world Html (PL23.1). */
export type ProcessStationType =
  | "workshop"
  | "mill"
  | "forge"
  | "kitchen"
  | "alchemy_bench"
  | "loom";

/** Soft secondary under process station world names (PL23.1). */
export const PROCESS_STATION_WORLD_SOFT = "Craft";

export const PROCESS_STATION_TYPES: ReadonlyArray<ProcessStationType> = [
  "workshop",
  "mill",
  "forge",
  "kitchen",
  "alchemy_bench",
  "loom",
] as const;

/**
 * True when building type is a process/craft station with world name labels.
 *
 * @param type - Building type string.
 * @returns True for mill / forge / kitchen / workshop / loom / alchemy.
 */
export function isProcessStationBuilding(
  type: string,
): type is ProcessStationType {
  return (PROCESS_STATION_TYPES as readonly string[]).includes(type);
}

/**
 * World-label hierarchy for process craft stations (PL23.1).
 * Catalog name leads; soft Craft / Working / Collect / Busy by craft job.
 *
 * @param type - Process station building type.
 * @param craft - Optional craft glance from BuildingDto.
 * @returns Bold-name + soft detail parts for world Html.
 */
export function processStationWorldLabelParts(
  type: ProcessStationType,
  craft?: {
    state: "working" | "ready";
    isYours: boolean;
  } | null,
): {
  name: string;
  soft: string;
} {
  let soft: string = PROCESS_STATION_WORLD_SOFT;
  if (craft) {
    if (!craft.isYours) soft = "Busy";
    else if (craft.state === "ready") soft = "Collect";
    else soft = "Working";
  }
  return {
    name: PLAYER_LAND_STATIONS[type].name,
    soft,
  };
}

/**
 * Land gather / care stations that show a ready name cue
 * (PL23.2 tree/ore; PL30.1 fishing dock; PL30.2 animal pen).
 */
export type GatherReadyLabelType =
  | "tree_stump"
  | "ore_node"
  | "fishing_dock"
  | "animal_pen";

/** Soft secondary when a gather/care station is ready (PL23.2 / PL30). */
export const GATHER_READY_WORLD_SOFT = "Ready";

/**
 * True when type is a gather/care station with ready name cues.
 *
 * @param type - Building type string.
 * @returns True for tree_stump / ore_node / fishing_dock / animal_pen.
 */
export function isGatherReadyLabelBuilding(
  type: string,
): type is GatherReadyLabelType {
  return (
    type === "tree_stump" ||
    type === "ore_node" ||
    type === "fishing_dock" ||
    type === "animal_pen"
  );
}

/**
 * World-label hierarchy for ready gather/care stations (PL23.2 / PL30).
 * Name leads; soft "Ready" secondary. Depleted stay timer/pad only.
 *
 * @param type - Tree, ore, fishing dock, or animal pen building type.
 * @param landKind - Active map; city dock uses "Fishing Spot" instead of "Fishing Dock".
 * @returns Bold-name + soft detail parts for world Html when ready.
 */
export function gatherStationReadyWorldLabelParts(
  type: GatherReadyLabelType,
  landKind?: string | null,
): {
  name: string;
  soft: string;
} {
  const name =
    type === "fishing_dock" && landKind === "city"
      ? cityFishingSpotWorldName()
      : PLAYER_LAND_STATIONS[type].name;
  return {
    name,
    soft: GATHER_READY_WORLD_SOFT,
  };
}

/**
 * Exploration map template (CL4.1) — multi-section wilds:
 * woodland (trees), mines (ore), hunt nodes (Animal / Monster Hunter).
 * Not on player land. Legacy export aliases: FOREST_* (F11.1 glade).
 */

