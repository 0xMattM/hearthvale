import { describe, expect, it } from "vitest";
import { portalMeshTintForLandKind } from "../../packages/shared/src/catalog";
import {
  portalKitMaterials,
  worldObjectSurface,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA2.1", () => {
  it("portal kit exposes stone vs metal band surfaces (happy)", () => {
    const kit = portalKitMaterials();
    expect(kit.post.roughness).toBeGreaterThan(kit.band.roughness);
    expect(kit.band.metalness).toBeGreaterThan(kit.post.metalness);
    expect(kit.threshold.roughness).toBeGreaterThan(kit.keystone.roughness);
    expect(worldObjectSurfacesDiffer(kit.post, kit.band)).toBe(true);
    expect(worldObjectSurface("portalStone").roughness).toBeGreaterThan(0.5);
  });

  it("footing / threshold / band accent tints stay distinct (edge)", () => {
    const kit = portalKitMaterials();
    expect(kit.footingColor).not.toBe(kit.bandColor);
    expect(kit.thresholdColor).not.toBe(kit.keystoneColor);
    expect(kit.footingColor).not.toBe(kit.thresholdColor);
    expect(worldObjectSurfacesDiffer(kit.footing, kit.band)).toBe(true);
  });

  it("MAP_IDENTITY portal veil tints stay map-readable (failure)", () => {
    const city = portalMeshTintForLandKind("city");
    const land = portalMeshTintForLandKind("player_land");
    const explore = portalMeshTintForLandKind("explore");
    const warrior = portalMeshTintForLandKind("warrior");
    expect(city.portalVeil).not.toBe(land.portalVeil);
    expect(explore.portalVeil).not.toBe(warrior.portalVeil);
    expect(city.portalFrame).not.toBe(warrior.portalFrame);
    // Kit must not invent replacement frame colors — only shared articulation tints.
    const kit = portalKitMaterials();
    expect(kit.footingColor).not.toBe(city.portalFrame);
    expect(kit.band.metalness).toBeGreaterThan(0);
    expect(kit.band.roughness).toBeLessThan(1);
  });
});
