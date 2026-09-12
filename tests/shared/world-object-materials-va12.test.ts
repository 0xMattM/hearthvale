import { describe, expect, it } from "vitest";
import {
  CITY_SCARCE_YARD_PROP_MATERIALS,
  CITY_SCARCE_YARD_PROP_PLACEMENTS,
  cityScarceYardPropMaterials,
  cityScarceYardProps,
  gatherDockSurfaceMaterials,
  gatherPenSurfaceMaterials,
  processStationKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA1.2", () => {
  it("loom / alchemy kits stay profession-readable (happy)", () => {
    const loom = processStationKitMaterials("loom");
    const alchemy = processStationKitMaterials("alchemy_bench");
    expect(loom.warpColor).not.toBe(alchemy.vesselColor);
    expect(alchemy.flask.roughness).toBeLessThan(loom.body.roughness);
    expect(loom.shuttle.metalness).toBeGreaterThan(loom.beam.metalness);
    expect(alchemy.burner.metalness).toBeGreaterThan(alchemy.body.metalness);
    expect(worldObjectSurfacesDiffer(loom.warp, alchemy.flask)).toBe(true);
  });

  it("ready dock / pen surfaces differ from cooling (edge)", () => {
    const dockReady = gatherDockSurfaceMaterials(true);
    const dockCool = gatherDockSurfaceMaterials(false);
    expect(dockReady.water.roughness).toBeLessThan(dockCool.water.roughness);
    expect(dockReady.cleat.metalness).toBeGreaterThan(dockCool.cleat.metalness);
    expect(dockReady.deckColor).not.toBe(dockCool.deckColor);

    const penReady = gatherPenSurfaceMaterials(true);
    const penCool = gatherPenSurfaceMaterials(false);
    expect(penReady.showHay).toBe(true);
    expect(penCool.showHay).toBe(false);
    expect(penReady.rail.roughness).toBeLessThan(penCool.rail.roughness);
    expect(penReady.hayColor).not.toBe(penCool.hayColor);
  });

  it("scarce yard props stay scarce atmosphere (failure)", () => {
    const props = cityScarceYardProps();
    expect(props.length).toBeGreaterThanOrEqual(5);
    expect(props.length).toBeLessThanOrEqual(8);
    expect(props).toEqual(CITY_SCARCE_YARD_PROP_PLACEMENTS);

    const kinds = new Set(props.map((p) => p.kind));
    expect(kinds.has("crate")).toBe(true);
    expect(kinds.has("barrel")).toBe(true);
    expect(kinds.has("stone")).toBe(true);

    const crate = cityScarceYardPropMaterials("crate");
    const barrel = cityScarceYardPropMaterials("barrel");
    expect(crate.color).not.toBe(barrel.color);
    expect(crate.body.roughness).toBeGreaterThan(0.5);
    expect(Object.keys(CITY_SCARCE_YARD_PROP_MATERIALS).sort()).toEqual([
      "barrel",
      "crate",
      "post",
      "rope",
      "stone",
    ]);

    // Props must not sit on plaza fountain origin.
    expect(props.every((p) => Math.hypot(p.x, p.z) > 1.5)).toBe(true);
  });
});
