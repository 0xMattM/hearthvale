import { describe, expect, it } from "vitest";
import {
  FISHING_DOCK,
  GATHER_READY_WORLD_SOFT,
  PLAYER_LAND_STATIONS,
  gatherStationReadyWorldLabelParts,
  isGatherReadyLabelBuilding,
} from "@game/shared";

/**
 * PL30.1 — Fishing dock ready world label.
 * Choice: reuse gather Ready SoT (PL23.2) for dock catch-available;
 * cooldown / yields unchanged; depleted stay timer/pad.
 */
describe("CityLands PL30.1 fishing dock ready world label", () => {
  it("leads with Fishing Dock and soft Ready (happy)", () => {
    const parts = gatherStationReadyWorldLabelParts("fishing_dock");
    expect(parts.name).toBe(PLAYER_LAND_STATIONS.fishing_dock.name);
    expect(parts.name).toBe("Fishing Dock");
    expect(parts.soft).toBe(GATHER_READY_WORLD_SOFT);
    expect(parts.soft).toBe("Ready");
  });

  it("maps dock as gather-ready label; cooldown / yields unchanged (edge)", () => {
    expect(isGatherReadyLabelBuilding("fishing_dock")).toBe(true);
    expect(FISHING_DOCK.cooldownMs).toBe(60_000);
    expect(FISHING_DOCK.yieldItemId).toBe("fish");
    expect(FISHING_DOCK.yieldQty).toBe(1);
    expect(FISHING_DOCK.xp).toBe(5);
    expect(PLAYER_LAND_STATIONS.fishing_dock.kitItemId).toBe("fishing_dock_kit");
  });

  it("keeps name ahead of soft; rejects process types (failure)", () => {
    expect(isGatherReadyLabelBuilding("mill")).toBe(false);
    expect(isGatherReadyLabelBuilding("kitchen")).toBe(false);
    const parts = gatherStationReadyWorldLabelParts("fishing_dock");
    expect(parts.name.toLowerCase()).not.toBe(parts.soft.toLowerCase());
    expect(parts.name.length).toBeGreaterThan(parts.soft.length);
    expect(parts.soft).not.toBe("Craft");
  });
});
