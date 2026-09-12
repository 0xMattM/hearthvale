/**
 * Avatar art catalog (F14.2) — stylized procedural farmer kit.
 */

import { localAvatarMapTintForLandKind } from "@game/shared";
import {
  VILLAGER_AVATAR_SPECS,
  villagerAvatarUrl,
} from "./avatar-villager";

export interface AvatarGltfModel {
  url: string;
  scale: number;
  yOffset: number;
}

/** Villager NPC Free — Hunter for every player; tutors load Blacksmith separately. */
export const AVATAR_GLTF: AvatarGltfModel = {
  url: villagerAvatarUrl("local"),
  scale: VILLAGER_AVATAR_SPECS.local.scale,
  yOffset: VILLAGER_AVATAR_SPECS.local.yOffset,
};

export const AVATAR_GLTF_HAS_WALK_CLIPS = false;
export const AVATAR_GLTF_HAS_RIG = false;

/**
 * Prefer Villager NPC GLB when present; procedural kit is the load/error fallback.
 */
export function preferAvatarKitSilhouette(): boolean {
  return false;
}

export type AvatarVariant = "local" | "remote";

export interface AvatarPalette {
  boots: string;
  pants: string;
  shirt: string;
  vest: string;
  skin: string;
  hat: string;
  hatBand: string;
  toolShaft: string;
  toolHead: string;
}

export const AVATAR_PALETTES: Record<AvatarVariant, AvatarPalette> = {
  local: {
    boots: "#4a3420",
    pants: "#4a5c6e",
    shirt: "#e8b84a",
    vest: "#8b4e28",
    skin: "#f2d8a8",
    hat: "#e8c868",
    hatBand: "#6a4830",
    toolShaft: "#6a5038",
    toolHead: "#9aa0a8",
  },
  remote: {
    boots: "#3a3028",
    pants: "#3a4a5c",
    shirt: "#7aa8b8",
    vest: "#4a6a7a",
    skin: "#dcc8a8",
    hat: "#9ab0c0",
    hatBand: "#3a4a58",
    toolShaft: "#5a4838",
    toolHead: "#7a8088",
  },
};

/** Distinct silhouette markers for tests / art lock. */
export const AVATAR_SILHOUETTE = {
  approxHeight: 1.95,
  hatBrimRadius: 0.09,
  shoulderWidth: 0.58,
  hasArms: true,
  hasHat: true,
  hasVest: true,
  hasBoots: true,
} as const;

/**
 * Returns avatar GLTF when a URL is configured.
 */
export function avatarGltfModel(): AvatarGltfModel | null {
  if (!AVATAR_GLTF.url.trim()) return null;
  return AVATAR_GLTF;
}

/**
 * True when the client should attempt avatar GLTF (kit on failure).
 */
export function shouldLoadAvatarGltf(): boolean {
  return avatarGltfModel() != null;
}

/** Local kit colors with optional map cloak/kit emissive (PL122.1). */
export interface AvatarKitResolvedColors extends AvatarPalette {
  vestEmissive: string;
  vestEmissiveIntensity: number;
}

/**
 * Resolves kit palette; local only gets map cloak/kit tint (PL122.1).
 * Remotes stay on the remote palette with zero vest emissive.
 */
export function resolveAvatarKitColors(
  variant: AvatarVariant,
  landKind?: string | null,
): AvatarKitResolvedColors {
  const base = AVATAR_PALETTES[variant];
  if (variant !== "local") {
    return {
      ...base,
      vestEmissive: "#000000",
      vestEmissiveIntensity: 0,
    };
  }
  const tint = localAvatarMapTintForLandKind(landKind);
  return {
    ...base,
    vest: tint.vest,
    hatBand: tint.hatBand,
    vestEmissive: tint.vestEmissive,
    vestEmissiveIntensity: tint.vestEmissiveIntensity,
  };
}
