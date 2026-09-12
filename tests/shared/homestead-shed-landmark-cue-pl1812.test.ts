import { describe, expect, it } from "vitest";
import {
  EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE,
  HOMESTEAD_SHED_LANDMARK_CUE,
  LIVED_HOMESTEAD_ATMOSPHERE_CUE,
  LIVED_HOMESTEAD_CHIMNEY_CUE,
  LIVED_HOMESTEAD_PATH_CUE,
  homesteadShedLandmarkCue,
  homesteadShedLandmarkEmissiveIntensity,
  homesteadShedLandmarkHazeOpacity,
  homesteadShedLandmarkPulseEnvelope,
  homesteadShedLandmarkVsAtmosphereContrast,
  homesteadShedLandmarkVsChimneyContrast,
  homesteadShedLandmarkVsLivedPathContrast,
} from "@game/shared";

/**
 * PL181.2 — Homestead shed soft landmark leftover.
 * Choice: quiet warm shed footing/haze/emissive on existing shed while lived
 * at home (complements chimney + yard mist; no station invent; empty quiet).
 */
describe("CityLands PL181.2 homestead shed soft landmark leftover", () => {
  it("pulses quiet warm shed footing haze while lived at home (happy)", () => {
    const cue = homesteadShedLandmarkCue("lived", "home");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      HOMESTEAD_SHED_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(HOMESTEAD_SHED_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(HOMESTEAD_SHED_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(HOMESTEAD_SHED_LANDMARK_CUE.hazeRadius);

    const peak = homesteadShedLandmarkEmissiveIntensity(1);
    const floor = homesteadShedLandmarkEmissiveIntensity(0);
    expect(peak).toBe(HOMESTEAD_SHED_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(HOMESTEAD_SHED_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = homesteadShedLandmarkHazeOpacity(1);
    const hazeFloor = homesteadShedLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet on empty / visit; shed ≠ chimney / mist / path (edge)", () => {
    expect(homesteadShedLandmarkCue("empty", "home").show).toBe(false);
    expect(homesteadShedLandmarkCue("lived", "visit").show).toBe(false);
    expect(homesteadShedLandmarkCue("empty", "visit").show).toBe(false);
    expect(homesteadShedLandmarkCue("lived", "visit").intensity).toBe(0);
    expect(homesteadShedLandmarkCue("empty", "home").hazeOpacity).toBe(0);

    expect(homesteadShedLandmarkVsChimneyContrast()).toBeGreaterThan(0);
    expect(homesteadShedLandmarkVsAtmosphereContrast()).toBeGreaterThan(0);
    expect(homesteadShedLandmarkVsLivedPathContrast()).toBeGreaterThan(0);
    expect(HOMESTEAD_SHED_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyEmissive.toLowerCase(),
    );
    expect(HOMESTEAD_SHED_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_SHED_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_SHED_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.emissive.toLowerCase(),
    );

    const low = homesteadShedLandmarkPulseEnvelope(0);
    const mid = homesteadShedLandmarkPulseEnvelope(
      HOMESTEAD_SHED_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent stations or NFT combat (failure)", () => {
    expect(homesteadShedLandmarkEmissiveIntensity(2)).toBe(
      HOMESTEAD_SHED_LANDMARK_CUE.intensityPeak,
    );
    expect(homesteadShedLandmarkEmissiveIntensity(-1)).toBe(
      HOMESTEAD_SHED_LANDMARK_CUE.intensityBase,
    );
    expect(homesteadShedLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(HOMESTEAD_SHED_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(HOMESTEAD_SHED_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(HOMESTEAD_SHED_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|station|recipe/i,
    );
    expect(HOMESTEAD_SHED_LANDMARK_CUE.hazeRadius).toBeLessThanOrEqual(2.5);
  });
});
