import { describe, expect, it } from "vitest";
import {
  CITY_FORGE_LANDMARK_CUE,
  CITY_MILL_LANDMARK_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  cityMillLandmarkCue,
  cityMillLandmarkEmissiveIntensity,
  cityMillLandmarkHazeOpacity,
  cityMillLandmarkPulseEnvelope,
  cityMillLandmarkVsForgeContrast,
  cityMillLandmarkVsFreeStickyContrast,
  cityMillLandmarkVsWorkingContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL173.2 — City mill soft landmark cue leftover.
 * Choice: quiet cool grain haze/emissive on existing city scarce mill
 * while on City (complements craft working cues + Free/Busy pads; recipes unchanged).
 * Continuous landmark on City only; working glow / pads stay their own cues.
 */
describe("CityLands PL173.2 city mill soft landmark cue leftover", () => {
  it("pulses quiet cool grain haze on City scarce mill (happy)", () => {
    const cue = cityMillLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_MILL_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_MILL_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_MILL_LANDMARK_CUE.hazeOpacityBase : 0);
    expect(cue.hazeRadius).toBe(CITY_MILL_LANDMARK_CUE.hazeRadius);
    expect(CITY_SCARCE_STATION_TYPES).toContain("mill");

    const peak = cityMillLandmarkEmissiveIntensity(1);
    const floor = cityMillLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_MILL_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_MILL_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityMillLandmarkHazeOpacity(1);
    const hazeFloor = cityMillLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; cool grain ≠ working / Free / forge (edge)", () => {
    expect(cityMillLandmarkCue("player_land").show).toBe(false);
    expect(cityMillLandmarkCue("explore").show).toBe(false);
    expect(cityMillLandmarkCue("warrior").show).toBe(false);
    expect(cityMillLandmarkCue(null).show).toBe(false);
    expect(cityMillLandmarkCue("").show).toBe(false);
    expect(cityMillLandmarkCue("player_land").intensity).toBe(0);
    expect(cityMillLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityMillLandmarkVsWorkingContrast()).toBeGreaterThan(0);
    expect(cityMillLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(cityMillLandmarkVsForgeContrast()).toBeGreaterThan(0);
    expect(CITY_MILL_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );
    expect(CITY_MILL_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_MILL_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_FORGE_LANDMARK_CUE.emissive.toLowerCase(),
    );

    expect(CITY_MILL_LANDMARK_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );
    expect(CITY_MILL_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      PROCESS_STATION_WORKING_EMISSIVE.periodMs,
    );

    const low = cityMillLandmarkPulseEnvelope(0);
    const mid = cityMillLandmarkPulseEnvelope(
      CITY_MILL_LANDMARK_CUE.pulsePeriodMs / 4,
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
    expect(cityMillLandmarkEmissiveIntensity(2)).toBe(
      CITY_MILL_LANDMARK_CUE.intensityPeak,
    );
    expect(cityMillLandmarkEmissiveIntensity(-1)).toBe(
      CITY_MILL_LANDMARK_CUE.intensityBase,
    );
    expect(cityMillLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_MILL_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_MILL_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(CITY_MILL_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
