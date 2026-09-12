import { describe, expect, it } from "vitest";
import { ENERGY, isEnergyLow } from "@game/shared";
import {
  ENERGY_LOW_SUCCESS_CUE,
  energyLowThresholdCueText,
  isCoreSuccessCueText,
  shouldFlashEnergyLowCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL41.1 — Low energy threshold brief cue.
 * Ephemeral TopBar `Energy low` on crossing into the low band; meter warn (PL9.1) stays.
 * Energy numbers unchanged; no always-on column.
 */
describe("CityLands PL41.1 low energy threshold brief cue", () => {
  it("flashes Energy low only when crossing into the low band (happy)", () => {
    expect(ENERGY.lowWarnPct).toBe(25);
    expect(energyLowThresholdCueText()).toBe(ENERGY_LOW_SUCCESS_CUE);
    expect(energyLowThresholdCueText()).toBe("Energy low");
    expect(isCoreSuccessCueText("Energy low")).toBe(true);

    // 26% → 25%: edge into low band
    expect(shouldFlashEnergyLowCue(26, 100, 25, 100)).toBe(true);
    expect(isEnergyLow(26, 100)).toBe(false);
    expect(isEnergyLow(25, 100)).toBe(true);

    // Half of 200 max: 51 → 50 crosses 25%
    expect(shouldFlashEnergyLowCue(51, 200, 50, 200)).toBe(true);
  });

  it("stays quiet while already low or when recovering (edge)", () => {
    expect(shouldFlashEnergyLowCue(20, 100, 10, 100)).toBe(false);
    expect(shouldFlashEnergyLowCue(25, 100, 25, 100)).toBe(false);
    expect(shouldFlashEnergyLowCue(10, 100, 40, 100)).toBe(false);
    expect(shouldFlashEnergyLowCue(50, 100, 40, 100)).toBe(false);
    expect(shouldFlashEnergyLowCue(null, 100, 10, 100)).toBe(false);
    expect(shouldFlashEnergyLowCue(50, null, 10, 100)).toBe(false);
    expect(shouldFlashEnergyLowCue(undefined, undefined, 10, 100)).toBe(false);
  });

  it("refuses invalid numbers and does not invent energy costs (failure)", () => {
    expect(shouldFlashEnergyLowCue(Number.NaN, 100, 10, 100)).toBe(false);
    expect(shouldFlashEnergyLowCue(50, 100, Number.NaN, 100)).toBe(false);
    expect(shouldFlashEnergyLowCue(50, 100, 10, Number.NaN)).toBe(false);
    expect(shouldFlashEnergyLowCue(50, 0, 10, 100)).toBe(false);
    expect(energyLowThresholdCueText()).not.toMatch(/\d/);
    expect(ENERGY.maxStart).toBeGreaterThan(ENERGY.lowWarnPct);
    expect(isCoreSuccessCueText("Energy low · always on")).toBe(false);
  });
});
