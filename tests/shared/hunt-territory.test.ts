import { describe, expect, it } from "vitest";
import {
  LIVE_COMBAT,
  huntDenSeed,
  huntFoeIdleOffset,
  huntTerritoryPoint,
} from "../../packages/shared/src/index.ts";

/**
 * COMBAT-WILD-1 — hunt animals occupy a territory disk, not a station plot.
 */
describe("hunt wildlife territory", () => {
  it("places idle hares inside the wander disk (happy)", () => {
    const idle = huntFoeIdleOffset("hare", 0.25);
    const hypot = Math.hypot(idle.x, idle.z);
    expect(hypot).toBeGreaterThan(1.5);
    expect(hypot).toBeLessThanOrEqual(LIVE_COMBAT.wanderRadius);
    const brush = huntTerritoryPoint(0.25, 3, LIVE_COMBAT.habitatRadius);
    expect(Math.hypot(brush.x, brush.z)).toBeLessThanOrEqual(
      LIVE_COMBAT.habitatRadius,
    );
    expect(LIVE_COMBAT.habitatRadius).toBeLessThan(LIVE_COMBAT.wanderRadius);
  });

  it("keeps dummy idle on the ring and seeds dens stably (edge)", () => {
    expect(huntFoeIdleOffset("dummy", 0.9)).toEqual({ x: 0, z: 0 });
    expect(huntDenSeed("trail-a")).toBe(huntDenSeed("trail-a"));
    expect(huntDenSeed("trail-a")).not.toBe(huntDenSeed("trail-b"));
  });

  it("never places a territory point outside its radius (failure)", () => {
    for (let slot = 0; slot < 12; slot += 1) {
      const p = huntTerritoryPoint(0.41, slot, LIVE_COMBAT.wanderRadius);
      expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(
        LIVE_COMBAT.wanderRadius + 1e-9,
      );
    }
    const outside = huntTerritoryPoint(0.1, 0, 2);
    expect(Math.hypot(outside.x, outside.z)).toBeLessThanOrEqual(2);
    expect(Math.hypot(outside.x, outside.z)).toBeGreaterThan(0.5);
  });
});
