import { describe, expect, it } from "vitest";
import {
  PROCESS_STATION_KIT_MATERIALS,
  WORLD_OBJECT_SURFACE,
  gatherOreSurfaceMaterials,
  gatherStumpSurfaceMaterials,
  processStationKitMaterials,
  worldObjectSurface,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA1.1", () => {
  it("exposes distinct wood/stone/metal surfaces (happy)", () => {
    const bark = worldObjectSurface("woodBark");
    const vein = worldObjectSurface("stoneVein");
    const anvil = worldObjectSurface("forgeAnvil");
    expect(bark.roughness).toBeGreaterThan(vein.roughness);
    expect(anvil.metalness).toBeGreaterThan(bark.metalness);
    expect(worldObjectSurfacesDiffer(bark, vein)).toBe(true);
    expect(WORLD_OBJECT_SURFACE.millStone.roughness).toBeGreaterThan(0.5);
  });

  it("ready stump/ore surfaces differ from depleted (edge)", () => {
    const stumpReady = gatherStumpSurfaceMaterials(true);
    const stumpCool = gatherStumpSurfaceMaterials(false);
    expect(stumpReady.showKerf).toBe(true);
    expect(stumpCool.showKerf).toBe(false);
    expect(stumpReady.top.roughness).toBeLessThan(stumpCool.top.roughness);

    const oreReady = gatherOreSurfaceMaterials(true);
    const oreCool = gatherOreSurfaceMaterials(false);
    expect(oreReady.vein.metalness).toBeGreaterThan(oreCool.vein.metalness);
    expect(oreReady.rubbleColor).not.toBe(oreCool.rubbleColor);
  });

  it("process station kits keep profession-readable colors (failure)", () => {
    const mill = processStationKitMaterials("mill");
    const forge = processStationKitMaterials("forge");
    const kitchen = processStationKitMaterials("kitchen");
    const workshop = processStationKitMaterials("workshop");
    expect(mill.towerColor).not.toBe(forge.bodyColor);
    expect(kitchen.potColor).not.toBe(workshop.benchColor);
    expect(forge.anvil.metalness).toBeGreaterThan(kitchen.body.metalness);
    expect(Object.keys(PROCESS_STATION_KIT_MATERIALS)).toEqual([
      "mill",
      "forge",
      "kitchen",
      "workshop",
      "loom",
      "alchemy_bench",
    ]);
    // Flat default MeshStandard (roughness 1 / metalness 0) should not match metals.
    expect(forge.anvil.roughness).toBeLessThan(1);
    expect(forge.anvil.metalness).toBeGreaterThan(0);
  });
});
