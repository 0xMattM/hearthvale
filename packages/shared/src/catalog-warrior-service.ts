/**
 * City service kits + warrior arena layout (RF6.3).
 */

import type { BuildingType, CanonicalLandKind } from "./catalog-land.js";

export const CITY_SERVICE_BUILDING_TYPES = [
  "vendor_stall",
  "market_board",
  "notice_board",
] as const satisfies readonly BuildingType[];

export type CityServiceBuildingType =
  (typeof CITY_SERVICE_BUILDING_TYPES)[number];

/** Silhouette kit kind — awning stall vs hanging board vs single post. */
export type CityServiceVisualKit = "awning" | "board" | "post";

/**
 * Distinct visual kits for city service buildings (PL1.3).
 * Walk-up prompt meaning stays in interact-prompt; this is silhouette SoT only.
 */
export const CITY_SERVICE_VISUAL_KITS: Readonly<
  Record<
    CityServiceBuildingType,
    { kit: CityServiceVisualKit; worldLabel: string }
  >
> = {
  vendor_stall: { kit: "awning", worldLabel: "Vendor" },
  market_board: { kit: "board", worldLabel: "Market" },
  notice_board: { kit: "post", worldLabel: "Notices" },
};

/**
 * True when a building type is a city service silhouette (not scarce craft/gather).
 *
 * @param type - Building type id.
 */
export function isCityServiceBuildingType(
  type: string,
): type is CityServiceBuildingType {
  return (CITY_SERVICE_BUILDING_TYPES as readonly string[]).includes(type);
}

/**
 * Visual kit for a city service building (PL1.3).
 *
 * @param type - Building type id.
 * @returns Kit + world label, or null when not a service type.
 */
export function cityServiceVisualKit(
  type: string,
): { kit: CityServiceVisualKit; worldLabel: string } | null {
  if (!isCityServiceBuildingType(type)) return null;
  return CITY_SERVICE_VISUAL_KITS[type];
}

/**
 * Warrior arena stub map (CL5.1) — optional parallel combat path.
 * Placeholder space only: no balance, gear ladder, or profession coupling.
 */
export const WARRIOR_LAND = {
  buildSlots: 4,
  kind: "warrior" as CanonicalLandKind,
} as const;

/**
 * Arena-only building types — never placeable on player land (CL11.2).
 * Keep homestead build catalog free of warrior training structures.
 */
export const WARRIOR_TRAINING_BUILDING_TYPES = [
  "arena_board",
  "arena_dummy",
] as const;

export type WarriorTrainingBuildingType =
  (typeof WARRIOR_TRAINING_BUILDING_TYPES)[number];

/**
 * True when type is reserved for the warrior arena map (not homestead).
 *
 * @param type - Building type id.
 */
export function isWarriorTrainingBuildingType(
  type: string,
): type is WarriorTrainingBuildingType {
  return (WARRIOR_TRAINING_BUILDING_TYPES as readonly string[]).includes(type);
}

export const WARRIOR_BUILDINGS: Array<{
  type: BuildingType;
  slotIndex: number;
  x: number;
  z: number;
}> = [
  // Entry / exit portal — free travel out (north of ring)
  { type: "portal", slotIndex: 0, x: 0, z: -5 },
  // Center dummy — live sparring (LMB attack / RMB block)
  { type: "arena_dummy", slotIndex: 1, x: 0, z: 0 },
  // Ring plaques (east / west) — optional-path info
  { type: "arena_board", slotIndex: 2, x: -4, z: 2 },
  { type: "arena_board", slotIndex: 3, x: 4, z: 2 },
];

/**
 * Map-select destinations — four CityLands spaces (PlayerVision).
 * Free instant travel between all four (CL1.2).
 */
