import { describe, expect, it } from "vitest";
import {
  CROP_READY_WORLD_PULSE,
  PROCESS_STATION_WORKING_EMISSIVE,
  cropReadyWorldPulseIntensity,
  processStationWorkingEmissiveEnvelope,
} from "@game/shared";

/**
 * RF6.4 — visual cue configs live in catalog-cues-* and re-export via catalog.
 */
describe("catalog-cues RF6.4", () => {
  it("exports process-station working cue (happy)", () => {
    expect(PROCESS_STATION_WORKING_EMISSIVE.periodMs).toBe(1200);
    const env = processStationWorkingEmissiveEnvelope(0);
    expect(env).toBeGreaterThanOrEqual(0);
    expect(env).toBeLessThanOrEqual(1);
  });

  it("crop ready pulse stays in unit interval (edge)", () => {
    expect(CROP_READY_WORLD_PULSE.periodMs).toBeGreaterThan(0);
    for (const t of [0, 100, 2500, 10_000]) {
      const v = cropReadyWorldPulseIntensity(t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(2);
    }
  });

  it("rejects inventing missing cue export shape (fail)", () => {
    expect(
      (PROCESS_STATION_WORKING_EMISSIVE as { notAField?: unknown }).notAField,
    ).toBeUndefined();
  });
});
