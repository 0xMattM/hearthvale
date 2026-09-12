import { describe, expect, it } from "vitest";
import {
  CITY_HUB_VISUAL,
  cityHubFloorColors,
  cityScarceVsCivicPadContrast,
} from "../../packages/shared/src/catalog";
import {
  civicBlockKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA3.4", () => {
  it("window stays glassier than masonry wall / timber door (happy)", () => {
    const kit = civicBlockKitMaterials();
    expect(kit.window.roughness).toBeLessThan(kit.wall.roughness);
    expect(kit.window.roughness).toBeLessThan(kit.door.roughness);
    expect(kit.doorColor).toBe("#3a3028");
    expect(kit.windowColor).toBe("#a8c4d8");
    expect(worldObjectSurfacesDiffer(kit.window, kit.wall)).toBe(true);
  });

  it("sill / trim articulate without flattening pad cool tint (edge)", () => {
    const kit = civicBlockKitMaterials();
    expect(kit.trim.metalness).toBeGreaterThan(kit.pad.metalness);
    expect(kit.sill.roughness).toBeLessThan(kit.pad.roughness);
    expect(kit.sillColor).not.toBe(kit.trimColor);
    expect(kit.roofColor).not.toBe(kit.doorColor);
    expect(worldObjectSurfacesDiffer(kit.pad, kit.trim)).toBe(true);
    expect(worldObjectSurfacesDiffer(kit.sill, kit.window)).toBe(true);
  });

  it("civic pad cool tint + scarce contrast SoT stay intact (failure)", () => {
    const kit = civicBlockKitMaterials();
    const floors = cityHubFloorColors();
    expect(floors.civicPadColor).toBe(CITY_HUB_VISUAL.civicPadColor);
    expect(CITY_HUB_VISUAL.civicPadColor).toBe("#6a7380");
    expect(CITY_HUB_VISUAL.scarceYardColor).toBe("#9a7a58");
    expect(cityScarceVsCivicPadContrast()).toBeGreaterThan(20);
    // Kit never overrides cool civic pad RGB — articulation accents only.
    expect(kit.roofColor).not.toBe(CITY_HUB_VISUAL.civicPadColor);
    expect(kit.sillColor).not.toBe(CITY_HUB_VISUAL.scarceYardColor);
    expect(kit.windowEmissiveIntensity).toBe(0.25);
  });
});
