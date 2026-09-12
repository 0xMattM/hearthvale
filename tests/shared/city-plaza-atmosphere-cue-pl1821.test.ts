import { describe, expect, it } from "vitest";
import {
  CITY_HUB_VISUAL,
  CITY_PLAZA_ATMOSPHERE_CUE,
  CITY_PLAZA_LANDMARK_CUE,
  CITY_SCARCE_YARD_ATMOSPHERE_CUE,
  cityPlazaAtmosphereCue,
  cityPlazaAtmosphereEmissiveIntensity,
  cityPlazaAtmosphereHazeOpacity,
  cityPlazaAtmospherePulseEnvelope,
  cityPlazaAtmosphereVsCivicPadContrast,
  cityPlazaAtmosphereVsFountainContrast,
  cityPlazaAtmosphereVsScarceYardMistContrast,
} from "@game/shared";

/**
 * PL182.1 — City plaza soft atmosphere leftover.
 * Choice: quiet cool pulsing mist over existing plaza floor while on City
 * (complements fountain landmark + scarce-yard mist; layouts unchanged).
 */
describe("CityLands PL182.1 city plaza soft atmosphere leftover", () => {
  it("pulses quiet cool plaza mist while on City (happy)", () => {
    const cue = cityPlazaAtmosphereCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_PLAZA_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_PLAZA_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CITY_PLAZA_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeWidth).toBe(CITY_PLAZA_ATMOSPHERE_CUE.hazeWidth);
    expect(cue.hazeDepth).toBe(CITY_PLAZA_ATMOSPHERE_CUE.hazeDepth);
    expect(cue.plazaCenterX).toBe(CITY_PLAZA_ATMOSPHERE_CUE.plazaCenterX);
    expect(cue.plazaCenterZ).toBe(CITY_PLAZA_ATMOSPHERE_CUE.plazaCenterZ);

    const peak = cityPlazaAtmosphereEmissiveIntensity(1);
    const floor = cityPlazaAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(CITY_PLAZA_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(CITY_PLAZA_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityPlazaAtmosphereHazeOpacity(1);
    const hazeFloor = cityPlazaAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; mist ≠ fountain / scarce yard / civic pad (edge)", () => {
    expect(cityPlazaAtmosphereCue("warrior").show).toBe(false);
    expect(cityPlazaAtmosphereCue("explore").show).toBe(false);
    expect(cityPlazaAtmosphereCue("player_land").show).toBe(false);
    expect(cityPlazaAtmosphereCue(null).show).toBe(false);
    expect(cityPlazaAtmosphereCue("").show).toBe(false);
    expect(cityPlazaAtmosphereCue("warrior").intensity).toBe(0);
    expect(cityPlazaAtmosphereCue("warrior").hazeOpacity).toBe(0);

    expect(cityPlazaAtmosphereVsFountainContrast()).toBeGreaterThan(0);
    expect(cityPlazaAtmosphereVsScarceYardMistContrast()).toBeGreaterThan(0);
    expect(cityPlazaAtmosphereVsCivicPadContrast()).toBeGreaterThan(0);
    expect(CITY_PLAZA_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_PLAZA_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(CITY_PLAZA_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.civicPadColor.toLowerCase(),
    );

    const low = cityPlazaAtmospherePulseEnvelope(0);
    const mid = cityPlazaAtmospherePulseEnvelope(
      CITY_PLAZA_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent layouts or NFT combat (failure)", () => {
    expect(CITY_HUB_VISUAL.plazaColor).toBe("#8a9098");
    expect(cityPlazaAtmosphereEmissiveIntensity(2)).toBe(
      CITY_PLAZA_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(cityPlazaAtmosphereEmissiveIntensity(-1)).toBe(
      CITY_PLAZA_ATMOSPHERE_CUE.intensityBase,
    );
    expect(cityPlazaAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_PLAZA_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(CITY_PLAZA_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(CITY_PLAZA_ATMOSPHERE_CUE.hazeWidth).toBeLessThanOrEqual(32);
    expect(CITY_PLAZA_ATMOSPHERE_CUE.hazeDepth).toBeLessThanOrEqual(28);
    expect(String(CITY_PLAZA_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|recipe|xp|damage/i,
    );
  });
});
