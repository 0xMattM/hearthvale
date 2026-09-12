import { describe, expect, it } from "vitest";
import {
  HOMESTEAD_SHED_ATMOSPHERE_CUE,
  HOMESTEAD_SHED_LANDMARK_CUE,
  HOMESTEAD_YARD_VISUAL,
  HOUSING_DECOR_ATMOSPHERE_CUE,
  LIVED_HOMESTEAD_ATMOSPHERE_CUE,
  LIVED_HOMESTEAD_CHIMNEY_CUE,
  LIVED_HOMESTEAD_PATH_CUE,
  homesteadShedAtmosphereCue,
  homesteadShedAtmosphereEmissiveIntensity,
  homesteadShedAtmosphereHazeOpacity,
  homesteadShedAtmospherePulseEnvelope,
  homesteadShedAtmosphereVsChimneyContrast,
  homesteadShedAtmosphereVsDecorAtmosphereContrast,
  homesteadShedAtmosphereVsLandmarkContrast,
  homesteadShedAtmosphereVsLivedPathContrast,
  homesteadShedAtmosphereVsYardMistContrast,
  homesteadShedLandmarkCue,
} from "@game/shared";

/**
 * PL202.1 — Homestead-shed soft atmosphere leftover.
 * Choice: quiet warm pulsing barn mist over existing lived shed while yard
 * lived at home (complements shed landmark PL181.2 + chimney + yard mist;
 * layouts SoT). Landmark stays identity rim — distinct wider/slower/quieter
 * leftover mist (kinship with housing-decor / fence / build-board leftovers).
 */
describe("CityLands PL202.1 homestead-shed soft atmosphere leftover", () => {
  it("pulses quiet warm barn mist while lived at home (happy)", () => {
    const cue = homesteadShedAtmosphereCue("lived", "home");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(HOMESTEAD_SHED_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(HOMESTEAD_SHED_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(HOMESTEAD_SHED_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(HOMESTEAD_SHED_ATMOSPHERE_CUE.hazeY);

    const peak = homesteadShedAtmosphereEmissiveIntensity(1);
    const floor = homesteadShedAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(HOMESTEAD_SHED_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(HOMESTEAD_SHED_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = homesteadShedAtmosphereHazeOpacity(1);
    const hazeFloor = homesteadShedAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);

    // Landmark rim still shows — leftover mist stacks beside it.
    expect(homesteadShedLandmarkCue("lived", "home").show).toBe(true);
  });

  it("stays quiet on empty / visit; mist ≠ landmark / chimney / yard / path / decor (edge)", () => {
    expect(homesteadShedAtmosphereCue("empty", "home").show).toBe(false);
    expect(homesteadShedAtmosphereCue("lived", "visit").show).toBe(false);
    expect(homesteadShedAtmosphereCue("empty", "visit").show).toBe(false);
    expect(homesteadShedAtmosphereCue("lived", "visit").intensity).toBe(0);
    expect(homesteadShedAtmosphereCue("empty", "home").hazeOpacity).toBe(0);

    expect(homesteadShedAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(homesteadShedAtmosphereVsChimneyContrast()).toBeGreaterThan(0);
    expect(homesteadShedAtmosphereVsYardMistContrast()).toBeGreaterThan(0);
    expect(homesteadShedAtmosphereVsLivedPathContrast()).toBeGreaterThan(0);
    expect(
      homesteadShedAtmosphereVsDecorAtmosphereContrast(),
    ).toBeGreaterThan(0);
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      HOMESTEAD_SHED_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyEmissive.toLowerCase(),
    );
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      HOUSING_DECOR_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );

    // Wider / slower / quieter leftover mist vs shed landmark disc.
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      HOMESTEAD_SHED_LANDMARK_CUE.hazeRadius,
    );
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      HOMESTEAD_SHED_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      HOMESTEAD_SHED_LANDMARK_CUE.intensityPeak,
    );
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.hazeY).toBeGreaterThan(0.02);

    const low = homesteadShedAtmospherePulseEnvelope(0);
    const mid = homesteadShedAtmospherePulseEnvelope(
      HOMESTEAD_SHED_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent shed layouts or NFT combat (failure)", () => {
    expect(HOMESTEAD_YARD_VISUAL.lived.fencePostColor).toBeTruthy();
    expect(homesteadShedAtmosphereEmissiveIntensity(2)).toBe(
      HOMESTEAD_SHED_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(homesteadShedAtmosphereEmissiveIntensity(-1)).toBe(
      HOMESTEAD_SHED_ATMOSPHERE_CUE.intensityBase,
    );
    expect(homesteadShedAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(HOMESTEAD_SHED_ATMOSPHERE_CUE.hazeRadius).toBeLessThanOrEqual(2.5);
    expect(String(HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield|station/i,
    );
  });
});
