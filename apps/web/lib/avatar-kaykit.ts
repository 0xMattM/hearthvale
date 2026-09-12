/**
 * KayKit Adventurers (CC0) — same pack as chessnoth-3d battle units.
 * Download: https://kaylousberg.itch.io/kaykit-adventurers (Free 2.0 zip)
 * Copy GLBs into `apps/web/public/models/kaykit/` via `npm run setup:kaykit`.
 */

export type KayKitAvatarVariant = "local" | "remote";

export interface KayKitAvatarSpec {
  file: string;
  scale: number;
  yOffset: number;
}

/** KayKit meshes face +Z — matches land-scene walk yaw. */
export const KAYKIT_AVATAR_YAW = 0;

export const KAYKIT_AVATAR_CLIPS = {
  idle: "Idle",
  walk: "Walking_A",
} as const;

/** Local hooded rogue reads as traveler; remote rogue is a distinct peer silhouette. */
export const KAYKIT_AVATAR_SPECS: Record<KayKitAvatarVariant, KayKitAvatarSpec> = {
  local: {
    file: "Rogue_Hooded.glb",
    scale: 0.52,
    yOffset: 0,
  },
  remote: {
    file: "Rogue.glb",
    scale: 0.5,
    yOffset: 0,
  },
};

/**
 * Public URL for a player avatar KayKit GLB.
 *
 * @param variant - Local self or remote peer
 * @returns Path under `/public`
 */
export function kaykitAvatarUrl(variant: KayKitAvatarVariant): string {
  return `/models/kaykit/${KAYKIT_AVATAR_SPECS[variant].file}`;
}

/** All KayKit files the client should preload. */
export function kaykitAvatarPreloadUrls(): string[] {
  const files = new Set(
    Object.values(KAYKIT_AVATAR_SPECS).map((spec) => spec.file),
  );
  return [...files].map((file) => `/models/kaykit/${file}`);
}
