import { describe, expect, it } from "vitest";
import {
  CITY_KITCHEN_LANDMARK_CUE,
  FORGE_ATMOSPHERE_CUE,
  KITCHEN_ATMOSPHERE_CUE,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  kitchenAtmosphereCue,
  kitchenAtmosphereEmissiveIntensity,
  kitchenAtmosphereHazeOpacity,
  kitchenAtmospherePulseEnvelope,
  kitchenAtmosphereVsCityLandmarkContrast,
  kitchenAtmosphereVsWorkingContrast,
} from "@game/shared";

/**
 * PL193.2 — Kitchen soft atmosphere leftover.
 * Choice: quiet warm pulsing hearth mist over existing kitchen on player land
 * (complements Free/Busy + craft working + City warm hearth landmark PL174.1; recipes SoT).
 * City kinship covered by warm landmark alone — distinct stew-hearth leftover, not stack.
 */
describe("CityLands PL193.2 kitchen soft atmosphere leftover", () => {
  it("pulses quiet warm hearth mist on player land (happy)", () => {
    const cue = kitchenAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      KITCHEN_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(KITCHEN_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(KITCHEN_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(KITCHEN_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(KITCHEN_ATMOSPHERE_CUE.hazeY);

    const peak = kitchenAtmosphereEmissiveIntensity(1);
    const floor = kitchenAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(KITCHEN_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(KITCHEN_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = kitchenAtmosphereHazeOpacity(1);
    const hazeFloor = kitchenAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; mist ≠ City landmark / working / forge (edge)", () => {
    expect(kitchenAtmosphereCue("city").show).toBe(false);
    expect(kitchenAtmosphereCue("explore").show).toBe(false);
    expect(kitchenAtmosphereCue("warrior").show).toBe(false);
    expect(kitchenAtmosphereCue(null).show).toBe(false);
    expect(kitchenAtmosphereCue("city").intensity).toBe(0);

    expect(kitchenAtmosphereVsCityLandmarkContrast()).toBeGreaterThan(0);
    expect(kitchenAtmosphereVsWorkingContrast()).toBeGreaterThan(0);
    expect(KITCHEN_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_KITCHEN_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(KITCHEN_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );
    expect(KITCHEN_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      FORGE_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );

    expect(KITCHEN_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_KITCHEN_LANDMARK_CUE.hazeRadius,
    );
    expect(KITCHEN_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_KITCHEN_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(KITCHEN_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_KITCHEN_LANDMARK_CUE.intensityPeak,
    );
    expect(KITCHEN_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );

    const low = kitchenAtmospherePulseEnvelope(0);
    const mid = kitchenAtmospherePulseEnvelope(
      KITCHEN_ATMOSPHERE_CUE.pulsePeriodMs / 4,
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

    expect(kitchenAtmosphereEmissiveIntensity(2)).toBe(
      KITCHEN_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(kitchenAtmosphereEmissiveIntensity(-1)).toBe(
      KITCHEN_ATMOSPHERE_CUE.intensityBase,
    );
    expect(kitchenAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(KITCHEN_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(KITCHEN_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(KITCHEN_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
