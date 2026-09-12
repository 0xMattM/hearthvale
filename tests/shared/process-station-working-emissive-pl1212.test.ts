import { describe, expect, it } from "vitest";
import {
  PROCESS_STATION_TYPES,
  PROCESS_STATION_WORKING_EMISSIVE,
  PROCESS_STATION_WORLD_SOFT,
  RECIPES,
  processStationWorkingEmissiveEnvelope,
  processStationWorkingEmissiveIntensity,
  processStationWorldLabelParts,
  shouldShowProcessStationWorkingEmissive,
} from "@game/shared";

/**
 * PL121.2 — Process-station working emissive.
 * Choice: soft warm pad/body glow while craft panel is open for that station
 * (panel-open = in-flight; no invent queues); recipes / XP / Craft label unchanged.
 */
describe("CityLands PL121.2 process-station working emissive", () => {
  it("glows while craft panel open for matching station (happy)", () => {
    for (const type of PROCESS_STATION_TYPES) {
      expect(shouldShowProcessStationWorkingEmissive(type, type)).toBe(true);
    }

    const { intensityMin, intensityMax, periodMs, padColor, bodyEmissive } =
      PROCESS_STATION_WORKING_EMISSIVE;
    expect(periodMs).toBeGreaterThan(0);
    expect(intensityMax).toBeGreaterThan(intensityMin);
    expect(padColor.length).toBeGreaterThan(0);
    expect(bodyEmissive.length).toBeGreaterThan(0);

    const mid = processStationWorkingEmissiveEnvelope(periodMs / 4);
    const trough = processStationWorkingEmissiveEnvelope((3 * periodMs) / 4);
    expect(mid).toBeGreaterThan(trough);

    expect(processStationWorkingEmissiveIntensity(true, 1)).toBe(intensityMax);
    expect(processStationWorkingEmissiveIntensity(true, 0)).toBe(intensityMin);
  });

  it("stays quiet when panel closed or mismatched; Craft label kept (edge)", () => {
    expect(shouldShowProcessStationWorkingEmissive("mill", null)).toBe(false);
    expect(shouldShowProcessStationWorkingEmissive("mill", "forge")).toBe(false);
    expect(shouldShowProcessStationWorkingEmissive("crop_plot", "mill")).toBe(
      false,
    );
    expect(shouldShowProcessStationWorkingEmissive("tree_stump", null)).toBe(
      false,
    );
    expect(processStationWorkingEmissiveIntensity(false, 1)).toBe(0);
    expect(processStationWorkingEmissiveIntensity(false, 0.5)).toBe(0);

    for (const type of PROCESS_STATION_TYPES) {
      expect(processStationWorldLabelParts(type).soft).toBe(
        PROCESS_STATION_WORLD_SOFT,
      );
    }
  });

  it("keeps recipes / XP; clamps envelope (failure)", () => {
    const flour = RECIPES.find((r) => r.id === "mill_flour");
    expect(flour).toBeDefined();
    expect(flour!.station).toBe("mill");
    expect(flour!.energyCost).toBeGreaterThan(0);
    expect(typeof flour!.minProfessionXp).toBe("number");

    expect(processStationWorkingEmissiveEnvelope(Number.NaN)).toBe(0);
    expect(processStationWorkingEmissiveIntensity(true, 2)).toBe(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );
    expect(processStationWorkingEmissiveIntensity(true, -1)).toBe(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMin,
    );
  });
});
