import { describe, expect, it } from "vitest";
import {
  EXPAND_FIELD_PAD_FLASH,
  EXPAND_PAD_AFFORD_CUE,
  EXPAND_PAD_ATMOSPHERE_CUE,
  EXPAND_PAD_LANDMARK_CUE,
  EXPAND_PAD_SHORT_AFFORD_PULSE,
  SLOT_EXPANSIONS,
  expandPadAtmosphereCue,
  expandPadAtmosphereEmissiveIntensity,
  expandPadAtmosphereHazeOpacity,
  expandPadAtmospherePulseEnvelope,
  expandPadAtmosphereVsFieldFlashContrast,
  expandPadAtmosphereVsLandmarkContrast,
} from "@game/shared";

/**
 * PL196.2 — Expand-pad soft atmosphere leftover.
 * Choice: quiet cool pulsing footing mist over existing expand pads on player land
 * (complements expand flash + unlock cues + warm field-gold landmark PL163.1; costs SoT).
 * Warm landmark stays identity rim — cool footing leftover is distinct, not a second gold disc.
 */
describe("CityLands PL196.2 expand-pad soft atmosphere leftover", () => {
  it("pulses quiet cool footing mist on player land (happy)", () => {
    const cue = expandPadAtmosphereCue("player_land", true);
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      EXPAND_PAD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(EXPAND_PAD_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(EXPAND_PAD_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(EXPAND_PAD_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(EXPAND_PAD_ATMOSPHERE_CUE.hazeY);

    const peak = expandPadAtmosphereEmissiveIntensity(1);
    const floor = expandPadAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(EXPAND_PAD_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(EXPAND_PAD_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = expandPadAtmosphereHazeOpacity(1);
    const hazeFloor = expandPadAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land / hidden; mist ≠ landmark / flash / afford (edge)", () => {
    expect(expandPadAtmosphereCue("city", true).show).toBe(false);
    expect(expandPadAtmosphereCue("explore", true).show).toBe(false);
    expect(expandPadAtmosphereCue("warrior", true).show).toBe(false);
    expect(expandPadAtmosphereCue(null, true).show).toBe(false);
    expect(expandPadAtmosphereCue("player_land", false).show).toBe(false);
    expect(expandPadAtmosphereCue("city", true).intensity).toBe(0);

    expect(expandPadAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(expandPadAtmosphereVsFieldFlashContrast()).toBeGreaterThan(0);
    expect(EXPAND_PAD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EXPAND_PAD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(EXPAND_PAD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EXPAND_FIELD_PAD_FLASH.emissiveColor.toLowerCase(),
    );
    expect(EXPAND_PAD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EXPAND_PAD_SHORT_AFFORD_PULSE.emissive.toLowerCase(),
    );
    expect(EXPAND_PAD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EXPAND_PAD_AFFORD_CUE.affordableEmissive.toLowerCase(),
    );

    expect(EXPAND_PAD_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      EXPAND_PAD_LANDMARK_CUE.hazeRadius,
    );
    expect(EXPAND_PAD_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      EXPAND_PAD_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(EXPAND_PAD_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      EXPAND_PAD_LANDMARK_CUE.intensityPeak,
    );
    expect(EXPAND_PAD_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      EXPAND_PAD_SHORT_AFFORD_PULSE.emissivePeak,
    );

    const low = expandPadAtmospherePulseEnvelope(0);
    const mid = expandPadAtmospherePulseEnvelope(
      EXPAND_PAD_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent expand slots or change costs (failure)", () => {
    expect(SLOT_EXPANSIONS.length).toBeGreaterThan(0);
    expect(SLOT_EXPANSIONS.every((s) => s.coinCost > 0)).toBe(true);
    expect(SLOT_EXPANSIONS[0]?.materials.length).toBeGreaterThan(0);

    expect(expandPadAtmosphereEmissiveIntensity(2)).toBe(
      EXPAND_PAD_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(expandPadAtmosphereEmissiveIntensity(-1)).toBe(
      EXPAND_PAD_ATMOSPHERE_CUE.intensityBase,
    );
    expect(expandPadAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(EXPAND_PAD_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(EXPAND_PAD_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(EXPAND_PAD_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
