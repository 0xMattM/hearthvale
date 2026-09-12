import { describe, expect, it } from "vitest";
import {
  EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE,
  LIVED_HOMESTEAD_ATMOSPHERE_CUE,
  LIVED_HOMESTEAD_CHIMNEY_CUE,
  LIVED_HOMESTEAD_PATH_CUE,
  VISIT_LAND_ATMOSPHERE_CUE,
  livedHomesteadAtmosphereCue,
  livedHomesteadAtmosphereEmissiveIntensity,
  livedHomesteadAtmosphereHazeOpacity,
  livedHomesteadAtmospherePulseEnvelope,
  livedHomesteadAtmosphereVsChimneyContrast,
  livedHomesteadAtmosphereVsLivedPathContrast,
  livedHomesteadAtmosphereVsVisitMistContrast,
} from "@game/shared";

/**
 * PL181.1 — Lived homestead soft atmosphere leftover.
 * Choice: quiet warm pulsing hearth mist over the plot while lived at home
 * (complements chimney + lived path; quiet on empty / visit; layouts unchanged).
 */
describe("CityLands PL181.1 lived homestead soft atmosphere leftover", () => {
  it("pulses quiet warm hearth mist while lived at home (happy)", () => {
    const cue = livedHomesteadAtmosphereCue("lived", "home");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(LIVED_HOMESTEAD_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(LIVED_HOMESTEAD_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeWidth).toBe(LIVED_HOMESTEAD_ATMOSPHERE_CUE.hazeWidth);
    expect(cue.hazeDepth).toBe(LIVED_HOMESTEAD_ATMOSPHERE_CUE.hazeDepth);

    const peak = livedHomesteadAtmosphereEmissiveIntensity(1);
    const floor = livedHomesteadAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(LIVED_HOMESTEAD_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(LIVED_HOMESTEAD_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = livedHomesteadAtmosphereHazeOpacity(1);
    const hazeFloor = livedHomesteadAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet on empty / visit; mist ≠ path / chimney / visit cool (edge)", () => {
    expect(livedHomesteadAtmosphereCue("empty", "home").show).toBe(false);
    expect(livedHomesteadAtmosphereCue("lived", "visit").show).toBe(false);
    expect(livedHomesteadAtmosphereCue("empty", "visit").show).toBe(false);
    expect(livedHomesteadAtmosphereCue("lived", "visit").intensity).toBe(0);

    expect(livedHomesteadAtmosphereVsLivedPathContrast()).toBeGreaterThan(0);
    expect(livedHomesteadAtmosphereVsChimneyContrast()).toBeGreaterThan(0);
    expect(livedHomesteadAtmosphereVsVisitMistContrast()).toBeGreaterThan(0);
    expect(LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyEmissive.toLowerCase(),
    );
    expect(LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      VISIT_LAND_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.emissive.toLowerCase(),
    );

    const low = livedHomesteadAtmospherePulseEnvelope(0);
    const mid = livedHomesteadAtmospherePulseEnvelope(
      LIVED_HOMESTEAD_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent layouts / NFT combat (failure)", () => {
    expect(livedHomesteadAtmosphereEmissiveIntensity(2)).toBe(
      LIVED_HOMESTEAD_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(livedHomesteadAtmosphereEmissiveIntensity(-1)).toBe(
      LIVED_HOMESTEAD_ATMOSPHERE_CUE.intensityBase,
    );
    expect(livedHomesteadAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(LIVED_HOMESTEAD_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare/i,
    );
    expect(LIVED_HOMESTEAD_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(LIVED_HOMESTEAD_ATMOSPHERE_CUE.hazeWidth).toBeLessThanOrEqual(18);
    expect(LIVED_HOMESTEAD_ATMOSPHERE_CUE.hazeDepth).toBeLessThanOrEqual(16);
  });
});
