import { describe, expect, it } from "vitest";
import {
  CITY_FORGE_LANDMARK_CUE,
  CITY_KITCHEN_LANDMARK_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  cityKitchenLandmarkCue,
  cityKitchenLandmarkEmissiveIntensity,
  cityKitchenLandmarkHazeOpacity,
  cityKitchenLandmarkPulseEnvelope,
  cityKitchenLandmarkVsForgeContrast,
  cityKitchenLandmarkVsFreeStickyContrast,
  cityKitchenLandmarkVsWorkingContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL174.1 — City kitchen soft landmark cue leftover.
 * Choice: quiet warm hearth haze/emissive on existing city scarce kitchen
 * while on City (complements craft working cues + Free/Busy pads; recipes unchanged).
 * Continuous landmark on City only; working glow / pads stay their own cues.
 */
describe("CityLands PL174.1 city kitchen soft landmark cue leftover", () => {
  it("pulses quiet warm hearth haze on City scarce kitchen (happy)", () => {
    const cue = cityKitchenLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_KITCHEN_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_KITCHEN_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_KITCHEN_LANDMARK_CUE.hazeOpacityBase : 0);
    expect(cue.hazeRadius).toBe(CITY_KITCHEN_LANDMARK_CUE.hazeRadius);
    expect(CITY_SCARCE_STATION_TYPES).toContain("kitchen");

    const peak = cityKitchenLandmarkEmissiveIntensity(1);
    const floor = cityKitchenLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_KITCHEN_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_KITCHEN_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityKitchenLandmarkHazeOpacity(1);
    const hazeFloor = cityKitchenLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; warm hearth ≠ working / Free / forge (edge)", () => {
    expect(cityKitchenLandmarkCue("player_land").show).toBe(false);
    expect(cityKitchenLandmarkCue("explore").show).toBe(false);
    expect(cityKitchenLandmarkCue("warrior").show).toBe(false);
    expect(cityKitchenLandmarkCue(null).show).toBe(false);
    expect(cityKitchenLandmarkCue("").show).toBe(false);
    expect(cityKitchenLandmarkCue("player_land").intensity).toBe(0);
    expect(cityKitchenLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityKitchenLandmarkVsWorkingContrast()).toBeGreaterThan(0);
    expect(cityKitchenLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(cityKitchenLandmarkVsForgeContrast()).toBeGreaterThan(0);
    expect(CITY_KITCHEN_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );
    expect(CITY_KITCHEN_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_KITCHEN_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_FORGE_LANDMARK_CUE.emissive.toLowerCase(),
    );

    expect(CITY_KITCHEN_LANDMARK_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );
    expect(CITY_KITCHEN_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      PROCESS_STATION_WORKING_EMISSIVE.periodMs,
    );

    const low = cityKitchenLandmarkPulseEnvelope(0);
    const mid = cityKitchenLandmarkPulseEnvelope(
      CITY_KITCHEN_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent recipes or NFT combat (failure)", () => {
    const kitchenRecipes = RECIPES.filter((r) => r.station === "kitchen");
    expect(kitchenRecipes.some((r) => r.id === "bake_bread")).toBe(true);
    expect(kitchenRecipes.find((r) => r.id === "bake_bread")?.output).toEqual({
      itemId: "bread",
      qty: 1,
    });
    expect(cityKitchenLandmarkEmissiveIntensity(2)).toBe(
      CITY_KITCHEN_LANDMARK_CUE.intensityPeak,
    );
    expect(cityKitchenLandmarkEmissiveIntensity(-1)).toBe(
      CITY_KITCHEN_LANDMARK_CUE.intensityBase,
    );
    expect(cityKitchenLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_KITCHEN_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_KITCHEN_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(CITY_KITCHEN_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
