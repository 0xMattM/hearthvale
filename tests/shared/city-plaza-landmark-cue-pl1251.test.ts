import { describe, expect, it } from "vitest";
import {
  CITY_HUB_VISUAL,
  CITY_PLAZA_LANDMARK_CUE,
  cityHubFloorColors,
  cityPlazaLandmarkCue,
  cityPlazaLandmarkEmissiveIntensity,
  cityPlazaLandmarkHazeOpacity,
  cityPlazaLandmarkPulseEnvelope,
  cityPlazaLandmarkVsScarceYardContrast,
  cityScarceStationMarkers,
} from "@game/shared";

/**
 * PL125.1 — City plaza soft landmark cue.
 * Choice: quiet cool emissive + haze on the existing plaza fountain so hub center
 * reads apart from warm scarce yards; no new stations; layouts / contention unchanged.
 */
describe("CityLands PL125.1 city plaza soft landmark cue", () => {
  it("pulses soft cool emissive / haze on plaza fountain (happy)", () => {
    const cue = cityPlazaLandmarkCue();
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_PLAZA_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CITY_PLAZA_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(CITY_PLAZA_LANDMARK_CUE.hazeRadius);
    expect(cue.basinColor.toLowerCase()).toBe(
      CITY_PLAZA_LANDMARK_CUE.basinColor.toLowerCase(),
    );

    const peak = cityPlazaLandmarkEmissiveIntensity(1);
    const floor = cityPlazaLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_PLAZA_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_PLAZA_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityPlazaLandmarkHazeOpacity(1);
    const hazeFloor = cityPlazaLandmarkHazeOpacity(0);
    expect(hazePeak).toBe(CITY_PLAZA_LANDMARK_CUE.hazeOpacityPeak);
    expect(hazeFloor).toBe(CITY_PLAZA_LANDMARK_CUE.hazeOpacityBase);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays cool vs scarce yard; pulse envelope oscillates (edge)", () => {
    expect(cityPlazaLandmarkVsScarceYardContrast()).toBeGreaterThan(40);
    expect(CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.scarceYardColor.toLowerCase(),
    );
    expect(cityHubFloorColors().scarceYardColor.toLowerCase()).toBe(
      CITY_HUB_VISUAL.scarceYardColor.toLowerCase(),
    );

    expect(CITY_PLAZA_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(0);
    const low = cityPlazaLandmarkPulseEnvelope(0);
    const mid = cityPlazaLandmarkPulseEnvelope(
      CITY_PLAZA_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low).toBeLessThanOrEqual(1);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent stations; clamps / scarce layout stay intact (failure)", () => {
    const markers = cityScarceStationMarkers();
    expect(markers.length).toBeGreaterThan(0);
    expect(new Set(markers.map((m) => m.type)).has("civic_hall" as never)).toBe(
      false,
    );
    expect(cityPlazaLandmarkEmissiveIntensity(2)).toBe(
      CITY_PLAZA_LANDMARK_CUE.intensityPeak,
    );
    expect(cityPlazaLandmarkEmissiveIntensity(-1)).toBe(
      CITY_PLAZA_LANDMARK_CUE.intensityBase,
    );
    expect(cityPlazaLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_PLAZA_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
  });
});
