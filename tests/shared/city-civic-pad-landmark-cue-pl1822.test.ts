import { describe, expect, it } from "vitest";
import {
  CITY_CIVIC_PAD_LANDMARK_CUE,
  CITY_DEED_DESK_LANDMARK_CUE,
  CITY_HUB_VISUAL,
  CITY_PLAZA_ATMOSPHERE_CUE,
  CITY_PLAZA_LANDMARK_CUE,
  cityCivicPadLandmarkCue,
  cityCivicPadLandmarkEmissiveIntensity,
  cityCivicPadLandmarkHazeOpacity,
  cityCivicPadLandmarkPulseEnvelope,
  cityCivicPadLandmarkVsDeedDeskContrast,
  cityCivicPadLandmarkVsFountainContrast,
  cityCivicPadLandmarkVsPlazaMistContrast,
} from "@game/shared";

/**
 * PL182.2 — City civic-pad soft landmark leftover.
 * Choice: quiet cool civic haze/emissive on existing civic/service pads while
 * on City (complements plaza mist + deed desk; layouts unchanged).
 */
describe("CityLands PL182.2 city civic-pad soft landmark leftover", () => {
  it("pulses quiet cool civic pad haze while on City (happy)", () => {
    const cue = cityCivicPadLandmarkCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_CIVIC_PAD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_CIVIC_PAD_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CITY_CIVIC_PAD_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeInset).toBe(CITY_CIVIC_PAD_LANDMARK_CUE.hazeInset);
    expect(cue.hazeY).toBe(CITY_CIVIC_PAD_LANDMARK_CUE.hazeY);

    const peak = cityCivicPadLandmarkEmissiveIntensity(1);
    const floor = cityCivicPadLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_CIVIC_PAD_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_CIVIC_PAD_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityCivicPadLandmarkHazeOpacity(1);
    const hazeFloor = cityCivicPadLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; pad ≠ plaza mist / deed / fountain (edge)", () => {
    expect(cityCivicPadLandmarkCue("warrior").show).toBe(false);
    expect(cityCivicPadLandmarkCue("explore").show).toBe(false);
    expect(cityCivicPadLandmarkCue("player_land").show).toBe(false);
    expect(cityCivicPadLandmarkCue(null).show).toBe(false);
    expect(cityCivicPadLandmarkCue("").show).toBe(false);
    expect(cityCivicPadLandmarkCue("warrior").intensity).toBe(0);
    expect(cityCivicPadLandmarkCue("warrior").hazeOpacity).toBe(0);

    expect(cityCivicPadLandmarkVsPlazaMistContrast()).toBeGreaterThan(0);
    expect(cityCivicPadLandmarkVsDeedDeskContrast()).toBeGreaterThan(0);
    expect(cityCivicPadLandmarkVsFountainContrast()).toBeGreaterThan(0);
    expect(CITY_CIVIC_PAD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(CITY_CIVIC_PAD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_DEED_DESK_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_CIVIC_PAD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_CIVIC_PAD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.civicPadColor.toLowerCase(),
    );

    const low = cityCivicPadLandmarkPulseEnvelope(0);
    const mid = cityCivicPadLandmarkPulseEnvelope(
      CITY_CIVIC_PAD_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent layouts or NFT combat (failure)", () => {
    expect(CITY_HUB_VISUAL.civicPadColor).toBe("#6a7380");
    expect(cityCivicPadLandmarkEmissiveIntensity(2)).toBe(
      CITY_CIVIC_PAD_LANDMARK_CUE.intensityPeak,
    );
    expect(cityCivicPadLandmarkEmissiveIntensity(-1)).toBe(
      CITY_CIVIC_PAD_LANDMARK_CUE.intensityBase,
    );
    expect(cityCivicPadLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_CIVIC_PAD_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(CITY_CIVIC_PAD_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(CITY_CIVIC_PAD_LANDMARK_CUE.hazeInset).toBeLessThanOrEqual(0.5);
    expect(String(CITY_CIVIC_PAD_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe|xp|damage/i,
    );
  });
});
