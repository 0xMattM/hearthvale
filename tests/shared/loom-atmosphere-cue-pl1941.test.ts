import { describe, expect, it } from "vitest";
import {
  CITY_LOOM_LANDMARK_CUE,
  KITCHEN_ATMOSPHERE_CUE,
  LOOM_ATMOSPHERE_CUE,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  loomAtmosphereCue,
  loomAtmosphereEmissiveIntensity,
  loomAtmosphereHazeOpacity,
  loomAtmospherePulseEnvelope,
  loomAtmosphereVsCityLandmarkContrast,
  loomAtmosphereVsWorkingContrast,
} from "@game/shared";

/**
 * PL194.1 — Loom soft atmosphere leftover.
 * Choice: quiet warm pulsing thread mist over existing loom on player land
 * (complements Free/Busy + craft working + City warm thread landmark PL169.2; recipes SoT).
 * City kinship covered by warm landmark alone — distinct thread-dust leftover, not stack.
 */
describe("CityLands PL194.1 loom soft atmosphere leftover", () => {
  it("pulses quiet warm thread mist on player land (happy)", () => {
    const cue = loomAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      LOOM_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(LOOM_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(LOOM_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(LOOM_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(LOOM_ATMOSPHERE_CUE.hazeY);

    const peak = loomAtmosphereEmissiveIntensity(1);
    const floor = loomAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(LOOM_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(LOOM_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = loomAtmosphereHazeOpacity(1);
    const hazeFloor = loomAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; mist ≠ City landmark / working / kitchen (edge)", () => {
    expect(loomAtmosphereCue("city").show).toBe(false);
    expect(loomAtmosphereCue("explore").show).toBe(false);
    expect(loomAtmosphereCue("warrior").show).toBe(false);
    expect(loomAtmosphereCue(null).show).toBe(false);
    expect(loomAtmosphereCue("city").intensity).toBe(0);

    expect(loomAtmosphereVsCityLandmarkContrast()).toBeGreaterThan(0);
    expect(loomAtmosphereVsWorkingContrast()).toBeGreaterThan(0);
    expect(LOOM_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_LOOM_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(LOOM_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );
    expect(LOOM_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      KITCHEN_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );

    expect(LOOM_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_LOOM_LANDMARK_CUE.hazeRadius,
    );
    expect(LOOM_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_LOOM_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(LOOM_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_LOOM_LANDMARK_CUE.intensityPeak,
    );
    expect(LOOM_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );

    const low = loomAtmospherePulseEnvelope(0);
    const mid = loomAtmospherePulseEnvelope(
      LOOM_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent recipes or NFT combat (failure)", () => {
    const loomRecipes = RECIPES.filter((r) => r.station === "loom");
    expect(loomRecipes.some((r) => r.id === "weave_cloth")).toBe(true);
    expect(loomRecipes.find((r) => r.id === "weave_cloth")?.output).toEqual({
      itemId: "cloth",
      qty: 1,
    });

    expect(loomAtmosphereEmissiveIntensity(2)).toBe(
      LOOM_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(loomAtmosphereEmissiveIntensity(-1)).toBe(
      LOOM_ATMOSPHERE_CUE.intensityBase,
    );
    expect(loomAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(LOOM_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(LOOM_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(LOOM_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
