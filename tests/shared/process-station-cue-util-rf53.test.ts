import { describe, expect, it } from "vitest";
import {
  alchemyBenchAtmospherePulseEnvelope,
  forgeAtmospherePulseEnvelope,
  kitchenAtmospherePulseEnvelope,
  loomAtmospherePulseEnvelope,
  millAtmospherePulseEnvelope,
  processStationWorkingEmissiveEnvelope,
  sinePulseEnvelope,
  workshopAtmospherePulseEnvelope,
} from "@game/shared";

/**
 * RF5.3 — process-station cues use shared sinePulseEnvelope.
 */
describe("process-station cue util RF5.3", () => {
  it("working + station atmospheres stay in [0,1] (happy)", () => {
    const now = 7777;
    const samples = [
      processStationWorkingEmissiveEnvelope(now),
      millAtmospherePulseEnvelope(now),
      forgeAtmospherePulseEnvelope(now),
      kitchenAtmospherePulseEnvelope(now),
      loomAtmospherePulseEnvelope(now),
      alchemyBenchAtmospherePulseEnvelope(now),
      workshopAtmospherePulseEnvelope(now),
    ];
    for (const s of samples) {
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });

  it("working envelope matches util period when period known (edge)", () => {
    const a = processStationWorkingEmissiveEnvelope(0);
    const b = sinePulseEnvelope(0, 1200);
    expect(Math.abs(a - b)).toBeLessThan(1e-9);
  });

  it("NaN clock stays quiet (fail)", () => {
    expect(millAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(forgeAtmospherePulseEnvelope(Number.NaN)).toBe(0);
  });
});
