import { describe, expect, it } from "vitest";
import {
  CITY_ATMOSPHERE_LABELS,
  CITY_HUB_VISUAL,
  CITY_PLAZA_LANDMARK_CUE,
  CITY_TUTOR_LANE_LANDMARK_CUE,
  cityHubFloorColors,
  cityTutorLaneLandmarkCue,
  cityTutorLaneLandmarkEmissiveIntensity,
  cityTutorLaneLandmarkHazeOpacity,
  cityTutorLaneLandmarkPulseEnvelope,
  cityTutorLaneLandmarkVsPlazaContrast,
  cityTutorLaneLandmarkVsScarceYardContrast,
  cityScarceStationMarkers,
} from "@game/shared";

/**
 * PL129.1 — Tutor-lane soft landmark strip.
 * Choice: quiet cooler mint-teal emissive + haze on the existing tutor-lane
 * floor strip so tutorials read apart from warm scarce yard (complements plaza
 * landmark PL125.1); no new stations; claim rules / layouts unchanged.
 */
describe("CityLands PL129.1 tutor-lane soft landmark strip", () => {
  it("pulses soft cooler emissive / haze on tutor-lane strip (happy)", () => {
    const cue = cityTutorLaneLandmarkCue();
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_TUTOR_LANE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_TUTOR_LANE_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CITY_TUTOR_LANE_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.stripColor.toLowerCase()).toBe(
      CITY_HUB_VISUAL.tutorLaneColor.toLowerCase(),
    );
    expect(cue.stripZ).toBe(CITY_TUTOR_LANE_LANDMARK_CUE.stripZ);
    expect(cue.stripWidth).toBe(CITY_TUTOR_LANE_LANDMARK_CUE.stripWidth);

    const peak = cityTutorLaneLandmarkEmissiveIntensity(1);
    const floor = cityTutorLaneLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_TUTOR_LANE_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_TUTOR_LANE_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityTutorLaneLandmarkHazeOpacity(1);
    const hazeFloor = cityTutorLaneLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays cool vs scarce yard and distinct from plaza (edge)", () => {
    expect(cityTutorLaneLandmarkVsScarceYardContrast()).toBeGreaterThan(40);
    expect(cityTutorLaneLandmarkVsPlazaContrast()).toBeGreaterThan(20);
    expect(CITY_TUTOR_LANE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.scarceYardColor.toLowerCase(),
    );
    expect(CITY_TUTOR_LANE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cityHubFloorColors().tutorLaneColor.toLowerCase()).toBe(
      CITY_HUB_VISUAL.tutorLaneColor.toLowerCase(),
    );

    expect(CITY_TUTOR_LANE_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(0);
    const low = cityTutorLaneLandmarkPulseEnvelope(0);
    const mid = cityTutorLaneLandmarkPulseEnvelope(
      CITY_TUTOR_LANE_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low).toBeLessThanOrEqual(1);
    expect(mid).toBeGreaterThan(low);

    const tutorLabel = CITY_ATMOSPHERE_LABELS.find((r) => r.id === "tutor_lane");
    expect(tutorLabel?.id).toBe("tutor_lane");
    expect(tutorLabel?.z).toBe(6);
  });

  it("does not invent stations; clamps / scarce layout stay intact (failure)", () => {
    const markers = cityScarceStationMarkers();
    expect(markers.length).toBeGreaterThan(0);
    expect(new Set(markers.map((m) => m.type)).has("tutor_hall" as never)).toBe(
      false,
    );
    expect(cityTutorLaneLandmarkEmissiveIntensity(2)).toBe(
      CITY_TUTOR_LANE_LANDMARK_CUE.intensityPeak,
    );
    expect(cityTutorLaneLandmarkEmissiveIntensity(-1)).toBe(
      CITY_TUTOR_LANE_LANDMARK_CUE.intensityBase,
    );
    expect(cityTutorLaneLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_TUTOR_LANE_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_TUTOR_LANE_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat/i,
    );
  });
});
