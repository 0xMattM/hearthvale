import { describe, expect, it } from "vitest";
import {
  CITY_WORKSHOP_LANDMARK_CUE,
  FORGE_ATMOSPHERE_CUE,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  WORKSHOP_ATMOSPHERE_CUE,
  workshopAtmosphereCue,
  workshopAtmosphereEmissiveIntensity,
  workshopAtmosphereHazeOpacity,
  workshopAtmospherePulseEnvelope,
  workshopAtmosphereVsCityLandmarkContrast,
  workshopAtmosphereVsWorkingContrast,
} from "@game/shared";

/**
 * PL196.1 — Workshop soft atmosphere leftover.
 * Choice: quiet warm pulsing deep timber mist over existing workshop on player land
 * (complements Free/Busy + craft working + City warm timber landmark PL172.2; recipes SoT).
 * City kinship covered by warm landmark alone — distinct deep timber leftover, not stack.
 */
describe("CityLands PL196.1 workshop soft atmosphere leftover", () => {
  it("pulses quiet warm timber mist on player land (happy)", () => {
    const cue = workshopAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      WORKSHOP_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(WORKSHOP_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(WORKSHOP_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(WORKSHOP_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(WORKSHOP_ATMOSPHERE_CUE.hazeY);

    const peak = workshopAtmosphereEmissiveIntensity(1);
    const floor = workshopAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(WORKSHOP_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(WORKSHOP_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = workshopAtmosphereHazeOpacity(1);
    const hazeFloor = workshopAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; mist ≠ City landmark / working / forge (edge)", () => {
    expect(workshopAtmosphereCue("city").show).toBe(false);
    expect(workshopAtmosphereCue("explore").show).toBe(false);
    expect(workshopAtmosphereCue("warrior").show).toBe(false);
    expect(workshopAtmosphereCue(null).show).toBe(false);
    expect(workshopAtmosphereCue("city").intensity).toBe(0);

    expect(workshopAtmosphereVsCityLandmarkContrast()).toBeGreaterThan(0);
    expect(workshopAtmosphereVsWorkingContrast()).toBeGreaterThan(0);
    expect(WORKSHOP_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_WORKSHOP_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(WORKSHOP_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );
    expect(WORKSHOP_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      FORGE_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );

    expect(WORKSHOP_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_WORKSHOP_LANDMARK_CUE.hazeRadius,
    );
    expect(WORKSHOP_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_WORKSHOP_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(WORKSHOP_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_WORKSHOP_LANDMARK_CUE.intensityPeak,
    );
    expect(WORKSHOP_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );

    const low = workshopAtmospherePulseEnvelope(0);
    const mid = workshopAtmospherePulseEnvelope(
      WORKSHOP_ATMOSPHERE_CUE.pulsePeriodMs / 4,
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

    expect(workshopAtmosphereEmissiveIntensity(2)).toBe(
      WORKSHOP_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(workshopAtmosphereEmissiveIntensity(-1)).toBe(
      WORKSHOP_ATMOSPHERE_CUE.intensityBase,
    );
    expect(workshopAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(WORKSHOP_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(WORKSHOP_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(WORKSHOP_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
