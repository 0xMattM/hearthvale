import { describe, expect, it } from "vitest";
import { COMBAT, isHealthLow } from "@game/shared";
import {
  ENERGY_LOW_SUCCESS_CUE,
  HEALTH_LOW_SUCCESS_CUE,
  healthLowThresholdCueText,
  isCoreSuccessCueText,
  shouldFlashEnergyLowCue,
  shouldFlashHealthLowCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL64.1 — Health low threshold brief cue.
 * Ephemeral TopBar `Health low` on crossing into the low band (mirrors Energy low PL41.1).
 * Health numbers / combat rules unchanged; mute ok.
 */
describe("CityLands PL64.1 health low threshold brief cue", () => {
  it("flashes Health low only when crossing into the low band (happy)", () => {
    expect(COMBAT.lowWarnPct).toBe(25);
    expect(healthLowThresholdCueText()).toBe(HEALTH_LOW_SUCCESS_CUE);
    expect(healthLowThresholdCueText()).toBe("Health low");
    expect(isCoreSuccessCueText("Health low")).toBe(true);

    // 26% → 25%: edge into low band
    expect(shouldFlashHealthLowCue(26, 100, 25, 100)).toBe(true);
    expect(isHealthLow(26, 100)).toBe(false);
    expect(isHealthLow(25, 100)).toBe(true);

    // Half of 200 max: 51 → 50 crosses 25%
    expect(shouldFlashHealthLowCue(51, 200, 50, 200)).toBe(true);
  });

  it("stays quiet while already low, recovering, or on energy-only edges (edge)", () => {
    expect(shouldFlashHealthLowCue(20, 100, 10, 100)).toBe(false);
    expect(shouldFlashHealthLowCue(25, 100, 25, 100)).toBe(false);
    expect(shouldFlashHealthLowCue(10, 100, 40, 100)).toBe(false);
    expect(shouldFlashHealthLowCue(50, 100, 40, 100)).toBe(false);
    expect(shouldFlashHealthLowCue(null, 100, 10, 100)).toBe(false);
    expect(shouldFlashHealthLowCue(50, null, 10, 100)).toBe(false);
    expect(shouldFlashHealthLowCue(undefined, undefined, 10, 100)).toBe(false);
    // Energy edge does not trip health cue
    expect(shouldFlashEnergyLowCue(26, 100, 25, 100)).toBe(true);
    expect(shouldFlashHealthLowCue(100, 100, 100, 100)).toBe(false);
    expect(healthLowThresholdCueText()).not.toBe(ENERGY_LOW_SUCCESS_CUE);
  });

  it("refuses invalid numbers and does not invent combat power (failure)", () => {
    expect(shouldFlashHealthLowCue(Number.NaN, 100, 10, 100)).toBe(false);
    expect(shouldFlashHealthLowCue(50, 100, Number.NaN, 100)).toBe(false);
    expect(shouldFlashHealthLowCue(50, 100, 10, Number.NaN)).toBe(false);
    expect(shouldFlashHealthLowCue(50, 0, 10, 100)).toBe(false);
    expect(healthLowThresholdCueText()).not.toMatch(/\d/);
    expect(COMBAT.maxHealthStart).toBeGreaterThan(COMBAT.lowWarnPct);
    expect(isCoreSuccessCueText("Health low · always on")).toBe(false);
    expect(healthLowThresholdCueText().toLowerCase()).not.toMatch(
      /nft|combat power|daily cap/,
    );
  });
});
