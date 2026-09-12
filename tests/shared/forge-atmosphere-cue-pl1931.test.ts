import { describe, expect, it } from "vitest";
import {
  CITY_FORGE_LANDMARK_CUE,
  FORGE_ATMOSPHERE_CUE,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  forgeAtmosphereCue,
  forgeAtmosphereEmissiveIntensity,
  forgeAtmosphereHazeOpacity,
  forgeAtmospherePulseEnvelope,
  forgeAtmosphereVsCityLandmarkContrast,
  forgeAtmosphereVsWorkingContrast,
} from "@game/shared";

/**
 * PL193.1 — Forge soft atmosphere leftover.
 * Choice: quiet warm pulsing forge mist over existing forge on player land
 * (complements Free/Busy + craft working + City warm ember landmark PL173.1; recipes SoT).
 * City kinship covered by warm landmark alone — distinct deep coal leftover, not stack.
 */
describe("CityLands PL193.1 forge soft atmosphere leftover", () => {
  it("pulses quiet warm forge mist on player land (happy)", () => {
    const cue = forgeAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      FORGE_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(FORGE_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(FORGE_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(FORGE_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(FORGE_ATMOSPHERE_CUE.hazeY);

    const peak = forgeAtmosphereEmissiveIntensity(1);
    const floor = forgeAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(FORGE_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(FORGE_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = forgeAtmosphereHazeOpacity(1);
    const hazeFloor = forgeAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; mist ≠ City landmark / working (edge)", () => {
    expect(forgeAtmosphereCue("city").show).toBe(false);
    expect(forgeAtmosphereCue("explore").show).toBe(false);
    expect(forgeAtmosphereCue("warrior").show).toBe(false);
    expect(forgeAtmosphereCue(null).show).toBe(false);
    expect(forgeAtmosphereCue("city").intensity).toBe(0);

    expect(forgeAtmosphereVsCityLandmarkContrast()).toBeGreaterThan(0);
    expect(forgeAtmosphereVsWorkingContrast()).toBeGreaterThan(0);
    expect(FORGE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_FORGE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(FORGE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );

    expect(FORGE_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_FORGE_LANDMARK_CUE.hazeRadius,
    );
    expect(FORGE_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_FORGE_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(FORGE_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_FORGE_LANDMARK_CUE.intensityPeak,
    );
    expect(FORGE_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );

    const low = forgeAtmospherePulseEnvelope(0);
    const mid = forgeAtmospherePulseEnvelope(
      FORGE_ATMOSPHERE_CUE.pulsePeriodMs / 4,
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

    expect(forgeAtmosphereEmissiveIntensity(2)).toBe(
      FORGE_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(forgeAtmosphereEmissiveIntensity(-1)).toBe(
      FORGE_ATMOSPHERE_CUE.intensityBase,
    );
    expect(forgeAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(FORGE_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(FORGE_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(FORGE_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
