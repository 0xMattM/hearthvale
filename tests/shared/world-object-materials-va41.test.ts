import { describe, expect, it } from "vitest";
import {
  CITY_HUB_VISUAL,
  cityHubFloorColors,
  cityScarceVsCivicPadContrast,
} from "../../packages/shared/src/catalog";
import {
  cityHubFloorKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA4.1", () => {
  it("plaza stone reads smoother than outer streets (happy)", () => {
    const kit = cityHubFloorKitMaterials();
    expect(kit.plaza.roughness).toBeLessThan(kit.streets.roughness);
    expect(kit.inlay.metalness).toBeGreaterThan(kit.scarceYard.metalness);
    expect(kit.curbColor).toMatch(/^#/);
    expect(worldObjectSurfacesDiffer(kit.plaza, kit.streets)).toBe(true);
  });

  it("scarce yard stays duller earth than polished inlay (edge)", () => {
    const kit = cityHubFloorKitMaterials();
    expect(kit.scarceYard.roughness).toBeGreaterThan(kit.inlay.roughness);
    expect(kit.road.roughness).toBeLessThan(kit.streets.roughness);
    expect(kit.curb.metalness).toBeGreaterThan(kit.scarceYard.metalness);
    expect(worldObjectSurfacesDiffer(kit.scarceYard, kit.inlay)).toBe(true);
    expect(worldObjectSurfacesDiffer(kit.road, kit.curb)).toBe(true);
  });

  it("CITY_HUB_VISUAL floor hexes + scarce contrast stay intact (failure)", () => {
    const kit = cityHubFloorKitMaterials();
    const floors = cityHubFloorColors();
    expect(floors.streetsColor).toBe(CITY_HUB_VISUAL.streetsColor);
    expect(floors.plazaColor).toBe("#8a9098");
    expect(floors.scarceYardColor).toBe("#9a7a58");
    expect(floors.civicPadColor).toBe("#6a7380");
    expect(floors.roadColor).toBe(CITY_HUB_VISUAL.roadColor);
    expect(cityScarceVsCivicPadContrast()).toBeGreaterThan(20);
    // Kit never overrides atmosphere floor RGB — curb accents only.
    expect(kit.curbColor).not.toBe(CITY_HUB_VISUAL.scarceYardColor);
    expect(kit.scarceCurbColor).not.toBe(CITY_HUB_VISUAL.civicPadColor);
    expect(kit.scarceCurbColor).not.toBe(CITY_HUB_VISUAL.streetsColor);
  });
});
