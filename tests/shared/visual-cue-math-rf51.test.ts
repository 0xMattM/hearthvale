import { describe, expect, it } from "vitest";
import {
  clamp01,
  flashDecayEnvelope,
  intensityContrast,
  lerpByEnvelope,
  sinePulseEnvelope,
} from "@game/shared";

describe("visual-cue-math RF5.1", () => {
  it("sine pulse stays in [0,1] and completes a cycle (happy)", () => {
    const period = 1000;
    const a = sinePulseEnvelope(0, period);
    const b = sinePulseEnvelope(period / 4, period);
    const c = sinePulseEnvelope(period, period);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(1);
    expect(b).toBeGreaterThan(0.9);
    expect(Math.abs(c - a)).toBeLessThan(1e-9);
  });

  it("lerp and flash decay behave at edges (edge)", () => {
    expect(lerpByEnvelope(0.1, 0.3, 0)).toBeCloseTo(0.1);
    expect(lerpByEnvelope(0.1, 0.3, 1)).toBeCloseTo(0.3);
    expect(flashDecayEnvelope(0, 1000)).toBeCloseTo(1);
    expect(flashDecayEnvelope(1000, 1000)).toBe(0);
    expect(flashDecayEnvelope(-1, 1000)).toBe(0);
    expect(clamp01(2)).toBe(1);
  });

  it("rejects bad period/duration inputs (fail)", () => {
    expect(sinePulseEnvelope(50, 0)).toBeGreaterThanOrEqual(0);
    expect(flashDecayEnvelope(10, 0)).toBe(0);
    expect(intensityContrast(0.2, 0.5)).toBeCloseTo(0.3);
  });
});
