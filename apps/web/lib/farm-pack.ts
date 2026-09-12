/**
 * CrisDias 3D Farm Asset Pack — civic houses extracted to GLB.
 * Files live under `apps/web/public/models/farm-pack/`.
 * Kits remain the runtime fallback when a GLB is missing or fails to load.
 */

export type FarmPackKind = "barnLarge" | "barnMid" | "houseWhite" | "barnWhite";

export interface FarmPackModel {
  kind: FarmPackKind;
  file: string;
  url: string;
  yaw: number;
}

export interface FarmPackFitBox {
  width: number;
  depth: number;
  height: number;
}

export const FARM_PACK_RESOURCE_PATH = "/models/farm-pack/";

export const FARM_PACK_MODELS: Record<FarmPackKind, FarmPackModel> = {
  barnLarge: {
    kind: "barnLarge",
    file: "barn-large.glb",
    url: `${FARM_PACK_RESOURCE_PATH}barn-large.glb`,
    yaw: 0,
  },
  barnMid: {
    kind: "barnMid",
    file: "barn-mid.glb",
    url: `${FARM_PACK_RESOURCE_PATH}barn-mid.glb`,
    yaw: 0,
  },
  houseWhite: {
    kind: "houseWhite",
    file: "house-white.glb",
    url: `${FARM_PACK_RESOURCE_PATH}house-white.glb`,
    yaw: 0,
  },
  barnWhite: {
    kind: "barnWhite",
    file: "barn-white.glb",
    url: `${FARM_PACK_RESOURCE_PATH}barn-white.glb`,
    yaw: 0,
  },
};

/** Largest textured barn — City Hall. */
export const FARM_PACK_CITY_HALL: FarmPackKind = "barnLarge";

/** Contain-fit so the barn reads ~4.4m tall vs player ~1.7m. */
export const FARM_PACK_CITY_HALL_FIT: FarmPackFitBox = {
  width: 7.4,
  depth: 6.8,
  height: 5.0,
};

/** Four civic silhouettes around the hub (NW, NE, SW, SE). */
export const FARM_PACK_CIVIC_BLOCKS: readonly FarmPackKind[] = [
  "barnMid",
  "houseWhite",
  "barnWhite",
  "barnLarge",
];

export const FARM_PACK_CIVIC_FIT: FarmPackFitBox = {
  width: 3.8,
  depth: 4.5,
  height: 3.2,
};

/**
 * Catalog entry for one farm building.
 *
 * @param kind - Building variant.
 * @returns Public GLB URL + yaw.
 */
export function farmPackModel(kind: FarmPackKind): FarmPackModel {
  return FARM_PACK_MODELS[kind];
}

/**
 * Uniform scale that fits a measured world AABB into a pad box.
 *
 * @param size - World AABB size.
 * @param fit - Target pad box.
 * @returns Uniform scale factor.
 */
export function farmPackFitScale(
  size: { x: number; y: number; z: number },
  fit: FarmPackFitBox,
): number {
  const sx = fit.width / Math.max(size.x, 0.001);
  const sy = fit.height / Math.max(size.y, 0.001);
  const sz = fit.depth / Math.max(size.z, 0.001);
  return Math.min(1, Math.max(0.0004, Math.min(sx, sy, sz)));
}

/**
 * GLB URLs to preload.
 *
 * @returns Public URLs.
 */
export function farmPackPreloadUrls(): string[] {
  return Object.values(FARM_PACK_MODELS).map((m) => m.url);
}
