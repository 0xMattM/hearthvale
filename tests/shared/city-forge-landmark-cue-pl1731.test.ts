import { describe, expect, it } from "vitest";
import {
  CITY_FORGE_LANDMARK_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  CITY_WORKSHOP_LANDMARK_CUE,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  cityForgeLandmarkCue,
  cityForgeLandmarkEmissiveIntensity,
  cityForgeLandmarkHazeOpacity,
  cityForgeLandmarkPulseEnvelope,
  cityForgeLandmarkVsFreeStickyContrast,
  cityForgeLandmarkVsWorkshopContrast,
  cityForgeLandmarkVsWorkingContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL173.1 — City forge soft landmark cue leftover.
 * Choice: quiet warm ember haze/emissive on existing city scarce forge
 * while on City (complements craft working cues + Free/Busy pads; recipes unchanged).
 * Continuous landmark on City only; working glow / pads stay their own cues.
 */
describe("CityLands PL173.1 city forge soft landmark cue leftover", () => {
  it("pulses quiet warm ember haze on City scarce forge (happy)", () => {
    const cue = cityForgeLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_FORGE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_FORGE_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_FORGE_LANDMARK_CUE.hazeOpacityBase : 0);
    expect(cue.hazeRadius).toBe(CITY_FORGE_LANDMARK_CUE.hazeRadius);
    expect(CITY_SCARCE_STATION_TYPES).toContain("forge");

    const peak = cityForgeLandmarkEmissiveIntensity(1);
    const floor = cityForgeLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_FORGE_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_FORGE_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityForgeLandmarkHazeOpacity(1);
    const hazeFloor = cityForgeLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; warm ember ≠ working / Free / workshop (edge)", () => {
    expect(cityForgeLandmarkCue("player_land").show).toBe(false);
    expect(cityForgeLandmarkCue("explore").show).toBe(false);
    expect(cityForgeLandmarkCue("warrior").show).toBe(false);
    expect(cityForgeLandmarkCue(null).show).toBe(false);
    expect(cityForgeLandmarkCue("").show).toBe(false);
    expect(cityForgeLandmarkCue("player_land").intensity).toBe(0);
    expect(cityForgeLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityForgeLandmarkVsWorkingContrast()).toBeGreaterThan(0);
    expect(cityForgeLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(cityForgeLandmarkVsWorkshopContrast()).toBeGreaterThan(0);
    expect(CITY_FORGE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );
    expect(CITY_FORGE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_FORGE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_WORKSHOP_LANDMARK_CUE.emissive.toLowerCase(),
    );

    expect(CITY_FORGE_LANDMARK_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );
    expect(CITY_FORGE_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      PROCESS_STATION_WORKING_EMISSIVE.periodMs,
    );

    const low = cityForgeLandmarkPulseEnvelope(0);
    const mid = cityForgeLandmarkPulseEnvelope(
      CITY_FORGE_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent recipes or NFT combat (failure)", () => {
    const forgeRecipes = RECIPES.filter((r) => r.station === "forge");
    expect(forgeRecipes.some((r) => r.id === "smelt_iron_bar")).toBe(true);
    expect(forgeRecipes.find((r) => r.id === "smelt_iron_bar")?.output).toEqual(
      {
        itemId: "iron_bar",
        qty: 1,
      },
    );
    expect(cityForgeLandmarkEmissiveIntensity(2)).toBe(
      CITY_FORGE_LANDMARK_CUE.intensityPeak,
    );
    expect(cityForgeLandmarkEmissiveIntensity(-1)).toBe(
      CITY_FORGE_LANDMARK_CUE.intensityBase,
    );
    expect(cityForgeLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_FORGE_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_FORGE_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(CITY_FORGE_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
