/**
 * YumeForge Free Japan Village props for city / homestead atmosphere.
 * GLTF + ColorAtlas live under `apps/web/public/models/japan-village/`.
 * Kits remain the runtime fallback when a file is missing or fails to load.
 */

export type JapanVillagePropKind =
  | "tree"
  | "fence"
  | "torii"
  | "lantern"
  | "barrel"
  | "crate"
  | "chair"
  | "pot"
  | "riceBin"
  | "sprout"
  | "corn"
  | "potato"
  | "tomato"
  | "carrot";

export interface JapanVillageModel {
  kind: JapanVillagePropKind;
  file: string;
  url: string;
  /** Uniform scale applied to the cloned scene. */
  scale: number;
  /** Y lift so the mesh sits on the ground. */
  yOffset: number;
  /** Extra yaw (radians) when the pack forward axis disagrees with the kit. */
  yaw: number;
}

export const JAPAN_VILLAGE_RESOURCE_PATH = "/models/japan-village/";

/** Native Fence_Wood width along local X (pack units ≈ meters). */
export const JAPAN_VILLAGE_FENCE_NATIVE_WIDTH = 4;

export const JAPAN_VILLAGE_PROPS: Record<
  JapanVillagePropKind,
  JapanVillageModel
> = {
  // Native plum ~4.8m; 0.62 ≈ kit tree height at placement scale 1.
  tree: {
    kind: "tree",
    file: "Tree_RedPlum.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}Tree_RedPlum.gltf`,
    scale: 0.62,
    yOffset: 0,
    yaw: 0,
  },
  fence: {
    kind: "fence",
    file: "Fence_Wood.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}Fence_Wood.gltf`,
    scale: 1,
    yOffset: 0,
    yaw: 0,
  },
  torii: {
    kind: "torii",
    file: "ToriGate.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}ToriGate.gltf`,
    scale: 0.78,
    yOffset: 0,
    yaw: 0,
  },
  lantern: {
    kind: "lantern",
    file: "StoneLantern.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}StoneLantern.gltf`,
    scale: 1.05,
    yOffset: 0,
    yaw: 0,
  },
  barrel: {
    kind: "barrel",
    file: "Barrel.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}Barrel.gltf`,
    scale: 0.55,
    yOffset: 0,
    yaw: 0,
  },
  crate: {
    kind: "crate",
    file: "WoodenCrate_S.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}WoodenCrate_S.gltf`,
    scale: 0.7,
    yOffset: 0,
    yaw: 0,
  },
  chair: {
    kind: "chair",
    file: "Chair.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}Chair.gltf`,
    scale: 1.25,
    yOffset: 0,
    yaw: 0,
  },
  pot: {
    kind: "pot",
    file: "CeremicPot.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}CeremicPot.gltf`,
    scale: 1.35,
    yOffset: 0,
    yaw: 0,
  },
  riceBin: {
    kind: "riceBin",
    file: "RiceBin.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}RiceBin.gltf`,
    scale: 0.9,
    yOffset: 0.05,
    yaw: 0,
  },
  sprout: {
    kind: "sprout",
    file: "Sprout.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}Sprout.gltf`,
    scale: 1.15,
    yOffset: 0,
    yaw: 0,
  },
  corn: {
    kind: "corn",
    file: "Corn.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}Corn.gltf`,
    scale: 2.4,
    yOffset: 0,
    yaw: 0,
  },
  potato: {
    kind: "potato",
    file: "Potato.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}Potato.gltf`,
    scale: 2.2,
    yOffset: 0,
    yaw: 0,
  },
  tomato: {
    kind: "tomato",
    file: "Tomato.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}Tomato.gltf`,
    scale: 2.0,
    yOffset: 0,
    yaw: 0,
  },
  carrot: {
    kind: "carrot",
    file: "Carrot_Orange.gltf",
    url: `${JAPAN_VILLAGE_RESOURCE_PATH}Carrot_Orange.gltf`,
    scale: 2.0,
    yOffset: 0,
    yaw: 0,
  },
};

export interface JapanVillageFenceTiles {
  count: number;
  spacing: number;
  scaleX: number;
}

/**
 * Split a fence run into tiled Fence_Wood segments.
 *
 * @param length - Rail run in world units.
 * @returns Tile count, center spacing, and X stretch to fill `length`.
 */
export function japanVillageFenceTiles(
  length: number,
): JapanVillageFenceTiles {
  if (!Number.isFinite(length) || length <= 0) {
    return { count: 0, spacing: 0, scaleX: 1 };
  }
  const count = Math.max(
    1,
    Math.round(length / JAPAN_VILLAGE_FENCE_NATIVE_WIDTH),
  );
  const spacing = length / count;
  return {
    count,
    spacing,
    scaleX: spacing / JAPAN_VILLAGE_FENCE_NATIVE_WIDTH,
  };
}

/**
 * Placement spec for one village prop kind.
 *
 * @param kind - Catalog key.
 * @returns Public URL + scale/offset for the land scene.
 */
export function japanVillageProp(
  kind: JapanVillagePropKind,
): JapanVillageModel {
  return JAPAN_VILLAGE_PROPS[kind];
}

export type JapanVillageCropState = "sprout" | "growing" | "ready";

/**
 * Pick a Japan Village produce mesh for a planted plot.
 * Wheat / cotton keep the kit (no matching mesh); sprout stage is shared.
 *
 * @param cropId - Catalog crop id.
 * @param state - Plot visual stage (not empty).
 * @returns Model spec or null to keep kit plants.
 */
export function japanVillageCrop(
  cropId: string | null | undefined,
  state: JapanVillageCropState,
): JapanVillageModel | null {
  if (state === "sprout") return JAPAN_VILLAGE_PROPS.sprout;
  const id = cropId ?? "wheat";
  if (id === "corn") {
    const corn = JAPAN_VILLAGE_PROPS.corn;
    return state === "ready" ? { ...corn, scale: corn.scale * 1.2 } : corn;
  }
  if (id === "potato") {
    const potato = JAPAN_VILLAGE_PROPS.potato;
    return state === "ready" ? { ...potato, scale: potato.scale * 1.15 } : potato;
  }
  if (id === "herb") {
    const carrot = JAPAN_VILLAGE_PROPS.carrot;
    return state === "ready" ? { ...carrot, scale: carrot.scale * 1.15 } : carrot;
  }
  return null;
}

/**
 * Public URLs to preload (gltf + shared atlas is pulled by the loader).
 *
 * @returns Deduped model URLs.
 */
export function japanVillagePreloadUrls(): string[] {
  return Object.values(JAPAN_VILLAGE_PROPS).map((prop) => prop.url);
}
