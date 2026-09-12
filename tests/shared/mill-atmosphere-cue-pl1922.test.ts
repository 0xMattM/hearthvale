import { describe, expect, it } from "vitest";
import {
  CITY_MILL_LANDMARK_CUE,
  MILL_ATMOSPHERE_CUE,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  millAtmosphereCue,
  millAtmosphereEmissiveIntensity,
  millAtmosphereHazeOpacity,
  millAtmospherePulseEnvelope,
  millAtmosphereVsCityLandmarkContrast,
  millAtmosphereVsWorkingContrast,
} from "@game/shared";

/**
 * PL192.2 — Mill soft atmosphere leftover.
 * Choice: quiet warm pulsing grain mist over existing mill on player land
 * (complements Free/Busy + craft working + City cool landmark PL173.2; recipes SoT).
 * City kinship covered by cool landmark alone — distinct warm leftover, not stack.
 */
describe("CityLands PL192.2 mill soft atmosphere leftover", () => {
  it("pulses quiet warm grain mist on player land (happy)", () => {
    const cue = millAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      MILL_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(MILL_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(MILL_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(MILL_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(MILL_ATMOSPHERE_CUE.hazeY);

    const peak = millAtmosphereEmissiveIntensity(1);
    const floor = millAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(MILL_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(MILL_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = millAtmosphereHazeOpacity(1);
    const hazeFloor = millAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; mist ≠ City landmark / working (edge)", () => {
    expect(millAtmosphereCue("city").show).toBe(false);
    expect(millAtmosphereCue("explore").show).toBe(false);
    expect(millAtmosphereCue("warrior").show).toBe(false);
    expect(millAtmosphereCue(null).show).toBe(false);
    expect(millAtmosphereCue("city").intensity).toBe(0);

    expect(millAtmosphereVsCityLandmarkContrast()).toBeGreaterThan(0);
    expect(millAtmosphereVsWorkingContrast()).toBeGreaterThan(0);
    expect(MILL_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_MILL_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(MILL_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );

    expect(MILL_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_MILL_LANDMARK_CUE.hazeRadius,
    );
    expect(MILL_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_MILL_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(MILL_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_MILL_LANDMARK_CUE.intensityPeak,
    );
    expect(MILL_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );

    const low = millAtmospherePulseEnvelope(0);
    const mid = millAtmospherePulseEnvelope(
      MILL_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent recipes or NFT combat (failure)", () => {
    const millRecipes = RECIPES.filter((r) => r.station === "mill");
    expect(millRecipes.some((r) => r.id === "mill_flour")).toBe(true);
    expect(millRecipes.find((r) => r.id === "mill_flour")?.output).toEqual({
      itemId: "flour",
      qty: 1,
    });

    expect(millAtmosphereEmissiveIntensity(2)).toBe(
      MILL_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(millAtmosphereEmissiveIntensity(-1)).toBe(
      MILL_ATMOSPHERE_CUE.intensityBase,
    );
    expect(millAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(MILL_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(MILL_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(MILL_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
