import { describe, expect, it } from "vitest";
import {
  WARRIOR_ARENA_VISUAL,
  warriorArenaGroundContrastMin,
  warriorArenaRingContrast,
} from "../../packages/shared/src/catalog";
import {
  interactHighlightRingMaterials,
  warriorArenaFloorKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA4.4", () => {
  it("packed clay ring reads smoother than scorched grounds (happy)", () => {
    const kit = warriorArenaFloorKitMaterials();
    expect(kit.ring.roughness).toBeLessThan(kit.grounds.roughness);
    expect(kit.chalk.roughness).toBeLessThan(kit.ringBorder.roughness);
    expect(kit.ringLipColor).toMatch(/^#/);
    expect(worldObjectSurfacesDiffer(kit.ring, kit.grounds)).toBe(true);
  });

  it("ring lip articulates without flattening chalk or path (edge)", () => {
    const kit = warriorArenaFloorKitMaterials();
    const ring = interactHighlightRingMaterials();
    expect(kit.ringLip.metalness).toBeGreaterThan(kit.grounds.metalness);
    expect(kit.path.roughness).toBeGreaterThan(kit.ring.roughness);
    expect(worldObjectSurfacesDiffer(kit.chalk, kit.path)).toBe(true);
    expect(worldObjectSurfacesDiffer(kit.ringBorder, kit.ringLip)).toBe(true);
    expect(ring.color).toBe("#e6c96a");
    expect(ring.opacity).toBeGreaterThan(0.5);
    expect(ring.outerRadius).toBeGreaterThan(ring.innerRadius);
  });

  it("WARRIOR_ARENA_VISUAL floor hexes + select gold stay intact (failure)", () => {
    const kit = warriorArenaFloorKitMaterials();
    const ring = interactHighlightRingMaterials();
    expect(WARRIOR_ARENA_VISUAL.groundsColor).toBe("#3a2820");
    expect(WARRIOR_ARENA_VISUAL.ringFillColor).toBe("#d4a048");
    expect(WARRIOR_ARENA_VISUAL.chalkColor).toBe("#efe0b8");
    expect(WARRIOR_ARENA_VISUAL.pathColor).toBe("#5a3828");
    expect(warriorArenaGroundContrastMin()).toBeGreaterThan(20);
    expect(warriorArenaRingContrast()).toBeGreaterThan(20);
    // Kit never overrides arena atmosphere RGB — lip accent only.
    expect(kit.ringLipColor).not.toBe(WARRIOR_ARENA_VISUAL.ringFillColor);
    expect(kit.ringLipColor).not.toBe(WARRIOR_ARENA_VISUAL.groundsColor);
    expect(ring.color).not.toBe(WARRIOR_ARENA_VISUAL.plaqueAccent);
    expect(ring.color).not.toBe(WARRIOR_ARENA_VISUAL.ringFillColor);
  });
});
