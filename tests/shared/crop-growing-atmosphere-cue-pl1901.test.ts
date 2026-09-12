import { describe, expect, it } from "vitest";
import {
  CITY_CROP_PLOT_LANDMARK_CUE,
  CROP_GROWING_ATMOSPHERE_CUE,
  CROP_GROWING_SOFT_SWAY,
  CROP_READY_WORLD_PULSE,
  CROPS,
  cropGrowingAtmosphereCue,
  cropGrowingAtmosphereEmissiveIntensity,
  cropGrowingAtmosphereHazeOpacity,
  cropGrowingAtmospherePulseEnvelope,
  cropGrowingAtmosphereVsCityLandmarkContrast,
  cropGrowingAtmosphereVsGrowingSwayContrast,
  cropGrowingAtmosphereVsReadyPulseContrast,
} from "@game/shared";

/**
 * PL190.1 — Crop-growing soft atmosphere leftover.
 * Choice: quiet warm pulsing soil mist over growing (not ready) crop plots on
 * player land (complements growing sway PL121.1 + ready pulse PL12.1; growMs /
 * yields unchanged).
 */
describe("CityLands PL190.1 crop-growing soft atmosphere leftover", () => {
  it("pulses quiet warm soil mist while growing on player land (happy)", () => {
    const cue = cropGrowingAtmosphereCue("player_land", "growing");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CROP_GROWING_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CROP_GROWING_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CROP_GROWING_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(CROP_GROWING_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(CROP_GROWING_ATMOSPHERE_CUE.hazeY);

    const sprout = cropGrowingAtmosphereCue("player_land", "sprout");
    expect(sprout.show).toBe(true);

    const peak = cropGrowingAtmosphereEmissiveIntensity(1);
    const floor = cropGrowingAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(CROP_GROWING_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(CROP_GROWING_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cropGrowingAtmosphereHazeOpacity(1);
    const hazeFloor = cropGrowingAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet empty/ready/off player land; mist ≠ sway / ready / City (edge)", () => {
    expect(cropGrowingAtmosphereCue("player_land", "empty").show).toBe(false);
    expect(cropGrowingAtmosphereCue("player_land", "ready").show).toBe(false);
    expect(cropGrowingAtmosphereCue("city", "growing").show).toBe(false);
    expect(cropGrowingAtmosphereCue("explore", "growing").show).toBe(false);
    expect(cropGrowingAtmosphereCue("warrior", "growing").show).toBe(false);
    expect(cropGrowingAtmosphereCue(null, "growing").show).toBe(false);
    expect(cropGrowingAtmosphereCue("city", "growing").intensity).toBe(0);

    expect(cropGrowingAtmosphereVsGrowingSwayContrast()).toBeGreaterThan(0);
    expect(cropGrowingAtmosphereVsReadyPulseContrast()).toBeGreaterThan(0);
    expect(cropGrowingAtmosphereVsCityLandmarkContrast()).toBeGreaterThan(0);
    expect(CROP_GROWING_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CROP_GROWING_SOFT_SWAY.emissiveColor.toLowerCase(),
    );
    expect(CROP_GROWING_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CROP_READY_WORLD_PULSE.emissiveColor.toLowerCase(),
    );
    expect(CROP_GROWING_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_CROP_PLOT_LANDMARK_CUE.emissive.toLowerCase(),
    );

    expect(CROP_GROWING_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(1.05);
    expect(CROP_GROWING_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CROP_GROWING_SOFT_SWAY.periodMs,
    );
    expect(CROP_GROWING_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CROP_READY_WORLD_PULSE.intensityMax,
    );

    const low = cropGrowingAtmospherePulseEnvelope(0);
    const mid = cropGrowingAtmospherePulseEnvelope(
      CROP_GROWING_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent growMs / yields or NFT combat (failure)", () => {
    expect(CROPS.wheat?.growMs).toBe(180_000);
    expect(CROPS.wheat?.harvestItemId).toBe("wheat");

    expect(cropGrowingAtmosphereEmissiveIntensity(2)).toBe(
      CROP_GROWING_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(cropGrowingAtmosphereEmissiveIntensity(-1)).toBe(
      CROP_GROWING_ATMOSPHERE_CUE.intensityBase,
    );
    expect(cropGrowingAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(CROP_GROWING_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(CROP_GROWING_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(CROP_GROWING_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|yield/i,
    );
  });
});
