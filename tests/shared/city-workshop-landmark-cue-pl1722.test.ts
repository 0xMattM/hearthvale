import { describe, expect, it } from "vitest";
import {
  CITY_LOOM_LANDMARK_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  CITY_WORKSHOP_LANDMARK_CUE,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  cityWorkshopLandmarkCue,
  cityWorkshopLandmarkEmissiveIntensity,
  cityWorkshopLandmarkHazeOpacity,
  cityWorkshopLandmarkPulseEnvelope,
  cityWorkshopLandmarkVsFreeStickyContrast,
  cityWorkshopLandmarkVsLoomContrast,
  cityWorkshopLandmarkVsWorkingContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL172.2 — City workshop soft landmark cue leftover.
 * Choice: quiet warm timber haze/emissive on existing city scarce workshop
 * while on City (complements craft working cues + Free/Busy pads; recipes unchanged).
 * Continuous landmark on City only; working glow / pads stay their own cues.
 */
describe("CityLands PL172.2 city workshop soft landmark cue leftover", () => {
  it("pulses quiet warm timber haze on City scarce workshop (happy)", () => {
    const cue = cityWorkshopLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_WORKSHOP_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_WORKSHOP_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_WORKSHOP_LANDMARK_CUE.hazeOpacityBase : 0);
    expect(cue.hazeRadius).toBe(CITY_WORKSHOP_LANDMARK_CUE.hazeRadius);
    expect(CITY_SCARCE_STATION_TYPES).toContain("workshop");

    const peak = cityWorkshopLandmarkEmissiveIntensity(1);
    const floor = cityWorkshopLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_WORKSHOP_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_WORKSHOP_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityWorkshopLandmarkHazeOpacity(1);
    const hazeFloor = cityWorkshopLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; warm timber ≠ working / Free / loom (edge)", () => {
    expect(cityWorkshopLandmarkCue("player_land").show).toBe(false);
    expect(cityWorkshopLandmarkCue("explore").show).toBe(false);
    expect(cityWorkshopLandmarkCue("warrior").show).toBe(false);
    expect(cityWorkshopLandmarkCue(null).show).toBe(false);
    expect(cityWorkshopLandmarkCue("").show).toBe(false);
    expect(cityWorkshopLandmarkCue("player_land").intensity).toBe(0);
    expect(cityWorkshopLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityWorkshopLandmarkVsWorkingContrast()).toBeGreaterThan(0);
    expect(cityWorkshopLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(cityWorkshopLandmarkVsLoomContrast()).toBeGreaterThan(0);
    expect(CITY_WORKSHOP_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );
    expect(CITY_WORKSHOP_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_WORKSHOP_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_LOOM_LANDMARK_CUE.emissive.toLowerCase(),
    );

    expect(CITY_WORKSHOP_LANDMARK_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );
    expect(CITY_WORKSHOP_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      PROCESS_STATION_WORKING_EMISSIVE.periodMs,
    );

    const low = cityWorkshopLandmarkPulseEnvelope(0);
    const mid = cityWorkshopLandmarkPulseEnvelope(
      CITY_WORKSHOP_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent recipes or NFT combat (failure)", () => {
    const workshopRecipes = RECIPES.filter((r) => r.station === "workshop");
    expect(workshopRecipes.some((r) => r.id === "saw_planks")).toBe(true);
    expect(workshopRecipes.find((r) => r.id === "saw_planks")?.output).toEqual({
      itemId: "plank",
      qty: 1,
    });
    expect(cityWorkshopLandmarkEmissiveIntensity(2)).toBe(
      CITY_WORKSHOP_LANDMARK_CUE.intensityPeak,
    );
    expect(cityWorkshopLandmarkEmissiveIntensity(-1)).toBe(
      CITY_WORKSHOP_LANDMARK_CUE.intensityBase,
    );
    expect(cityWorkshopLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_WORKSHOP_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_WORKSHOP_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(CITY_WORKSHOP_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
