import { describe, expect, it } from "vitest";
import {
  EMPTY_HOMESTEAD_PATH_CUE,
  HOMESTEAD_FENCE_ATMOSPHERE_CUE,
  HOMESTEAD_FENCE_LANDMARK_CUE,
  HOMESTEAD_YARD_VISUAL,
  HOUSING_DECOR_ATMOSPHERE_CUE,
  LIVED_HOMESTEAD_PATH_CUE,
  homesteadFenceAtmosphereCue,
  homesteadFenceAtmosphereEmissiveIntensity,
  homesteadFenceAtmosphereHazeOpacity,
  homesteadFenceAtmospherePulseEnvelope,
  homesteadFenceAtmosphereVsDecorAtmosphereContrast,
  homesteadFenceAtmosphereVsEmptyPathContrast,
  homesteadFenceAtmosphereVsLandmarkContrast,
  homesteadFenceAtmosphereVsLivedPathContrast,
} from "@game/shared";

/**
 * PL201.2 — Homestead-fence soft atmosphere leftover.
 * Choice: quiet cool pulsing boundary mist over existing fence while on player
 * land (complements fence landmark PL176.2 + path cues; layouts SoT).
 * Landmark stays identity rim — distinct wider/slower/quieter leftover mist
 * (kinship with deed-desk / empty-path cool leftovers).
 */
describe("CityLands PL201.2 homestead-fence soft atmosphere leftover", () => {
  it("pulses quiet cool boundary mist on player-land fence (happy)", () => {
    const cue = homesteadFenceAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      HOMESTEAD_FENCE_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(HOMESTEAD_FENCE_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(
      HOMESTEAD_FENCE_ATMOSPHERE_CUE.hazeOpacityBase,
    );
    expect(cue.hazeRadius).toBe(HOMESTEAD_FENCE_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(HOMESTEAD_FENCE_ATMOSPHERE_CUE.hazeY);

    const peak = homesteadFenceAtmosphereEmissiveIntensity(1);
    const floor = homesteadFenceAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(HOMESTEAD_FENCE_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(HOMESTEAD_FENCE_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = homesteadFenceAtmosphereHazeOpacity(1);
    const hazeFloor = homesteadFenceAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; mist ≠ landmark / path / decor (edge)", () => {
    expect(homesteadFenceAtmosphereCue("city").show).toBe(false);
    expect(homesteadFenceAtmosphereCue("explore").show).toBe(false);
    expect(homesteadFenceAtmosphereCue("warrior").show).toBe(false);
    expect(homesteadFenceAtmosphereCue(null).show).toBe(false);
    expect(homesteadFenceAtmosphereCue("").show).toBe(false);
    expect(homesteadFenceAtmosphereCue("city").intensity).toBe(0);
    expect(homesteadFenceAtmosphereCue("city").hazeOpacity).toBe(0);
    expect(homesteadFenceAtmosphereCue("starter").show).toBe(true);

    expect(homesteadFenceAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(homesteadFenceAtmosphereVsEmptyPathContrast()).toBeGreaterThan(0);
    expect(
      homesteadFenceAtmosphereVsDecorAtmosphereContrast(),
    ).toBeGreaterThan(0);
    expect(homesteadFenceAtmosphereVsLivedPathContrast()).toBeGreaterThan(0);
    expect(HOMESTEAD_FENCE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      HOMESTEAD_FENCE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_FENCE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EMPTY_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_FENCE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      HOUSING_DECOR_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_FENCE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );

    // Wider / slower / quieter leftover mist vs fence landmark disc.
    expect(HOMESTEAD_FENCE_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      HOMESTEAD_FENCE_LANDMARK_CUE.hazeRadius,
    );
    expect(HOMESTEAD_FENCE_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      HOMESTEAD_FENCE_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(HOMESTEAD_FENCE_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      HOMESTEAD_FENCE_LANDMARK_CUE.intensityPeak,
    );
    expect(HOMESTEAD_FENCE_ATMOSPHERE_CUE.hazeY).toBeGreaterThan(0.012);

    const low = homesteadFenceAtmospherePulseEnvelope(0);
    const mid = homesteadFenceAtmospherePulseEnvelope(
      HOMESTEAD_FENCE_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent fence layouts or NFT combat (failure)", () => {
    expect(HOMESTEAD_YARD_VISUAL.empty.fencePostColor).toBeTruthy();
    expect(HOMESTEAD_YARD_VISUAL.lived.fencePostColor).toBeTruthy();
    expect(homesteadFenceAtmosphereEmissiveIntensity(2)).toBe(
      HOMESTEAD_FENCE_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(homesteadFenceAtmosphereEmissiveIntensity(-1)).toBe(
      HOMESTEAD_FENCE_ATMOSPHERE_CUE.intensityBase,
    );
    expect(homesteadFenceAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(
      HOMESTEAD_FENCE_ATMOSPHERE_CUE.hazeOpacityPeak,
    ).toBeLessThanOrEqual(1);
    expect(HOMESTEAD_FENCE_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(HOMESTEAD_FENCE_ATMOSPHERE_CUE.hazeRadius).toBeLessThanOrEqual(2.5);
    expect(String(HOMESTEAD_FENCE_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
