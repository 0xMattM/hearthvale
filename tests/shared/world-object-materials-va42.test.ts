import { describe, expect, it } from "vitest";
import {
  LIVED_HOMESTEAD_PATH_CUE,
  homesteadYardFloorColors,
  livedHomesteadPathCue,
} from "../../packages/shared/src/catalog";
import {
  homesteadYardFloorKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA4.2", () => {
  it("meadow reads rougher than lived yard pad (happy)", () => {
    const kit = homesteadYardFloorKitMaterials();
    expect(kit.meadow.roughness).toBeGreaterThan(kit.pad.roughness);
    expect(kit.path.roughness).toBeGreaterThan(kit.pad.roughness);
    expect(kit.pathLipColor).toMatch(/^#/);
    expect(worldObjectSurfacesDiffer(kit.meadow, kit.pad)).toBe(true);
  });

  it("path lip articulates without flattening dirt path (edge)", () => {
    const kit = homesteadYardFloorKitMaterials();
    expect(kit.pathLip.roughness).toBeLessThan(kit.path.roughness);
    expect(kit.pathLip.metalness).toBeGreaterThan(kit.meadow.metalness);
    expect(kit.plot.roughness).toBeLessThan(kit.meadow.roughness);
    expect(worldObjectSurfacesDiffer(kit.path, kit.pathLip)).toBe(true);
    expect(worldObjectSurfacesDiffer(kit.plot, kit.pad)).toBe(true);
  });

  it("empty/lived/visit floor hexes + path cue SoT stay intact (failure)", () => {
    const kit = homesteadYardFloorKitMaterials();
    const empty = homesteadYardFloorColors("empty", "home");
    const lived = homesteadYardFloorColors("lived", "home");
    const visit = homesteadYardFloorColors("lived", "visit");
    const pathCue = livedHomesteadPathCue("lived");
    expect(empty.padColor).toBeNull();
    expect(lived.padColor).toMatch(/^#/);
    expect(visit.hazeColor).toMatch(/^#/);
    expect(LIVED_HOMESTEAD_PATH_CUE.emissive).toMatch(/^#/);
    expect(pathCue.show).toBe(true);
    expect(pathCue.emissive).toBe(LIVED_HOMESTEAD_PATH_CUE.emissive);
    // Kit never overrides yard atmosphere RGB — lip accent only.
    expect(kit.pathLipColor).not.toBe(lived.pathColor);
    expect(kit.pathLipColor).not.toBe(LIVED_HOMESTEAD_PATH_CUE.emissive);
  });
});
