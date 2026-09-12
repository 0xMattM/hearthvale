import { describe, expect, it } from "vitest";
import {
  AVATAR_PALETTES,
  AVATAR_SILHOUETTE,
  avatarGltfModel,
  preferAvatarKitSilhouette,
  shouldLoadAvatarGltf,
} from "../../apps/web/lib/avatar-art";

describe("avatar art F14.2", () => {
  it("defines a distinct farmer silhouette (happy)", () => {
    expect(AVATAR_SILHOUETTE.hasHat).toBe(true);
    expect(AVATAR_SILHOUETTE.hasArms).toBe(true);
    expect(AVATAR_SILHOUETTE.hasVest).toBe(true);
    expect(AVATAR_SILHOUETTE.hasBoots).toBe(true);
    expect(AVATAR_SILHOUETTE.hatBrimRadius).toBeGreaterThan(0.08);
    expect(AVATAR_SILHOUETTE.approxHeight).toBeGreaterThan(1.65);
    expect(AVATAR_PALETTES.local.hat).not.toBe(AVATAR_PALETTES.remote.hat);
  });

  it("prefers Villager NPC GLB with kit fallback (edge)", () => {
    expect(shouldLoadAvatarGltf()).toBe(true);
    expect(avatarGltfModel()?.url).toContain("/models/villager/");
    expect(AVATAR_PALETTES.local.shirt).not.toBe(AVATAR_PALETTES.remote.shirt);
    expect(preferAvatarKitSilhouette()).toBe(false);
  });

  it("keeps Villager hero configured (failure if unset)", () => {
    expect(shouldLoadAvatarGltf()).toBe(true);
    expect(avatarGltfModel()?.url).toBe("/models/villager/Hunter.fbx");
  });
});
