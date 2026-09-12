import { describe, expect, it } from "vitest";
import { kitBoxRadius, kitBoxSegments } from "../../apps/web/lib/kit-box-metrics";

/**
 * Rounded kit boxes — station bodies are not ruler-cut cubes.
 */
describe("kit box round-over", () => {
  it("rounds a station body (happy)", () => {
    const r = kitBoxRadius(1.9, 1.7, 1.6);
    expect(r).toBeGreaterThan(0.08);
    expect(r).toBeLessThanOrEqual(0.16);
    expect(kitBoxSegments(1.9, 1.7, 1.6)).toBe(3);
    expect(kitBoxSegments(0.2, 1, 1)).toBe(2);
    expect(kitBoxSegments(0.05, 1, 1)).toBe(1);
  });

  it("keeps thin boards from ballooning (edge)", () => {
    const r = kitBoxRadius(1.05, 0.1, 0.02);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThanOrEqual(0.01);
  });

  it("never exceeds half the shortest side (failure)", () => {
    const r = kitBoxRadius(0.02, 0.02, 0.02);
    expect(r).toBeLessThanOrEqual(0.01);
    expect(kitBoxRadius(0, 1, 1)).toBeGreaterThan(0);
  });
});
