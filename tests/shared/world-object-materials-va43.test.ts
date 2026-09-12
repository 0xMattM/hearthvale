import { describe, expect, it } from "vitest";
import {
  EXPLORE_MINES_LANDMARK_CUE,
  EXPLORE_SECTION_LANDMARK_CUE,
  EXPLORE_SECTIONS,
  EXPLORE_WILDS_VISUAL,
  exploreSectionFloorContrastMin,
  exploreWildsFloorColors,
} from "../../packages/shared/src/catalog";
import {
  exploreSectionFloorKitSurface,
  exploreWildsFloorKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA4.3", () => {
  it("outer canopy reads rougher than mines stone floor (happy)", () => {
    const kit = exploreWildsFloorKitMaterials();
    expect(kit.canopy.roughness).toBeGreaterThan(kit.mines.roughness);
    expect(kit.mines.metalness).toBeGreaterThan(kit.woodland.metalness);
    expect(kit.pathLipColor).toMatch(/^#/);
    expect(worldObjectSurfacesDiffer(kit.canopy, kit.mines)).toBe(true);
  });

  it("hunt path articulates vs entry path without flattening sections (edge)", () => {
    const kit = exploreWildsFloorKitMaterials();
    expect(kit.huntPath.roughness).toBeLessThan(kit.entryPath.roughness);
    expect(kit.pathLip.roughness).toBeLessThan(kit.entryPath.roughness);
    expect(kit.hunt.roughness).toBeLessThan(kit.canopy.roughness);
    expect(worldObjectSurfacesDiffer(kit.entryPath, kit.huntPath)).toBe(true);
    expect(worldObjectSurfacesDiffer(kit.woodland, kit.hunt)).toBe(true);
    expect(exploreSectionFloorKitSurface("mines")).toEqual(kit.mines);
    expect(exploreSectionFloorKitSurface("unknown")).toEqual(kit.canopy);
  });

  it("EXPLORE floor hexes + landmark cues stay intact (failure)", () => {
    const kit = exploreWildsFloorKitMaterials();
    const wilds = exploreWildsFloorColors();
    const woodland = EXPLORE_SECTIONS.find((s) => s.id === "woodland")!;
    const mines = EXPLORE_SECTIONS.find((s) => s.id === "mines")!;
    const hunt = EXPLORE_SECTIONS.find((s) => s.id === "hunt")!;
    expect(wilds.canopyColor).toBe(EXPLORE_WILDS_VISUAL.canopyColor);
    expect(wilds.pathColor).toBe(EXPLORE_WILDS_VISUAL.pathColor);
    expect(woodland.floorColor).toBe("#2e6b3c");
    expect(mines.floorColor).toBe("#4a5058");
    expect(hunt.floorColor).toBe("#6b5434");
    expect(hunt.pathColor).toBe("#8a6a3a");
    expect(exploreSectionFloorContrastMin()).toBeGreaterThan(20);
    expect(EXPLORE_SECTION_LANDMARK_CUE.emissive).toMatch(/^#/);
    expect(EXPLORE_MINES_LANDMARK_CUE.emissive).toMatch(/^#/);
    // Kit never overrides atmosphere / section RGB — lip accents only.
    expect(kit.pathLipColor).not.toBe(EXPLORE_WILDS_VISUAL.pathColor);
    expect(kit.huntPathLipColor).not.toBe(hunt.pathColor);
    expect(kit.pathLipColor).not.toBe(EXPLORE_SECTION_LANDMARK_CUE.emissive);
  });
});
