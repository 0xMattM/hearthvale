import { describe, expect, it } from "vitest";
import {
  BUILD_BOARD_ATMOSPHERE_CUE,
  HOUSING_DECOR,
  HOUSING_DECOR_ATMOSPHERE_CUE,
  HOUSING_DECOR_LANDMARK_CUE,
  housingDecorAtmosphereCue,
  housingDecorAtmosphereEmissiveIntensity,
  housingDecorAtmosphereHazeOpacity,
  housingDecorAtmospherePulseEnvelope,
  housingDecorAtmosphereVsBuildBoardAtmosphereContrast,
  housingDecorAtmosphereVsLandmarkContrast,
  housingDecorAtmosphereVsPlaceFlashContrast,
  housingDecorAtmosphereVsWalkUpTipContrast,
} from "@game/shared";

/**
 * PL201.1 — Housing-decor soft atmosphere leftover.
 * Choice: quiet warm pulsing rosewood mist over existing decor pads / placed
 * decor while on player land (complements landmark PL176.1 + place flash
 * PL149.2; costs SoT). Landmark stays identity rim — distinct wider/slower/
 * quieter leftover mist (kinship with build-board / workshop leftovers).
 */
describe("CityLands PL201.1 housing-decor soft atmosphere leftover", () => {
  it("pulses quiet warm rosewood mist on player-land housing decor (happy)", () => {
    const cue = housingDecorAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      HOUSING_DECOR_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(HOUSING_DECOR_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(HOUSING_DECOR_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(HOUSING_DECOR_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(HOUSING_DECOR_ATMOSPHERE_CUE.hazeY);

    const peak = housingDecorAtmosphereEmissiveIntensity(1);
    const floor = housingDecorAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(HOUSING_DECOR_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(HOUSING_DECOR_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = housingDecorAtmosphereHazeOpacity(1);
    const hazeFloor = housingDecorAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);

    // Landmark rim still shows — leftover mist stacks beside it.
    expect(housingDecorAtmosphereCue("player_land").show).toBe(true);
  });

  it("stays quiet off player land; mist ≠ landmark / tip / place / board (edge)", () => {
    expect(housingDecorAtmosphereCue("city").show).toBe(false);
    expect(housingDecorAtmosphereCue("explore").show).toBe(false);
    expect(housingDecorAtmosphereCue("warrior").show).toBe(false);
    expect(housingDecorAtmosphereCue(null).show).toBe(false);
    expect(housingDecorAtmosphereCue("").show).toBe(false);
    expect(housingDecorAtmosphereCue("city").intensity).toBe(0);
    expect(housingDecorAtmosphereCue("city").hazeOpacity).toBe(0);
    // Reason: legacy starter alias still maps to player land.
    expect(housingDecorAtmosphereCue("starter").show).toBe(true);

    expect(housingDecorAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(housingDecorAtmosphereVsWalkUpTipContrast()).toBeGreaterThan(0);
    expect(housingDecorAtmosphereVsPlaceFlashContrast()).toBeGreaterThan(0);
    expect(
      housingDecorAtmosphereVsBuildBoardAtmosphereContrast(),
    ).toBeGreaterThan(0);
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      HOUSING_DECOR_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      "#c4b07a",
    );
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      "#a8786c",
    );
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      BUILD_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );

    // Wider / slower / quieter leftover mist vs landmark disc.
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      HOUSING_DECOR_LANDMARK_CUE.hazeRadius,
    );
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      HOUSING_DECOR_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      HOUSING_DECOR_LANDMARK_CUE.intensityPeak,
    );
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.hazeY).toBeGreaterThan(0.01);

    const low = housingDecorAtmospherePulseEnvelope(0);
    const mid = housingDecorAtmospherePulseEnvelope(
      HOUSING_DECOR_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent decor costs or NFT combat (failure)", () => {
    expect(HOUSING_DECOR.planter.coinCost).toBe(12);
    expect(HOUSING_DECOR.banner.coinCost).toBe(18);
    expect(housingDecorAtmosphereEmissiveIntensity(2)).toBe(
      HOUSING_DECOR_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(housingDecorAtmosphereEmissiveIntensity(-1)).toBe(
      HOUSING_DECOR_ATMOSPHERE_CUE.intensityBase,
    );
    expect(housingDecorAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(HOUSING_DECOR_ATMOSPHERE_CUE.hazeRadius).toBeLessThanOrEqual(2.5);
    expect(String(HOUSING_DECOR_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
