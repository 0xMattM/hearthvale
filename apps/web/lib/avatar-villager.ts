/**
 * Villager NPC Free — Hunter / Blacksmith / Child (FBX served from public/).
 */

export type VillagerAvatarVariant = "local" | "remote" | "tutor";

export interface VillagerAvatarSpec {
  file: string;
  /** Uniform scale to ~1.65m height (from import layout). */
  scale: number;
  /** Lifts model so feet sit on y=0. */
  yOffset: number;
}

/** Meshes face +Z in the FBX exports. */
export const VILLAGER_AVATAR_YAW = 0;

export const VILLAGER_RESOURCE_PATH = "/models/villager/";

/** Players share Hunter; city tutors use Blacksmith (distinct clothes, not the user mesh). */
export const VILLAGER_AVATAR_SPECS: Record<VillagerAvatarVariant, VillagerAvatarSpec> =
  {
    local: {
      file: "Hunter.fbx",
      scale: 0.9024611550579823,
      yOffset: 0,
    },
    remote: {
      file: "Hunter.fbx",
      scale: 0.9024611550579823,
      yOffset: 0,
    },
    tutor: {
      file: "Blacksmith.fbx",
      scale: 0.9192067533441669,
      yOffset: 0,
    },
  };

/**
 * Public URL for a villager avatar FBX.
 *
 * @param variant - Local self, remote peer, or city tutor
 */
export function villagerAvatarUrl(variant: VillagerAvatarVariant): string {
  return `${VILLAGER_RESOURCE_PATH}${VILLAGER_AVATAR_SPECS[variant].file}`;
}

/**
 * Point FBX texture lookups at the villager atlas (not wild-animals).
 *
 * @param url - Loader-resolved texture URL or original FBX filename.
 */
export function rewriteVillagerTextureUrl(url: string): string {
  const name = url.split(/[/\\]/).pop()?.split("?")[0] ?? url;
  if (!/\.(png|jpe?g|tga|webp)$/i.test(name)) return url;
  return `${VILLAGER_RESOURCE_PATH}${name}`;
}

/** FBXs the client should preload. */
export function villagerAvatarPreloadUrls(): string[] {
  const files = new Set(
    Object.values(VILLAGER_AVATAR_SPECS).map((spec) => spec.file),
  );
  return [...files].map((file) => `${VILLAGER_RESOURCE_PATH}${file}`);
}
