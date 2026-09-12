/**
 * niko-3d-models Low Poly Village — civic houses from one bundled FBX.
 * File lives at `apps/web/public/models/niko-village/village.fbx`.
 * Kits remain the runtime fallback when the FBX is missing or fails to load.
 */

export type NikoVillageKind =
  | "house05"
  | "house07"
  | "house08"
  | "house09"
  | "house10";

export interface NikoVillageModel {
  kind: NikoVillageKind;
  /** Mesh name inside the bundled FBX scene. */
  mesh: string;
  yaw: number;
}

export interface NikoVillageFitBox {
  width: number;
  depth: number;
  height: number;
}

export const NIKO_VILLAGE_URL = "/models/niko-village/village.fbx";

/**
 * Blender Phong names in the FBX are white; stamp a village palette by name.
 * Windows get a slight emissive so night/day still reads as glass.
 */
export const NIKO_VILLAGE_MATERIAL_COLORS: Record<
  string,
  { color: string; emissive?: string; emissiveIntensity?: number; roughness: number }
> = {
  wood2: { color: "#c9a06a", roughness: 0.86 },
  "rock/iron": { color: "#7d7a74", roughness: 0.92 },
  windows: {
    color: "#9ad4ee",
    emissive: "#b8e4f5",
    emissiveIntensity: 0.22,
    roughness: 0.28,
  },
  roofs: { color: "#c14d3a", roughness: 0.8 },
  leafs: { color: "#5a9a4a", roughness: 0.9 },
  wood: { color: "#5c3d28", roughness: 0.88 },
};

export const NIKO_VILLAGE_MODELS: Record<NikoVillageKind, NikoVillageModel> = {
  house05: { kind: "house05", mesh: "Cube005", yaw: 0 },
  house07: { kind: "house07", mesh: "Cube007", yaw: 0 },
  house08: { kind: "house08", mesh: "Cube008", yaw: 0 },
  house09: { kind: "house09", mesh: "Cube009", yaw: 0 },
  house10: { kind: "house10", mesh: "Cube010", yaw: 0 },
};

/** Tallest wide house — City Hall façade. */
export const NIKO_CITY_HALL: NikoVillageKind = "house08";

/** Fit so the hall reads ~5m tall vs player ~1.7m (wider than the civic pads). */
export const NIKO_CITY_HALL_FIT: NikoVillageFitBox = {
  width: 7.2,
  depth: 5.2,
  height: 5.0,
};

/** Four civic silhouettes around the hub (NW, NE, SW, SE). */
export const NIKO_CIVIC_BLOCKS: readonly NikoVillageKind[] = [
  "house07",
  "house10",
  "house09",
  "house08",
];

export const NIKO_CIVIC_FIT: NikoVillageFitBox = {
  width: 3.8,
  depth: 3.4,
  height: 3.2,
};

/**
 * Catalog entry for one village house.
 *
 * @param kind - House variant.
 * @returns Mesh name + yaw.
 */
export function nikoVillageModel(kind: NikoVillageKind): NikoVillageModel {
  return NIKO_VILLAGE_MODELS[kind];
}

/**
 * Uniform scale that fits a measured world AABB into a pad box.
 *
 * @param size - World AABB size.
 * @param fit - Target pad box.
 * @returns Uniform scale factor.
 */
export function nikoVillageFitScale(
  size: { x: number; y: number; z: number },
  fit: NikoVillageFitBox,
): number {
  const sx = fit.width / Math.max(size.x, 0.001);
  const sy = fit.height / Math.max(size.y, 0.001);
  const sz = fit.depth / Math.max(size.z, 0.001);
  return Math.min(1, Math.max(0.0004, Math.min(sx, sy, sz)));
}
