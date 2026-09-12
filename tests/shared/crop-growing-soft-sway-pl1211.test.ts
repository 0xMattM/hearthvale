import { describe, expect, it } from "vitest";
import {
  CROP_GROWING_SOFT_SWAY,
  CROP_READY_WORLD_PULSE,
  CROPS,
  cropGrowingPadEmissiveIntensity,
  cropGrowingSoftSwayActive,
  cropGrowingSoftSwayEnvelope,
  cropGrowingStemEmissiveIntensity,
  cropGrowingStemSwayRadians,
} from "@game/shared";
import { cropVisual } from "../../apps/web/lib/resource-visuals";

/**
 * PL121.1 — Crop growing soft sway cue.
 * Choice: quiet pad + signed stem lean while sprout/growing (complements
 * ready pulse PL12.1); empty/ready stay without growing sway; growMs unchanged.
 */
describe("CityLands PL121.1 crop growing soft sway", () => {
  it("sways pad + stem while growing (happy)", () => {
    expect(cropGrowingSoftSwayActive("sprout")).toBe(true);
    expect(cropGrowingSoftSwayActive("growing")).toBe(true);

    const { intensityMin, intensityMax, periodMs, stemSwayRad } =
      CROP_GROWING_SOFT_SWAY;
    expect(periodMs).toBeGreaterThan(0);
    expect(intensityMax).toBeGreaterThan(intensityMin);
    expect(stemSwayRad).toBeGreaterThan(0);
    expect(CROP_GROWING_SOFT_SWAY.padColor).not.toBe(
      CROP_READY_WORLD_PULSE.padColor,
    );

    const mid = cropGrowingSoftSwayEnvelope(periodMs / 4);
    const trough = cropGrowingSoftSwayEnvelope((3 * periodMs) / 4);
    expect(mid).toBeGreaterThan(trough);

    const peakPad = cropGrowingPadEmissiveIntensity(true, 1);
    const floorPad = cropGrowingPadEmissiveIntensity(true, 0);
    expect(peakPad).toBe(intensityMax);
    expect(floorPad).toBe(intensityMin);

    expect(cropGrowingStemSwayRadians(true, 1)).toBeCloseTo(stemSwayRad, 5);
    expect(cropGrowingStemSwayRadians(true, 0)).toBeCloseTo(-stemSwayRad, 5);
    expect(cropGrowingStemEmissiveIntensity(true, 1)).toBe(
      CROP_GROWING_SOFT_SWAY.stemEmissiveMax,
    );

    const now = 1_000_000;
    const growing = cropVisual("planted", now + 60_000, now, false);
    expect(growing.state).toBe("growing");
    expect(cropGrowingSoftSwayActive(growing.state)).toBe(true);
  });

  it("keeps empty and ready without growing sway (edge)", () => {
    expect(cropGrowingSoftSwayActive("empty")).toBe(false);
    expect(cropGrowingSoftSwayActive("ready")).toBe(false);
    expect(cropGrowingPadEmissiveIntensity(false, 1)).toBe(0);
    expect(cropGrowingStemSwayRadians(false, 1)).toBe(0);
    expect(cropGrowingStemEmissiveIntensity(false, 0.5)).toBe(0);

    const now = 2_000_000;
    const empty = cropVisual("empty", null, now, false);
    expect(empty.state).toBe("empty");
    expect(cropGrowingSoftSwayActive(empty.state)).toBe(false);

    const ready = cropVisual("ready", now - 1, now, false);
    expect(ready.state).toBe("ready");
    expect(cropGrowingSoftSwayActive(ready.state)).toBe(false);
    expect(ready.showReadyBadge).toBe(true);
  });

  it("keeps grow timers; clamps envelope (failure)", () => {
    expect(CROPS.wheat.growMs).toBe(3 * 60 * 1000);
    expect(cropGrowingSoftSwayEnvelope(Number.NaN)).toBe(0);
    expect(cropGrowingPadEmissiveIntensity(true, 2)).toBe(
      CROP_GROWING_SOFT_SWAY.intensityMax,
    );
    expect(cropGrowingPadEmissiveIntensity(true, -1)).toBe(
      CROP_GROWING_SOFT_SWAY.intensityMin,
    );
    expect(cropGrowingStemSwayRadians(true, 2)).toBeCloseTo(
      CROP_GROWING_SOFT_SWAY.stemSwayRad,
      5,
    );
  });
});
