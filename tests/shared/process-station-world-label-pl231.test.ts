import { describe, expect, it } from "vitest";
import {
  PLAYER_LAND_STATIONS,
  PROCESS_STATION_TYPES,
  PROCESS_STATION_WORLD_SOFT,
  isProcessStationBuilding,
  processStationWorldLabelParts,
} from "@game/shared";

/**
 * PL23.1 — Process station world labels.
 * Choice: catalog name first + soft "Craft" secondary (PL22.2 / PL2.1 spirit);
 * costs/recipes unchanged; no HUD column.
 */
describe("CityLands PL23.1 process station world labels", () => {
  it("leads with catalog name and soft Craft for all process stations (happy)", () => {
    for (const type of PROCESS_STATION_TYPES) {
      const parts = processStationWorldLabelParts(type);
      expect(parts.name).toBe(PLAYER_LAND_STATIONS[type].name);
      expect(parts.soft).toBe(PROCESS_STATION_WORLD_SOFT);
      expect(parts.soft).toBe("Craft");
      expect(isProcessStationBuilding(type)).toBe(true);
    }
    expect(processStationWorldLabelParts("mill").name).toBe("Mill");
    expect(processStationWorldLabelParts("forge").name).toBe("Forge");
    expect(processStationWorldLabelParts("kitchen").name).toBe("Kitchen");
    expect(processStationWorldLabelParts("workshop").name).toBe(
      "Carpenter Table",
    );
    expect(processStationWorldLabelParts("loom").name).toBe("Loom");
    expect(processStationWorldLabelParts("alchemy_bench").name).toBe(
      "Alchemy Bench",
    );
  });

  it("covers process group stations and keeps place costs unchanged (edge)", () => {
    expect(PROCESS_STATION_TYPES).toEqual([
      "workshop",
      "mill",
      "forge",
      "kitchen",
      "alchemy_bench",
      "loom",
    ]);
    expect(PLAYER_LAND_STATIONS.mill.kitItemId).toBe("mill_kit");
    expect(PLAYER_LAND_STATIONS.forge.kitItemId).toBe("forge_kit");
    expect(PLAYER_LAND_STATIONS.kitchen.kitItemId).toBe("kitchen_kit");
    expect(PLAYER_LAND_STATIONS.workshop.kitItemId).toBe("workshop_kit");
    expect(PLAYER_LAND_STATIONS.loom.kitItemId).toBe("loom_kit");
    expect(PLAYER_LAND_STATIONS.alchemy_bench.kitItemId).toBe("alchemy_bench_kit");
  });

  it("rejects gather/care types and keeps name ahead of soft (failure)", () => {
    expect(isProcessStationBuilding("tree_stump")).toBe(false);
    expect(isProcessStationBuilding("ore_node")).toBe(false);
    expect(isProcessStationBuilding("crop_plot")).toBe(false);
    expect(isProcessStationBuilding("animal_pen")).toBe(false);
    expect(isProcessStationBuilding("decor_planter")).toBe(false);
    const parts = processStationWorldLabelParts("mill");
    expect(parts.name.toLowerCase()).not.toBe(parts.soft.toLowerCase());
    expect(parts.name.length).toBeGreaterThan(0);
    expect(parts.soft.length).toBeGreaterThan(0);
  });
});
