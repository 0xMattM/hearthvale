import { describe, expect, it } from "vitest";
import {
  EXPAND_FIELD_PAD_FLASH,
  EXPAND_PAD_AFFORD_CUE,
  EXPAND_PAD_LANDMARK_CUE,
  EXPAND_PAD_SHORT_AFFORD_PULSE,
  SLOT_EXPANSIONS,
  expandPadLandmarkCue,
  expandPadLandmarkEmissiveIntensity,
  expandPadLandmarkHazeOpacity,
  expandPadLandmarkPulseEnvelope,
  expandPadLandmarkVsAffordableContrast,
  expandPadLandmarkVsFieldFlashContrast,
  expandPadLandmarkVsShortAffordContrast,
} from "@game/shared";

/**
 * PL163.1 — Expand-pad soft landmark cue leftover.
 * Choice: quiet warm field-gold haze/emissive on existing expand_pad while
 * visible (complements short-afford pulse PL123.1 + tip); layouts / costs unchanged.
 */
describe("CityLands PL163.1 expand-pad soft landmark cue leftover", () => {
  it("pulses warm field-gold haze while expand pad is visible (happy)", () => {
    const cue = expandPadLandmarkCue(true);
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      EXPAND_PAD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(EXPAND_PAD_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(EXPAND_PAD_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(EXPAND_PAD_LANDMARK_CUE.hazeRadius);

    const peak = expandPadLandmarkEmissiveIntensity(1);
    const floor = expandPadLandmarkEmissiveIntensity(0);
    expect(peak).toBe(EXPAND_PAD_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(EXPAND_PAD_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = expandPadLandmarkHazeOpacity(1);
    const hazeFloor = expandPadLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet when pad hidden; field-gold ≠ short / flash / afford (edge)", () => {
    expect(expandPadLandmarkCue(false).show).toBe(false);
    expect(expandPadLandmarkCue(false).intensity).toBe(0);
    expect(expandPadLandmarkCue(false).hazeOpacity).toBe(0);

    expect(expandPadLandmarkVsShortAffordContrast()).toBeGreaterThan(0);
    expect(expandPadLandmarkVsFieldFlashContrast()).toBeGreaterThan(0);
    expect(expandPadLandmarkVsAffordableContrast()).toBeGreaterThan(0);
    expect(EXPAND_PAD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPAND_PAD_SHORT_AFFORD_PULSE.emissive.toLowerCase(),
    );
    expect(EXPAND_PAD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPAND_FIELD_PAD_FLASH.emissiveColor.toLowerCase(),
    );
    expect(EXPAND_PAD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPAND_PAD_AFFORD_CUE.affordableEmissive.toLowerCase(),
    );

    // Continuous landmark stays quieter / slower than short-afford pulse.
    expect(EXPAND_PAD_LANDMARK_CUE.intensityPeak).toBeLessThan(
      EXPAND_PAD_SHORT_AFFORD_PULSE.emissivePeak,
    );
    expect(EXPAND_PAD_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      EXPAND_PAD_SHORT_AFFORD_PULSE.periodMs,
    );

    const low = expandPadLandmarkPulseEnvelope(0);
    const mid = expandPadLandmarkPulseEnvelope(
      EXPAND_PAD_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent expand slots or change costs (failure)", () => {
    expect(SLOT_EXPANSIONS.length).toBeGreaterThan(0);
    expect(SLOT_EXPANSIONS.every((s) => s.coinCost > 0)).toBe(true);

    expect(expandPadLandmarkEmissiveIntensity(2)).toBe(
      EXPAND_PAD_LANDMARK_CUE.intensityPeak,
    );
    expect(expandPadLandmarkEmissiveIntensity(-1)).toBe(
      EXPAND_PAD_LANDMARK_CUE.intensityBase,
    );
    expect(expandPadLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(EXPAND_PAD_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(EXPAND_PAD_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|fare/i,
    );
  });
});
