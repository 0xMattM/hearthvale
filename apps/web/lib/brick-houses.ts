/**
 * Broken Vector Low Poly Brick Houses — civic blocks + City Hall townhouse.
 * House-2-2 at house scale (the mesh that actually matches this city).
 */

export type BrickHouseKind =
  | "house11"
  | "house12"
  | "house13"
  | "house14"
  | "house15"
  | "house21"
  | "house22";

export interface BrickHouseModel {
  kind: BrickHouseKind;
  file: string;
  url: string;
  /** Extra yaw after Z-up conversion. */
  yaw: number;
}

export const BRICK_HOUSE_RESOURCE_PATH = "/models/brick-houses/";

export const BRICK_HOUSE_COLORSCHEME_URL = `${BRICK_HOUSE_RESOURCE_PATH}houses-colorscheme-6.png`;

/**
 * Palette sampled from `houses-colorscheme-6.png` (32×32 atlas).
 * City Hall kits stamp running-bond / tile maps from these RGB cells.
 */
export const BRICK_PACK_COLORS = {
  brick: [122, 69, 57],
  mortar: [186, 186, 186],
  plaster: [212, 200, 200],
  plasterShade: [166, 152, 152],
  stone: [94, 89, 89],
  trim: [255, 255, 255],
  dark: [79, 68, 68],
} as const;

export interface BrickHouseFitBox {
  width: number;
  depth: number;
  height: number;
}

export const BRICK_HOUSE_MODELS: Record<BrickHouseKind, BrickHouseModel> = {
  house11: {
    kind: "house11",
    file: "House-1-1.dae",
    url: `${BRICK_HOUSE_RESOURCE_PATH}House-1-1.dae`,
    yaw: 0,
  },
  house12: {
    kind: "house12",
    file: "House-1-2.dae",
    url: `${BRICK_HOUSE_RESOURCE_PATH}House-1-2.dae`,
    yaw: 0,
  },
  house13: {
    kind: "house13",
    file: "House-1-3.dae",
    url: `${BRICK_HOUSE_RESOURCE_PATH}House-1-3.dae`,
    yaw: 0,
  },
  house14: {
    kind: "house14",
    file: "House-1-4.dae",
    url: `${BRICK_HOUSE_RESOURCE_PATH}House-1-4.dae`,
    yaw: 0,
  },
  house15: {
    kind: "house15",
    file: "House-1-5.dae",
    url: `${BRICK_HOUSE_RESOURCE_PATH}House-1-5.dae`,
    yaw: 0,
  },
  house21: {
    kind: "house21",
    file: "House-2-1.dae",
    url: `${BRICK_HOUSE_RESOURCE_PATH}House-2-1.dae`,
    yaw: 0,
  },
  house22: {
    kind: "house22",
    file: "House-2-2.dae",
    url: `${BRICK_HOUSE_RESOURCE_PATH}House-2-2.dae`,
    yaw: 0,
  },
};

/** City Hall — largest two-story brick townhouse at house scale. */
export const BRICK_HOUSE_CITY_HALL: BrickHouseKind = "house22";
export const BRICK_HOUSE_LARGE: BrickHouseKind = "house22";

/** A bit taller than civic pads so it reads as the main house, not a capitol. */
export const BRICK_HOUSE_CITY_HALL_FIT: BrickHouseFitBox = {
  width: 4.6,
  depth: 4.2,
  height: 4.2,
};

/** Four civic silhouettes around the hub (NW, NE, SW, SE). */
export const BRICK_HOUSE_CIVIC_BLOCKS: readonly BrickHouseKind[] = [
  "house11",
  "house13",
  "house14",
  "house15",
];

/** Civic pads — house-scale, not dollhouse, not mansion. */
export const BRICK_HOUSE_CIVIC_FIT: BrickHouseFitBox = {
  width: 4.0,
  depth: 3.8,
  height: 3.5,
};

/**
 * Catalog entry for one brick house.
 *
 * @param kind - House variant.
 * @returns Public DAE URL + yaw.
 */
export function brickHouseModel(kind: BrickHouseKind): BrickHouseModel {
  return BRICK_HOUSE_MODELS[kind];
}

/**
 * Height-first uniform scale into a pad box (20% footprint slack).
 * Caps at 1 so a broken (too-small) bbox cannot enlarge Collada node graphs.
 *
 * @param size - World AABB size.
 * @param fit - Target pad box.
 * @returns Uniform scale factor.
 */
export function brickHouseFitScale(
  size: { x: number; y: number; z: number },
  fit: BrickHouseFitBox,
): number {
  const byHeight = fit.height / Math.max(size.y, 0.001);
  const byWidth = (fit.width * 1.2) / Math.max(size.x, 0.001);
  const byDepth = (fit.depth * 1.2) / Math.max(size.z, 0.001);
  return Math.min(1, Math.max(0.05, Math.min(byHeight, byWidth, byDepth)));
}

/**
 * DAE + colorscheme URLs to preload.
 *
 * @returns Deduped public URLs.
 */
export function brickHousePreloadUrls(): string[] {
  const urls = Object.values(BRICK_HOUSE_MODELS).map((m) => m.url);
  return [...urls, BRICK_HOUSE_COLORSCHEME_URL];
}
