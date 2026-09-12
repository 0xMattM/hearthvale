/**
 * CraftPix Free Wild Animal FBX — kept on disk, not used in hunt.
 * Live hare / boar meshes are in-engine kits (`HuntWildlifeKit`).
 */

import type { WildAnimalGait } from "./wild-animal-rig";

export type { WildAnimalGait };
export type WildHuntKind = "hare" | "boar";

export interface WildAnimalModel {
  file: string;
  url: string;
  /** Fit standing height in world units (player ~1.7). */
  targetHeight: number;
  /**
   * Extra Y rotation so the mesh nose matches kit forward (+X).
   * CraftPix Unity FBX faces +Z.
   */
  yaw: number;
  gait: WildAnimalGait;
  /** Catalog run speed used to normalize gait amplitude. */
  refSpeed: number;
  /** Cycles per second at full run. */
  gaitHz: number;
}

export const WILD_ANIMALS_RESOURCE_PATH = "/models/wild-animals/";

export const WILD_ANIMAL_MODELS: Record<WildHuntKind, WildAnimalModel> = {
  hare: {
    file: "rabbit.fbx",
    url: `${WILD_ANIMALS_RESOURCE_PATH}rabbit.fbx`,
    targetHeight: 0.78,
    yaw: Math.PI / 2,
    gait: "hop",
    refSpeed: 1.35,
    gaitHz: 1.85,
  },
  boar: {
    file: "boar.fbx",
    url: `${WILD_ANIMALS_RESOURCE_PATH}boar.fbx`,
    targetHeight: 1.05,
    yaw: Math.PI / 2,
    gait: "trot",
    refSpeed: 1.1,
    gaitHz: 1.55,
  },
};

/**
 * Hunt-kind catalog row. Always null — CraftPix FBX is off-style vs the farmer kit.
 *
 * @param _kind - Combat foe kind.
 */
export function wildAnimalModel(_kind: string): WildAnimalModel | null {
  return null;
}

/**
 * Uniform scale to reach a standing height.
 *
 * @param sizeY - Measured AABB height.
 * @param targetHeight - Desired world height.
 */
export function wildAnimalFitScale(sizeY: number, targetHeight: number): number {
  if (!(sizeY > 0.05) || !(targetHeight > 0)) return 1;
  return targetHeight / sizeY;
}

/**
 * Public FBX urls to preload. Empty while hunt uses in-engine kits.
 *
 * @returns Hunt animal model URLs.
 */
export function wildAnimalPreloadUrls(): string[] {
  return [];
}

/**
 * Point FBX texture lookups at the copied atlas (CraftPix stores a Unity path).
 *
 * @param url - Loader-resolved texture URL or original FBX filename.
 */
export function rewriteWildAnimalTextureUrl(url: string): string {
  const name = url.split(/[/\\]/).pop()?.split("?")[0] ?? url;
  if (!/\.(png|jpe?g|tga|webp)$/i.test(name)) return url;
  return `${WILD_ANIMALS_RESOURCE_PATH}${name}`;
}

/**
 * Body-group Y so dummy posts stay planted and animals sit on the grass.
 *
 * @param kind - Combat foe kind.
 */
export function combatFoeStandY(kind: string): number {
  if (kind === "dummy") return 0.7;
  return 0;
}

/**
 * Nameplate height above the den.
 *
 * @param kind - Combat foe kind.
 */
export function combatFoePlateY(kind: string): number {
  if (kind === "dummy") return 1.55;
  if (kind === "boar") return 1.45;
  return 1.15;
}
