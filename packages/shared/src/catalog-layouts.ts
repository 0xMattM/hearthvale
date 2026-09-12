/**
 * Explore / city / forest land layout templates (RF6.3).
 */

import type { BuildingType, CanonicalLandKind } from "./catalog-land.js";
import {
  CITY_RIVER_FISHER_NPC,
  CITY_RIVER_FISHING_DOCK,
} from "./catalog-city-river.js";

export * from "./catalog-city-river.js";
export * from "./catalog-city-perimeter.js";

export const EXPLORE_LAND = {
  buildSlots: 12,
  kind: "explore" as CanonicalLandKind,
} as const;

export const EXPLORE_BUILDINGS: Array<{
  type: BuildingType;
  slotIndex: number;
  x: number;
  z: number;
  /** Ore kind for `ore_node` (`iron` / `copper` / `gold`); stored as cropId. */
  cropId?: string;
}> = [
  // Mixed wilds — trees, ores, and dens share both halves (no woodland/mines yards).
  { type: "tree_stump", slotIndex: 1, x: -8, z: -1 },
  { type: "tree_stump", slotIndex: 2, x: 6, z: 5 },
  { type: "tree_stump", slotIndex: 3, x: -13, z: 7 },
  { type: "tree_stump", slotIndex: 4, x: 10, z: -8 },
  { type: "ore_node", slotIndex: 5, x: 8, z: -2, cropId: "iron" },
  { type: "ore_node", slotIndex: 6, x: -6, z: 3, cropId: "copper" },
  { type: "ore_node", slotIndex: 7, x: 12, z: 8, cropId: "copper" },
  { type: "ore_node", slotIndex: 8, x: -11, z: -5, cropId: "gold" },
  { type: "game_trail", slotIndex: 9, x: 0, z: -3 },
  { type: "game_trail", slotIndex: 10, x: 5, z: 10 },
  { type: "edge_thicket", slotIndex: 11, x: -9, z: 8 },
  { type: "edge_thicket", slotIndex: 12, x: 3, z: 4 },
];

/**
 * Explore wayfinding sections (CL10.1 / PL4.1 / PL4.2) — woodland / mines / hunt.
 * Grid coords match EXPLORE_BUILDINGS; no separate minimap.
 * Labels + hints stay SoT for floating world chrome; prompts still prefix `label`.
 */
export type ExploreSectionId = "woodland" | "mines" | "hunt";

export interface ExploreSectionMarker {
  id: ExploreSectionId;
  /** Short in-world / prompt label. */
  label: string;
  /** One-line hint under the floating label. */
  hint: string;
  /** Floor tint for the section patch (PL4.2: gather vs hunt must stay distinct). */
  floorColor: string;
  /** High-contrast accent for floating label border / title (PL4.1). */
  labelAccent: string;
  /**
   * Optional approach-path tint (PL4.2). Hunt uses a warm trail belt so hunters
   * do not miss the north grounds between woodland/mines greens.
   */
  pathColor?: string;
  /** Center in building-grid units (× WORLD.GRID in scene). */
  x: number;
  z: number;
  /** Ground patch size in world units [width, depth]. */
  floorSize: [number, number];
  buildingTypes: BuildingType[];
}

export const EXPLORE_SECTIONS: ExploreSectionMarker[] = [
  {
    id: "woodland",
    label: "Woodland",
    hint: "Chop wood · mixed through the wilds",
    floorColor: "#2e6b3c",
    labelAccent: "#9ee0a8",
    x: -11,
    z: 1,
    floorSize: [36, 32],
    buildingTypes: ["tree_stump"],
  },
  {
    id: "mines",
    label: "Mines",
    hint: "Chip iron, copper, or gold · mixed through the wilds",
    floorColor: "#4a5058",
    labelAccent: "#c8d0dc",
    x: 11,
    z: 1,
    floorSize: [32, 28],
    buildingTypes: ["ore_node"],
  },
  {
    id: "hunt",
    label: "Hunt grounds",
    hint: "Hunt trails among the trees · Exploration only",
    floorColor: "#6b5434",
    labelAccent: "#f0c878",
    pathColor: "#8a6a3a",
    x: 0,
    z: 12,
    floorSize: [28, 24],
    buildingTypes: ["game_trail", "edge_thicket"],
  },
];

