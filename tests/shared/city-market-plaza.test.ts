import { describe, expect, it } from "vitest";
import { CITY_BUILDINGS } from "@game/shared";

/**
 * City market stall sits on the east plaza lip, mirroring the vendor.
 */
describe("city market plaza placement", () => {
  it("puts the stall on the east lip across from the vendor (happy)", () => {
    const market = CITY_BUILDINGS.find((b) => b.type === "market_board")!;
    const vendor = CITY_BUILDINGS.find((b) => b.type === "vendor_stall")!;
    expect(market.x).toBe(-vendor.x);
    expect(market.z).toBe(vendor.z);
    expect(market.x).toBeGreaterThan(0);
    expect(Math.hypot(market.x, market.z)).toBeLessThan(Math.hypot(10, 0));
  });

  it("stays off the fountain and does not share a cell (edge)", () => {
    const market = CITY_BUILDINGS.find((b) => b.type === "market_board")!;
    expect(Math.abs(market.x)).toBeGreaterThan(2);
    expect(
      CITY_BUILDINGS.filter((b) => b.x === market.x && b.z === market.z),
    ).toHaveLength(1);
  });

  it("does not leave the board in the east yard (failure)", () => {
    const market = CITY_BUILDINGS.find((b) => b.type === "market_board")!;
    expect(market.x).not.toBe(10);
    expect(market.z).not.toBe(0);
  });
});
