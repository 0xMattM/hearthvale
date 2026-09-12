import { describe, expect, it } from "vitest";
import {
  LOCAL_AVATAR_MAP_TINT,
  localAvatarMapTintForLandKind,
} from "../../packages/shared/src/catalog";
import {
  avatarFarmerKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";
import {
  AVATAR_PALETTES,
  AVATAR_SILHOUETTE,
  resolveAvatarKitColors,
} from "../../apps/web/lib/avatar-art";

describe("world object materials VA3.3", () => {
  it("tool head stays more metallic than cloth / straw hat (happy)", () => {
    const kit = avatarFarmerKitMaterials();
    expect(kit.toolHead.metalness).toBeGreaterThan(kit.cloth.metalness);
    expect(kit.toolHead.metalness).toBeGreaterThan(kit.hat.metalness);
    expect(kit.hat.roughness).toBeGreaterThan(kit.boots.roughness);
    expect(worldObjectSurfacesDiffer(kit.cloth, kit.toolHead)).toBe(true);
    expect(AVATAR_SILHOUETTE.hasHat).toBe(true);
    expect(AVATAR_SILHOUETTE.hasBoots).toBe(true);
  });

  it("boot cuff / belt / ferrule articulate without flattening palette (edge)", () => {
    const kit = avatarFarmerKitMaterials();
    expect(kit.bootCuffColor).not.toBe(kit.beltColor);
    expect(kit.toolFerrule.metalness).toBeGreaterThan(kit.toolShaft.metalness);
    expect(kit.vest.metalness).toBeGreaterThan(kit.cloth.metalness);
    expect(worldObjectSurfacesDiffer(kit.boots, kit.bootCuff)).toBe(true);
    expect(worldObjectSurfacesDiffer(kit.toolShaft, kit.toolFerrule)).toBe(true);
    // Palette SoT stays on avatar-art — kit never owns vest/hatBand RGB.
    expect(AVATAR_PALETTES.local.vest).toBe(LOCAL_AVATAR_MAP_TINT.baseVest);
    expect(AVATAR_PALETTES.local.hatBand).toBe(LOCAL_AVATAR_MAP_TINT.baseHatBand);
  });

  it("PL122.1 map tint + remotes palette stay intact (failure)", () => {
    const kit = avatarFarmerKitMaterials();
    const land = resolveAvatarKitColors("local", "land");
    const city = resolveAvatarKitColors("local", "city");
    const remote = resolveAvatarKitColors("remote", "city");
    const landTint = localAvatarMapTintForLandKind("land");
    expect(land.vest).toBe(landTint.vest);
    expect(land.hatBand).toBe(landTint.hatBand);
    expect(land.vest).not.toBe(city.vest);
    expect(remote.vest).toBe(AVATAR_PALETTES.remote.vest);
    expect(remote.vestEmissiveIntensity).toBe(0);
    expect(AVATAR_SILHOUETTE.approxHeight).toBeGreaterThan(1.5);
    expect(AVATAR_SILHOUETTE.hatBrimRadius).toBeGreaterThan(0.3);
    // Articulation tints must not collide with map-tint bases / remote cool vest.
    expect(kit.bootCuffColor).not.toBe(LOCAL_AVATAR_MAP_TINT.baseVest);
    expect(kit.beltColor).not.toBe(AVATAR_PALETTES.remote.vest);
    expect(kit.toolFerruleColor).not.toBe(LOCAL_AVATAR_MAP_TINT.baseHatBand);
  });
});
