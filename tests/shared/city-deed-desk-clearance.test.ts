import { describe, expect, it } from "vitest";
import { CITY_DEED_DESK_LANDMARK_CUE } from "@game/shared";

const INNER_COURT_COLUMNS: Array<[number, number]> = [
  [-5.4, -5.4],
  [5.4, -5.4],
  [-5.4, 5.4],
  [5.4, 5.4],
];

/**
 * Deed desk sits on inner-court flagstone, not stacked on a murito / column.
 */
describe("city deed desk clearance", () => {
  it("stands clear of the inner-court columns (happy)", () => {
    const { deskX, deskZ } = CITY_DEED_DESK_LANDMARK_CUE;
    const nearest = Math.min(
      ...INNER_COURT_COLUMNS.map(([x, z]) => Math.hypot(deskX - x, deskZ - z)),
    );
    expect(nearest).toBeGreaterThan(1.8);
  });

  it("stays on the plaza, not the City Hall façade (edge)", () => {
    const { deskX, deskZ } = CITY_DEED_DESK_LANDMARK_CUE;
    expect(Math.abs(deskX)).toBeGreaterThan(2);
    expect(Math.abs(deskX)).toBeLessThan(5.2);
    expect(deskZ).toBeGreaterThan(-5.2);
    expect(deskZ).toBeLessThan(-2);
  });

  it("does not sit on the NE murito (failure)", () => {
    const { deskX, deskZ } = CITY_DEED_DESK_LANDMARK_CUE;
    expect(deskX).not.toBe(4.6);
    expect(deskZ).not.toBe(-6.35);
    expect(Math.hypot(deskX - 5.4, deskZ - -6.2)).toBeGreaterThan(1.5);
  });
});
