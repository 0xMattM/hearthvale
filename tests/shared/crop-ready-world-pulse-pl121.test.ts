import { describe, expect, it } from "vitest";
import {
  CROP_READY_WORLD_PULSE,
  cropReadyWorldPulseIntensity,
} from "@game/shared";
import { cropVisual } from "../../apps/web/lib/resource-visuals";

/**
 * PL12.1 — Crop ready world pulse SoT (soft pad + emissive; empty/growing quiet).
 * Choice: clock-driven intensity over useFrame so pulse stays seek-safe with nowMs.
 */
describe("CityLands PL12.1 crop ready world pulse", () => {
  it("pulses emissive between min/max with distinct ready pad palette (happy)", () => {
    const { intensityMin, intensityMax, periodMs, padColor, emissiveColor } =
      CROP_READY_WORLD_PULSE;
    expect(padColor.length).toBeGreaterThan(0);
    expect(emissiveColor.length).toBeGreaterThan(0);
    expect(padColor).not.toBe(emissiveColor);
    expect(intensityMax).toBeGreaterThan(intensityMin);
    expect(periodMs).toBeGreaterThan(0);

    const peak = cropReadyWorldPulseIntensity(periodMs / 4);
    const trough = cropReadyWorldPulseIntensity((3 * periodMs) / 4);
    expect(peak).toBeGreaterThanOrEqual(intensityMin);
    expect(peak).toBeLessThanOrEqual(intensityMax);
    expect(trough).toBeCloseTo(intensityMin, 5);
    expect(peak).toBeCloseTo(intensityMax, 5);
    expect(peak).toBeGreaterThan(trough);

    const now = 1_000_000;
    const ready = cropVisual("ready", now - 1, now, false);
    expect(ready.state).toBe("ready");
    expect(ready.showReadyBadge).toBe(true);
  });

  it("keeps empty and growing plots without ready pulse semantics (edge)", () => {
    const now = 2_000_000;
    const empty = cropVisual("empty", null, now, false);
    expect(empty.state).toBe("empty");
    expect(empty.showReadyBadge).toBe(false);
    expect(empty.stemHeight).toBe(0);

    const growing = cropVisual("planted", now + 60_000, now, false);
    expect(growing.state).toBe("growing");
    expect(growing.showReadyBadge).toBe(false);
    expect(growing.showProgressBar).toBe(true);
  });

  it("rejects intensity outside SoT range and flat zero period (failure)", () => {
    const { intensityMin, intensityMax, periodMs } = CROP_READY_WORLD_PULSE;
    for (const t of [0, 1, periodMs / 2, periodMs - 1, periodMs * 3 + 7]) {
      const v = cropReadyWorldPulseIntensity(t);
      expect(v).toBeGreaterThanOrEqual(intensityMin);
      expect(v).toBeLessThanOrEqual(intensityMax);
    }
    expect(cropReadyWorldPulseIntensity(-periodMs / 4)).toBeGreaterThanOrEqual(
      intensityMin,
    );
    expect(intensityMin).not.toBe(intensityMax);
  });
});
