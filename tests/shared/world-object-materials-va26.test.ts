import { describe, expect, it } from "vitest";
import {
  CITY_PLAZA_LANDMARK_CUE,
  WARRIOR_ARENA_VISUAL,
} from "../../packages/shared/src/catalog";
import {
  plazaFountainKitMaterials,
  warriorArenaPropKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA2.6", () => {
  it("fountain water vs basin vs spout stay readable (happy)", () => {
    const kit = plazaFountainKitMaterials();
    expect(kit.water.roughness).toBeLessThan(kit.basin.roughness);
    expect(kit.spout.metalness).toBeGreaterThan(kit.footing.metalness);
    expect(kit.lip.metalness).toBeGreaterThan(kit.footing.metalness);
    expect(kit.waterColor).not.toBe(kit.footingColor);
    expect(worldObjectSurfacesDiffer(kit.basin, kit.water)).toBe(true);
  });

  it("arena rope stays duller than post cap metal (edge)", () => {
    const kit = warriorArenaPropKitMaterials();
    expect(kit.postCap.metalness).toBeGreaterThan(kit.rope.metalness);
    expect(kit.bench.roughness).toBeLessThan(kit.rope.roughness);
    expect(kit.postColor).not.toBe(kit.ropeColor);
    expect(kit.benchColor).not.toBe(kit.benchAltColor);
    expect(worldObjectSurfacesDiffer(kit.post, kit.postCap)).toBe(true);
  });

  it("kits keep landmark / arena floor color SoT intact (failure)", () => {
    const fountain = plazaFountainKitMaterials();
    const arena = warriorArenaPropKitMaterials();
    // Basin/spout face colors + pulse stay on CITY_PLAZA_LANDMARK_CUE.
    expect(CITY_PLAZA_LANDMARK_CUE.basinColor).toBe("#6a7a8a");
    expect(CITY_PLAZA_LANDMARK_CUE.spoutColor).toBe("#8aa0b0");
    expect(CITY_PLAZA_LANDMARK_CUE.intensityPeak).toBeGreaterThan(
      CITY_PLAZA_LANDMARK_CUE.intensityBase,
    );
    // Floors / ring / plaque face stay on WARRIOR_ARENA_VISUAL.
    expect(WARRIOR_ARENA_VISUAL.groundsColor).toMatch(/^#/);
    expect(WARRIOR_ARENA_VISUAL.plaqueFace).toBe("#a82828");
    expect(fountain.waterColor).not.toBe(CITY_PLAZA_LANDMARK_CUE.basinColor);
    expect(fountain.basinColor).not.toBe(fountain.waterColor);
    expect(fountain.water.metalness).toBe(0);
    expect(arena.bannerPoleColor).not.toBe(WARRIOR_ARENA_VISUAL.plaqueFace);
    expect(worldObjectSurfacesDiffer(fountain.spout, fountain.footing)).toBe(
      true,
    );
  });
});
