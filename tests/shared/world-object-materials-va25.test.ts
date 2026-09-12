import { describe, expect, it } from "vitest";
import {
  HUNT_TRAIL_WAYFINDING,
  huntTrailWayfindingVisual,
} from "../../packages/shared/src/catalog";
import {
  huntTrailKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA2.5", () => {
  it("trail path vs hide vs horn stay distinct (happy)", () => {
    const kit = huntTrailKitMaterials("trail");
    expect(kit.path.roughness).toBeGreaterThan(kit.hide.roughness);
    expect(kit.horn.metalness).toBeGreaterThan(kit.brush.metalness);
    expect(kit.brushColor).not.toBe(kit.hornColor);
    expect(worldObjectSurfacesDiffer(kit.path, kit.pathCurb)).toBe(true);
    expect(worldObjectSurfacesDiffer(kit.hide, kit.horn)).toBe(true);
  });

  it("thicket kit diverges from trail brush tints without flattening PBR (edge)", () => {
    const trail = huntTrailKitMaterials("trail");
    const thicket = huntTrailKitMaterials("thicket");
    expect(thicket.brushColor).not.toBe(trail.brushColor);
    expect(thicket.curbColor).not.toBe(trail.curbColor);
    expect(thicket.path.roughness).toBe(trail.path.roughness);
    expect(thicket.hide.metalness).toBe(trail.hide.metalness);
    expect(thicket.underbrush.roughness).toBeGreaterThan(thicket.horn.roughness);
  });

  it("kit does not invent replacement wayfinding path/creature colors (failure)", () => {
    const way = huntTrailWayfindingVisual("trail", true, false);
    const kit = huntTrailKitMaterials("trail");
    // Path / creature colors stay on HUNT_TRAIL_WAYFINDING SoT — kit is PBR + brush accents only.
    expect(way.pathColor.toLowerCase()).toBe(
      HUNT_TRAIL_WAYFINDING.trail.pathReady.toLowerCase(),
    );
    expect(way.creatureColor.toLowerCase()).toBe(
      HUNT_TRAIL_WAYFINDING.trail.creatureReady.toLowerCase(),
    );
    expect(kit.brushColor).not.toBe(way.pathColor);
    expect(kit.hornColor).not.toBe(way.creatureColor);
  });
});
