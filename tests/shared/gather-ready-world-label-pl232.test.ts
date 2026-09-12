import { describe, expect, it } from "vitest";
import {
  GATHER_READY_WORLD_SOFT,
  PLAYER_LAND_STATIONS,
  gatherStationReadyWorldLabelParts,
  isGatherReadyLabelBuilding,
} from "@game/shared";

/**
 * PL23.2 — Gather station name cue when ready.
 * Choice: catalog name + soft "Ready" when choppable/mineable;
 * depleted stay timer/pad only (PL12.2); no spawn-rate invent.
 */
describe("CityLands PL23.2 gather ready world label", () => {
  it("leads with Tree / Ore Rock and soft Ready (happy)", () => {
    const tree = gatherStationReadyWorldLabelParts("tree_stump");
    expect(tree.name).toBe(PLAYER_LAND_STATIONS.tree_stump.name);
    expect(tree.name).toBe("Tree");
    expect(tree.soft).toBe(GATHER_READY_WORLD_SOFT);
    expect(tree.soft).toBe("Ready");

    const ore = gatherStationReadyWorldLabelParts("ore_node");
    expect(ore.name).toBe(PLAYER_LAND_STATIONS.ore_node.name);
    expect(ore.name).toBe("Ore Rock");
    expect(ore.soft).toBe("Ready");
  });

  it("maps tree/ore gather types; place costs unchanged (edge)", () => {
    expect(isGatherReadyLabelBuilding("tree_stump")).toBe(true);
    expect(isGatherReadyLabelBuilding("ore_node")).toBe(true);
    expect(PLAYER_LAND_STATIONS.tree_stump.kitItemId).toBe("tree_stump_kit");
    expect(PLAYER_LAND_STATIONS.ore_node.kitItemId).toBe("ore_node_kit");
    expect(GATHER_READY_WORLD_SOFT).not.toBe("Craft");
  });

  it("rejects process/crop types and keeps name ahead of soft (failure)", () => {
    expect(isGatherReadyLabelBuilding("mill")).toBe(false);
    expect(isGatherReadyLabelBuilding("crop_plot")).toBe(false);
    expect(isGatherReadyLabelBuilding("game_trail")).toBe(false);
    const parts = gatherStationReadyWorldLabelParts("tree_stump");
    expect(parts.name.toLowerCase()).not.toBe(parts.soft.toLowerCase());
    expect(parts.name.length).toBeGreaterThan(0);
    expect(parts.soft).toBe("Ready");
    const ore = gatherStationReadyWorldLabelParts("ore_node");
    expect(ore.name.length).toBeGreaterThan(ore.soft.length);
  });
});
