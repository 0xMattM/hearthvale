import { describe, expect, it } from "vitest";
import {
  EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE,
  HOMESTEAD_SHED_ATMOSPHERE_CUE,
  HOMESTEAD_YARD_VISUAL,
  LIVED_HOMESTEAD_ATMOSPHERE_CUE,
  LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE,
  LIVED_HOMESTEAD_PATH_CUE,
  livedHomesteadPathAtmosphereCue,
  livedHomesteadPathAtmosphereEmissiveIntensity,
  livedHomesteadPathAtmosphereHazeOpacity,
  livedHomesteadPathAtmospherePulseEnvelope,
  livedHomesteadPathAtmosphereVsEmptyPathAtmosphereContrast,
  livedHomesteadPathAtmosphereVsPathCueContrast,
  livedHomesteadPathAtmosphereVsShedAtmosphereContrast,
  livedHomesteadPathAtmosphereVsYardMistContrast,
  livedHomesteadPathCue,
} from "@game/shared";

/**
 * PL202.2 — Lived-homestead path soft atmosphere leftover.
 * Choice: quiet warm pulsing path mist over lived-yard path/cross while yard
 * lived at home (complements path cue PL142.1 + yard mist PL181.1; layouts SoT).
 * Path cue stays identity emissive — distinct wider/slower/quieter leftover mist
 * (kinship with empty-path atmosphere leftover PL200.2).
 */
describe("CityLands PL202.2 lived-homestead path soft atmosphere leftover", () => {
  it("pulses quiet warm path mist while lived at home (happy)", () => {
    const cue = livedHomesteadPathAtmosphereCue("lived", "home");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(
      LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityBase,
    );
    expect(cue.hazeOpacity).toBe(
      LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeOpacityBase,
    );
    expect(cue.hazeWidth).toBe(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeWidth);
    expect(cue.hazeDepth).toBe(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeDepth);
    expect(cue.hazeY).toBe(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeY);

    const peak = livedHomesteadPathAtmosphereEmissiveIntensity(1);
    const floor = livedHomesteadPathAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = livedHomesteadPathAtmosphereHazeOpacity(1);
    const hazeFloor = livedHomesteadPathAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);

    expect(livedHomesteadPathCue("lived").show).toBe(true);
  });

  it("stays quiet on empty / visit; mist ≠ path cue / yard / shed / empty path (edge)", () => {
    expect(livedHomesteadPathAtmosphereCue("empty", "home").show).toBe(false);
    expect(livedHomesteadPathAtmosphereCue("lived", "visit").show).toBe(false);
    expect(livedHomesteadPathAtmosphereCue("empty", "visit").show).toBe(false);
    expect(livedHomesteadPathAtmosphereCue("lived", "visit").intensity).toBe(0);
    expect(livedHomesteadPathAtmosphereCue("empty", "home").hazeOpacity).toBe(
      0,
    );

    expect(livedHomesteadPathAtmosphereVsPathCueContrast()).toBeGreaterThan(0);
    expect(livedHomesteadPathAtmosphereVsYardMistContrast()).toBeGreaterThan(0);
    expect(
      livedHomesteadPathAtmosphereVsShedAtmosphereContrast(),
    ).toBeGreaterThan(0);
    expect(
      livedHomesteadPathAtmosphereVsEmptyPathAtmosphereContrast(),
    ).toBeGreaterThan(0);
    expect(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );

    // Wider / slower / quieter leftover mist vs lived path cue + yard mist.
    expect(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      LIVED_HOMESTEAD_PATH_CUE.pulsePeriodMs,
    );
    expect(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      LIVED_HOMESTEAD_ATMOSPHERE_CUE.pulsePeriodMs,
    );
    expect(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      LIVED_HOMESTEAD_PATH_CUE.intensityPeak,
    );
    expect(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeY).toBeLessThan(
      LIVED_HOMESTEAD_ATMOSPHERE_CUE.hazeY,
    );

    const low = livedHomesteadPathAtmospherePulseEnvelope(0);
    const mid = livedHomesteadPathAtmospherePulseEnvelope(
      LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent layouts / NFT combat (failure)", () => {
    expect(HOMESTEAD_YARD_VISUAL.lived.pathColor.length).toBeGreaterThan(0);

    expect(livedHomesteadPathAtmosphereEmissiveIntensity(2)).toBe(
      LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(livedHomesteadPathAtmosphereEmissiveIntensity(-1)).toBe(
      LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityBase,
    );
    expect(livedHomesteadPathAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(
      LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeOpacityPeak,
    ).toBeLessThanOrEqual(1);
    expect(
      LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.intensityPeak,
    ).toBeLessThanOrEqual(1);
    expect(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeWidth).toBeLessThanOrEqual(
      14,
    );
    expect(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.hazeDepth).toBeLessThanOrEqual(
      16,
    );
    expect(String(LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
