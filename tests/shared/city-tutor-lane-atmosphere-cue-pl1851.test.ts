import { describe, expect, it } from "vitest";
import {
  CITY_PLAZA_ATMOSPHERE_CUE,
  CITY_SCARCE_YARD_ATMOSPHERE_CUE,
  CITY_TUTOR_LANE_ATMOSPHERE_CUE,
  CITY_TUTOR_LANE_LANDMARK_CUE,
  cityScarceStationMarkers,
  cityTutorLaneAtmosphereCue,
  cityTutorLaneAtmosphereEmissiveIntensity,
  cityTutorLaneAtmosphereHazeOpacity,
  cityTutorLaneAtmospherePulseEnvelope,
  cityTutorLaneAtmosphereVsLandmarkContrast,
  cityTutorLaneAtmosphereVsPlazaMistContrast,
  cityTutorLaneAtmosphereVsScarceYardMistContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL185.1 — City tutor-lane soft atmosphere leftover.
 * Choice: quiet cool pulsing mist over existing tutor lane while on City
 * (complements landmark strip + plaza mist; claim rules / layouts unchanged).
 */
describe("CityLands PL185.1 city tutor-lane soft atmosphere leftover", () => {
  it("pulses quiet cool tutor-lane mist while on City (happy)", () => {
    const cue = cityTutorLaneAtmosphereCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_TUTOR_LANE_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_TUTOR_LANE_ATMOSPHERE_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_TUTOR_LANE_ATMOSPHERE_CUE.hazeOpacityBase : 0);
    expect(cue.hazeWidth).toBe(CITY_TUTOR_LANE_ATMOSPHERE_CUE.hazeWidth);
    expect(cue.hazeDepth).toBe(CITY_TUTOR_LANE_ATMOSPHERE_CUE.hazeDepth);
    expect(cue.laneCenterX).toBe(CITY_TUTOR_LANE_ATMOSPHERE_CUE.laneCenterX);
    expect(cue.laneCenterZ).toBe(CITY_TUTOR_LANE_ATMOSPHERE_CUE.laneCenterZ);
    expect(cue.laneCenterZ).toBe(CITY_TUTOR_LANE_LANDMARK_CUE.stripZ);

    const peak = cityTutorLaneAtmosphereEmissiveIntensity(1);
    const floor = cityTutorLaneAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(CITY_TUTOR_LANE_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(CITY_TUTOR_LANE_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityTutorLaneAtmosphereHazeOpacity(1);
    const hazeFloor = cityTutorLaneAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; mist ≠ landmark / plaza / scarce yard (edge)", () => {
    expect(cityTutorLaneAtmosphereCue("warrior").show).toBe(false);
    expect(cityTutorLaneAtmosphereCue("explore").show).toBe(false);
    expect(cityTutorLaneAtmosphereCue("player_land").show).toBe(false);
    expect(cityTutorLaneAtmosphereCue(null).show).toBe(false);
    expect(cityTutorLaneAtmosphereCue("").show).toBe(false);
    expect(cityTutorLaneAtmosphereCue("warrior").intensity).toBe(0);
    expect(cityTutorLaneAtmosphereCue("warrior").hazeOpacity).toBe(0);

    expect(cityTutorLaneAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(cityTutorLaneAtmosphereVsPlazaMistContrast()).toBeGreaterThan(0);
    expect(cityTutorLaneAtmosphereVsScarceYardMistContrast()).toBeGreaterThan(0);
    expect(CITY_TUTOR_LANE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_TUTOR_LANE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_TUTOR_LANE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(CITY_TUTOR_LANE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(CITY_TUTOR_LANE_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_TUTOR_LANE_LANDMARK_CUE.pulsePeriodMs,
    );

    const low = cityTutorLaneAtmospherePulseEnvelope(0);
    const mid = cityTutorLaneAtmospherePulseEnvelope(
      CITY_TUTOR_LANE_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent stations / claim / NFT combat (failure)", () => {
    const markers = cityScarceStationMarkers();
    expect(markers.length).toBeGreaterThan(0);
    expect(new Set(markers.map((m) => m.type)).has("tutor_hall" as never)).toBe(
      false,
    );
    expect(CITY_TUTOR_LANE_ATMOSPHERE_CUE.hazeWidth).toBeLessThanOrEqual(
      CITY_TUTOR_LANE_LANDMARK_CUE.stripWidth,
    );
    expect(CITY_TUTOR_LANE_ATMOSPHERE_CUE.hazeDepth).toBeLessThanOrEqual(
      CITY_TUTOR_LANE_LANDMARK_CUE.stripDepth,
    );
    expect(cityTutorLaneAtmosphereEmissiveIntensity(2)).toBe(
      CITY_TUTOR_LANE_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(cityTutorLaneAtmosphereEmissiveIntensity(-1)).toBe(
      CITY_TUTOR_LANE_ATMOSPHERE_CUE.intensityBase,
    );
    expect(cityTutorLaneAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_TUTOR_LANE_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(CITY_TUTOR_LANE_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_TUTOR_LANE_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|recipe|xp|damage|claim/i,
    );
  });
});
