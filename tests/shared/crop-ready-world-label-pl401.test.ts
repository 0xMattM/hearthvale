import { describe, expect, it } from "vitest";
import {
  CROPS,
  GATHER_READY_WORLD_SOFT,
  ITEMS,
  PLAYER_LAND_STATIONS,
  cropReadyWorldLabelParts,
  cropReadyWorldPulseIntensity,
  CROP_READY_WORLD_PULSE,
} from "@game/shared";

/**
 * PL40.1 — Crop ready world name cue (name-first + soft Ready).
 * Choice: harvest item name (Wheat) + soft Ready when ripe — complements
 * pad pulse (PL12.1); grow timers unchanged; no spawn invent.
 */
describe("CityLands PL40.1 crop ready world name cue", () => {
  it("leads with Wheat and soft Ready when cropId known (happy)", () => {
    const parts = cropReadyWorldLabelParts("wheat");
    expect(parts.name).toBe(ITEMS.wheat.name);
    expect(parts.name).toBe("Wheat");
    expect(parts.soft).toBe(GATHER_READY_WORLD_SOFT);
    expect(parts.soft).toBe("Ready");
  });

  it("falls back to Crop Plot; pulse SoT and growMs unchanged (edge)", () => {
    const fallback = cropReadyWorldLabelParts(null);
    expect(fallback.name).toBe(PLAYER_LAND_STATIONS.crop_plot.name);
    expect(fallback.name).toBe("Crop Plot");
    expect(fallback.soft).toBe("Ready");

    expect(CROPS.wheat.growMs).toBe(3 * 60 * 1000);
    expect(CROP_READY_WORLD_PULSE.periodMs).toBeGreaterThan(0);
    const a = cropReadyWorldPulseIntensity(0);
    const b = cropReadyWorldPulseIntensity(CROP_READY_WORLD_PULSE.periodMs / 4);
    expect(a).toBeGreaterThanOrEqual(CROP_READY_WORLD_PULSE.intensityMin);
    expect(a).toBeLessThanOrEqual(CROP_READY_WORLD_PULSE.intensityMax);
    expect(b).not.toBe(a);
  });

  it("rejects inventing soft as name and keeps name ahead of soft (failure)", () => {
    const parts = cropReadyWorldLabelParts("wheat");
    expect(parts.name.toLowerCase()).not.toBe(parts.soft.toLowerCase());
    expect(parts.name.length).toBeGreaterThan(0);
    expect(parts.soft).toBe("Ready");
    // Unknown crop id still labels — never invents a free/instant harvest cue.
    const unknown = cropReadyWorldLabelParts("no_such_crop");
    expect(unknown.name).toBe(PLAYER_LAND_STATIONS.crop_plot.name);
    expect(unknown.soft).toBe("Ready");
    expect(CROPS.wheat.harvestQty).toBe(2);
  });
});
