import { describe, expect, it } from "vitest";
import {
  cropGrowingAtmospherePulseEnvelope,
  cropGrowingSoftSwayEnvelope,
  cropReadyWorldPulseIntensity,
  gatherSuccessPadFlashEnvelope,
  oreNodeAtmospherePulseEnvelope,
  sinePulseEnvelope,
  treeStumpAtmospherePulseEnvelope,
} from "@game/shared";

/**
 * RF5.2 — gather-family cues delegate to shared visual-cue-math.
 */
describe("gather-family cue util RF5.2", () => {
  it("crop/stump/ore pulses match sine util (happy)", () => {
    const now = 12345;
    expect(cropGrowingSoftSwayEnvelope(now)).toBe(
      sinePulseEnvelope(now, 2400),
    );
    expect(cropGrowingAtmospherePulseEnvelope(now)).toBe(
      sinePulseEnvelope(now, 3800),
    );
    expect(treeStumpAtmospherePulseEnvelope(now)).toBeGreaterThanOrEqual(0);
    expect(oreNodeAtmospherePulseEnvelope(now)).toBeGreaterThanOrEqual(0);
    expect(cropReadyWorldPulseIntensity(now)).toBeGreaterThan(0);
  });

  it("gather flash decays like shared flash util (edge)", () => {
    expect(gatherSuccessPadFlashEnvelope(0)).toBeCloseTo(1);
    expect(gatherSuccessPadFlashEnvelope(999_999)).toBe(0);
  });

  it("invalid now/period stays quiet (fail)", () => {
    expect(cropGrowingSoftSwayEnvelope(Number.NaN)).toBe(0);
    expect(treeStumpAtmospherePulseEnvelope(Number.NaN)).toBe(0);
  });
});