/**
 * Parses a #RRGGBB (or #RGB) CSS hex into 0–255 RGB channels.
 *
 * @param hex - CSS hex color string.
 * @returns RGB tuple, or null when the string is not a valid hex.
 */
export function parseCssHexRgb(
  hex: string,
): [number, number, number] | null {
  const raw = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => `${c}${c}`)
          .join("")
      : raw;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

/**
 * Euclidean RGB distance between two CSS hex colors (PL4.1 / PL4.2 contrast).
 *
 * @param a - First hex color.
 * @param b - Second hex color.
 * @returns Distance in 0–~441 range, or 0 when either hex is invalid.
 */
export function cssHexRgbDistance(a: string, b: string): number {
  const ra = parseCssHexRgb(a);
  const rb = parseCssHexRgb(b);
  if (!ra || !rb) return 0;
  const dr = ra[0] - rb[0];
  const dg = ra[1] - rb[1];
  const db = ra[2] - rb[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Minimum pairwise floor-color distance across explore sections (PL4.2).
 *
 * @returns Smallest RGB distance among distinct section floors.
 */
export function exploreSectionFloorContrastMin(): number {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < EXPLORE_SECTIONS.length; i++) {
    for (let j = i + 1; j < EXPLORE_SECTIONS.length; j++) {
      const d = cssHexRgbDistance(
        EXPLORE_SECTIONS[i]!.floorColor,
        EXPLORE_SECTIONS[j]!.floorColor,
      );
      if (d < min) min = d;
    }
  }
  return Number.isFinite(min) ? min : 0;
}

/**
 * Resolves which explore section a building type belongs to.
 *
 * @param type - Building type id.
 * @returns Section marker or null when not a section resource.
 */
export function exploreSectionForBuildingType(
  type: BuildingType,
): ExploreSectionMarker | null {
  return EXPLORE_SECTIONS.find((s) => s.buildingTypes.includes(type)) ?? null;
}

/**
 * Prefixes an interact prompt with the explore section label (CL10.1).
 * Hunt prompts that already start with "Hunt ·" are rewritten to the section name.
 *
 * @param buildingType - Nearby building type.
 * @param baseLabel - Prompt before section wayfinding.
 * @returns Prefixed label, or baseLabel when type has no section.
 */
export function withExploreSectionPrompt(
  buildingType: BuildingType,
  baseLabel: string,
): string {
  const section = exploreSectionForBuildingType(buildingType);
  if (!section) return baseLabel;
  if (baseLabel.startsWith("Hunt · ")) {
    return `${section.label} · ${baseLabel.slice("Hunt · ".length)}`;
  }
  if (baseLabel.toLowerCase().startsWith(`${section.label.toLowerCase()} ·`)) {
    return baseLabel;
  }
  return `${section.label} · ${baseLabel}`;
}

/** @deprecated Prefer EXPLORE_LAND — legacy F11.1 name. */
export const FOREST_LAND = EXPLORE_LAND;
/** @deprecated Prefer EXPLORE_BUILDINGS — legacy F11.1 name. */
export const FOREST_BUILDINGS = EXPLORE_BUILDINGS;

/**
 * Shared city hub (CL2.1) — one global land; sparse contendable stations.
 * Counts are illustrative (PlayerVision); not abstract daily/qty caps.
 * No expand pads — players cannot own-expand the city into a private yard.
 */
export const CITY_LAND = {
  /** Scarce stations + 16 NPCs (Governor + 13 tutors + Broker + Clerk) + vendor + market + REALM market + notice + loom + dock + alchemy + pen. */
  buildSlots: 34,
  kind: "city" as CanonicalLandKind,
} as const;

export const CITY_BUILDINGS: Array<{
  type: BuildingType;
  slotIndex: number;
  x: number;
  z: number;
  /** When type is tutorial_npc — EconomyProfessionId from tutorial-npcs. */
  tutorialNpcId?: string;
  /** Ore kind for `ore_node` (`iron` / `copper` / `gold`); stored as cropId. */
  cropId?: string;
}> = [
  // Governor in front of City Hall (plaza side) — first onboarding walk-up.
  // Travel is N / Travel panel (no world portal on the hall approach).
  {
    type: "tutorial_npc",
    slotIndex: 31,
    x: 1,
    z: -4,
    tutorialNpcId: "mayor",
  },
  // Farmer bay (screen NW) — plots + mill
  { type: "crop_plot", slotIndex: 1, x: -8, z: -4 },
  { type: "crop_plot", slotIndex: 2, x: -6, z: -4 },
  // Forester bay (screen SE)
  { type: "tree_stump", slotIndex: 3, x: 6, z: -4 },
  { type: "tree_stump", slotIndex: 4, x: 8, z: -4 },
  // Miner bay — west scarce-yard grass (inside the 52×30 lawn, west of plaza stone)
  { type: "ore_node", slotIndex: 5, x: -11, z: 2, cropId: "iron" },
  { type: "ore_node", slotIndex: 6, x: -10, z: 4, cropId: "copper" },
  // Carpenter bay (screen south / SE)
  { type: "workshop", slotIndex: 7, x: 10, z: 2 },
  // Blacksmith bay (screen south)
  { type: "forge", slotIndex: 8, x: 12, z: 6 },
  { type: "mill", slotIndex: 9, x: -10, z: -2 },
  { type: "kitchen", slotIndex: 10, x: 4, z: 8 },
  {
    type: "tutorial_npc",
    slotIndex: 11,
    x: -8,
    z: -2,
    tutorialNpcId: "farmer",
  },
  {
    type: "tutorial_npc",
    slotIndex: 12,
    x: 8,
    z: -2,
    tutorialNpcId: "forester",
  },
  {
    type: "tutorial_npc",
    slotIndex: 13,
    x: 10,
    z: 4,
    tutorialNpcId: "carpenter",
  },
  // West plaza lip (off the cobble cross) — closer to the fountain than the mill bay.
  { type: "vendor_stall", slotIndex: 14, x: -6, z: 2 },
  // East plaza lip (mirrors the vendor on the west lip)
  { type: "market_board", slotIndex: 15, x: 6, z: 2 },
  // REALM / Creditcoin stall — in front of the coin Market (+Z, same east lip).
  { type: "realm_market", slotIndex: 34, x: 6, z: 4 },
  {
    type: "tutorial_npc",
    slotIndex: 16,
    x: -11,
    z: 4,
    tutorialNpcId: "miner",
  },
  {
    type: "tutorial_npc",
    slotIndex: 17,
    x: 12,
    z: 8,
    tutorialNpcId: "blacksmith",
  },
  {
    type: "tutorial_npc",
    slotIndex: 18,
    x: 4,
    z: 10,
    tutorialNpcId: "cook",
  },
  { type: "notice_board", slotIndex: 19, x: 6, z: -6 },
  {
    type: "tutorial_npc",
    slotIndex: 20,
    x: -12,
    z: 10,
    tutorialNpcId: "weaver",
  },
  { type: "loom", slotIndex: 21, x: -12, z: 8 },
  CITY_RIVER_FISHER_NPC,
  {
    type: "tutorial_npc",
    slotIndex: 23,
    x: 0,
    z: 10,
    tutorialNpcId: "alchemist",
  },
  // Explore tutors + Builder around the fountain — scattered, facing each other / the basin.
  {
    type: "tutorial_npc",
    slotIndex: 24,
    x: -2,
    z: 1,
    tutorialNpcId: "animal_hunter",
  },
  {
    type: "tutorial_npc",
    slotIndex: 25,
    x: 3,
    z: 0,
    tutorialNpcId: "monster_hunter",
  },
  {
    type: "tutorial_npc",
    slotIndex: 26,
    x: 1,
    z: 3,
    tutorialNpcId: "builder",
  },
  CITY_RIVER_FISHING_DOCK,
  {
    type: "tutorial_npc",
    slotIndex: 28,
    x: -6,
    z: 10,
    tutorialNpcId: "animal_breeder",
  },
  { type: "alchemy_bench", slotIndex: 29, x: 0, z: 8 },
  { type: "animal_pen", slotIndex: 30, x: -6, z: 8 },
  // Player Market tutor — east plaza lip, beside the sage stall.
  {
    type: "tutorial_npc",
    slotIndex: 32,
    x: 6,
    z: 0,
    tutorialNpcId: "broker",
  },
  // Optional Creditcoin tutor — inner court by the Deed desk.
  {
    type: "tutorial_npc",
    slotIndex: 33,
    x: 3,
    z: -2,
    tutorialNpcId: "clerk",
  },
];

/**
 * Resolves city-template tutorial NPC profession from a building slot.
 */
export function cityTutorialNpcIdForSlot(
  slotIndex: number,
): string | null {
  const row = CITY_BUILDINGS.find(
    (b) => b.slotIndex === slotIndex && b.type === "tutorial_npc",
  );
  return row?.tutorialNpcId ?? null;
}

/**
 * Grid XZ of a city walk-up tutor (plaza origin).
 *
 * @param npcId - Tutorial or civic NPC id.
 * @returns Template grid cell, or null when that tutor is not placed.
 */
export function cityTutorialNpcGrid(
  npcId: string,
): { x: number; z: number } | null {
  const row = CITY_BUILDINGS.find(
    (b) => b.type === "tutorial_npc" && b.tutorialNpcId === npcId,
  );
  if (!row) return null;
  return { x: row.x, z: row.z };
}

/**
 * Production / gather building types that are scarce shared stations on the city map (PL1.1).
 * Tutors, portal, market, vendor, and notice are services — not scarce pads.
 */
export const CITY_SCARCE_STATION_TYPES = [
  "crop_plot",
  "tree_stump",
  "ore_node",
  "workshop",
  "forge",
  "mill",
  "kitchen",
  "loom",
  "fishing_dock",
  "alchemy_bench",
  "animal_pen",
] as const satisfies readonly BuildingType[];

export type CityScarceStationType = (typeof CITY_SCARCE_STATION_TYPES)[number];

/**
 * True when a building type is a contendable scarce city station (not a tutor/service).
 *
 * @param type - Building type id.
 */
export function isCityScarceStationType(
  type: string,
): type is CityScarceStationType {
  return (CITY_SCARCE_STATION_TYPES as readonly string[]).includes(type);
}

export interface CityAtmosphereWayfindingLabel {
  id: "scarce_yard" | "tutor_lane";
  label: string;
  hint: string;
  /** Center in building-grid units (× WORLD.GRID in scene). */
  x: number;
  z: number;
}

/**
 * World Html plaques for scarce yard / tutor lane (PL1.1).
 * Off by default: the floating text boxes cluttered the city hub.
 */
export const CITY_ATMOSPHERE_WAYFINDING_LABELS_ENABLED = false;

/**
 * Whether CityEnvironment should spawn scarce-yard / tutor-lane Html plaques.
 *
 * @returns True when the two floating wayfinding boxes should render.
 */
export function cityAtmosphereWayfindingLabelsVisible(): boolean {
  return CITY_ATMOSPHERE_WAYFINDING_LABELS_ENABLED;
}

/** Floating city wayfinding copy (PL1.1) — scarce yard; tutors stand by stations. */
export const CITY_ATMOSPHERE_LABELS: CityAtmosphereWayfindingLabel[] = [
  {
    id: "scarce_yard",
    label: "Shared · scarce stations",
    hint: "Compete for one of each — build unlimited on Your Land",
    x: 0,
    z: 3,
  },
  {
    id: "tutor_lane",
    label: "Profession tutors",
    hint: "Each tutor stands by their practice station · E for basics",
    x: 0,
    z: 6,
  },
];

/**
 * Grid positions of scarce shared stations from the city template.
 *
 * @returns Marker rows for CityEnvironment pads (excludes tutors / services).
 */
export function cityScarceStationMarkers(): Array<{
  type: CityScarceStationType;
  slotIndex: number;
  x: number;
  z: number;
}> {
  return CITY_BUILDINGS.filter((b): b is typeof b & {
    type: CityScarceStationType;
  } => isCityScarceStationType(b.type)).map((b) => ({
    type: b.type,
    slotIndex: b.slotIndex,
    x: b.x,
    z: b.z,
  }));
}

/**
 * City service building types that must read as commerce / info — not craft stations (PL1.3).
 */
