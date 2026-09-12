import { describe, expect, it } from "vitest";
import {
  EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE,
  EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE,
  EMPTY_HOMESTEAD_PATH_CUE,
  HOMESTEAD_YARD_VISUAL,
  LIVED_HOMESTEAD_PATH_CUE,
  PLAYER_LAND_BUILDINGS,
  emptyHomesteadPathAtmosphereCue,
  emptyHomesteadPathAtmosphereEmissiveIntensity,
  emptyHomesteadPathAtmosphereHazeOpacity,
  emptyHomesteadPathAtmospherePulseEnvelope,
  emptyHomesteadPathAtmosphereVsLivedPathContrast,
  emptyHomesteadPathAtmosphereVsMeadowLandmarkContrast,
  emptyHomesteadPathAtmosphereVsPathCueContrast,
  emptyHomesteadPathCue,
  homesteadYardAtmosphereMode,
} from "@game/shared";

/**
 * PL200.2 — Empty-homestead path soft atmosphere leftover.
 * Choice: quiet cool pulsing path mist over empty-yard path/cross while empty
 * (complements meadow landmark PL178.2 + empty path cue PL154.1; layouts SoT).
 * Path cue emissive stays identity — distinct wider/slower/quieter leftover mist.
 */
describe("CityLands PL200.2 empty-homestead path soft atmosphere leftover", () => {
  it("pulses quiet cool path mist while yard empty (happy)", () => {
    expect(homesteadYardAtmosphereMode(PLAYER_LAND_BUILDINGS)).toBe("empty");
    const cue = emptyHomesteadPathAtmosphereCue("empty");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(
      EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityBase,
    );
    expect(cue.hazeOpacity).toBe(
      EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeOpacityBase,
    );
    expect(cue.hazeWidth).toBe(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeWidth);
    expect(cue.hazeDepth).toBe(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeDepth);
    expect(cue.hazeY).toBe(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeY);

    const peak = emptyHomesteadPathAtmosphereEmissiveIntensity(1);
    const floor = emptyHomesteadPathAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = emptyHomesteadPathAtmosphereHazeOpacity(1);
    const hazeFloor = emptyHomesteadPathAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);

    expect(emptyHomesteadPathCue("empty").show).toBe(true);
  });

  it("stays quiet once lived; mist ≠ path cue / meadow / lived path (edge)", () => {
    expect(emptyHomesteadPathAtmosphereCue("lived").show).toBe(false);
    expect(emptyHomesteadPathAtmosphereCue("lived").intensity).toBe(0);
    expect(emptyHomesteadPathAtmosphereCue("lived").hazeOpacity).toBe(0);

    expect(emptyHomesteadPathAtmosphereVsPathCueContrast()).toBeGreaterThan(0);
    expect(
      emptyHomesteadPathAtmosphereVsMeadowLandmarkContrast(),
    ).toBeGreaterThan(0);
    expect(emptyHomesteadPathAtmosphereVsLivedPathContrast()).toBeGreaterThan(
      0,
    );
    expect(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EMPTY_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );

    // Wider / slower / quieter leftover mist vs empty path cue + meadow landmark.
    expect(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      EMPTY_HOMESTEAD_PATH_CUE.pulsePeriodMs,
    );
    expect(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      EMPTY_HOMESTEAD_PATH_CUE.intensityPeak,
    );
    expect(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeY).toBeLessThan(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.hazeY,
    );

    const low = emptyHomesteadPathAtmospherePulseEnvelope(0);
    const mid = emptyHomesteadPathAtmospherePulseEnvelope(
      EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent layouts / NFT combat (failure)", () => {
    expect(PLAYER_LAND_BUILDINGS.some((b) => b.type === "build_board")).toBe(
      false,
    );
    expect(HOMESTEAD_YARD_VISUAL.empty.pathColor.length).toBeGreaterThan(0);

    expect(emptyHomesteadPathAtmosphereEmissiveIntensity(2)).toBe(
      EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(emptyHomesteadPathAtmosphereEmissiveIntensity(-1)).toBe(
      EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityBase,
    );
    expect(emptyHomesteadPathAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(
      EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeOpacityPeak,
    ).toBeLessThanOrEqual(1);
    expect(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeWidth).toBeLessThanOrEqual(14);
    expect(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeDepth).toBeLessThanOrEqual(16);
    expect(String(EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
