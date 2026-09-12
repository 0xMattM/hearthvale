import { describe, expect, it } from "vitest";
import {
  LOCAL_AVATAR_MAP_TINT,
  localAvatarMapTintForLandKind,
} from "../../packages/shared/src/catalog";
import {
  avatarFarmerKitMaterials,
  avatarGroundShadowMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";
import {
  AVATAR_PALETTES,
  AVATAR_SILHOUETTE,
  resolveAvatarKitColors,
} from "../../apps/web/lib/avatar-art";

describe("world object materials VA5.2", () => {
  it("ground shadow stays matte underfoot (happy)", () => {
    const shadow = avatarGroundShadowMaterials();
    expect(shadow.shadow.roughness).toBeGreaterThan(0.9);
    expect(shadow.shadow.metalness).toBe(0);
    expect(shadow.opacity).toBeGreaterThan(0.1);
    expect(shadow.opacity).toBeLessThan(0.5);
    expect(shadow.radius).toBeGreaterThan(0.2);
    expect(shadow.color).toBe("#1a2118");
  });

  it("shadow reads apart from farmer cloth without stealing palette (edge)", () => {
    const shadow = avatarGroundShadowMaterials();
    const kit = avatarFarmerKitMaterials();
    expect(worldObjectSurfacesDiffer(shadow.shadow, kit.cloth)).toBe(true);
    expect(shadow.color).not.toBe(kit.bootCuffColor);
    expect(shadow.color).not.toBe(AVATAR_PALETTES.remote.vest);
    expect(shadow.y).toBeLessThan(0.05);
    expect(AVATAR_SILHOUETTE.hasBoots).toBe(true);
  });

  it("silhouette lock + map tint + remotes palette stay intact (failure)", () => {
    const shadow = avatarGroundShadowMaterials();
    const land = resolveAvatarKitColors("local", "land");
    const remote = resolveAvatarKitColors("remote", "city");
    const landTint = localAvatarMapTintForLandKind("land");
    expect(land.vest).toBe(landTint.vest);
    expect(remote.vest).toBe(AVATAR_PALETTES.remote.vest);
    expect(AVATAR_SILHOUETTE.approxHeight).toBeGreaterThan(1.5);
    expect(LOCAL_AVATAR_MAP_TINT.baseVest).toMatch(/^#/);
    // Shadow must not collide with presence teal or map-tint bases.
    expect(shadow.color).not.toBe("#5a8a9a");
    expect(shadow.color).not.toBe(LOCAL_AVATAR_MAP_TINT.baseVest);
    expect(shadow.color).not.toBe(LOCAL_AVATAR_MAP_TINT.baseHatBand);
  });
});
