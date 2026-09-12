import { describe, expect, it } from "vitest";
import {
  pathBedUvRepeat,
  raisedCurbOuterSize,
  softFloorOuterSize,
} from "../../apps/web/lib/floor-seam-metrics";

/**
 * Raised curb metrics — geometry edges replace transparent texture aprons.
 */
describe("raised floor curb metrics", () => {
  it("grows curb past the hard edge (happy)", () => {
    const { outerW, outerD } = raisedCurbOuterSize(32, 28, 0.32);
    expect(outerW).toBeCloseTo(32.64, 5);
    expect(outerD).toBeCloseTo(28.64, 5);
  });

  it("allows zero curb (edge)", () => {
    const { outerW, outerD } = raisedCurbOuterSize(10, 8, 0);
    expect(outerW).toBe(10);
    expect(outerD).toBe(8);
  });

  it("clamps degenerate inner size (failure)", () => {
    const { outerW } = raisedCurbOuterSize(0, 4, 0.5);
    expect(outerW).toBeGreaterThan(0);
  });

  it("softFloorOuterSize stays as alias (compat)", () => {
    expect(softFloorOuterSize(10, 8, 1)).toEqual(raisedCurbOuterSize(10, 8, 1));
  });

  it("tiles long path UVs along the length (happy)", () => {
    const [u, v] = pathBedUvRepeat(3.2, 36, 1.15);
    expect(v / u).toBeGreaterThan(8);
  });
});
