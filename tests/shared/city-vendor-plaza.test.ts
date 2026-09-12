import { describe, expect, it } from "vitest";
import { CITY_BUILDINGS } from "@game/shared";

/**
 * City vendor sits on the west plaza lip, not out in the mill/ore yard.
 */
describe("city vendor plaza placement", () => {
  it("puts the stall closer to the fountain than the old west yard (happy)", () => {
    const vendor = CITY_BUILDINGS.find((b) => b.type === "vendor_stall");
    expect(vendor).toBeDefined();
    const dist = Math.hypot(vendor!.x, vendor!.z);
    expect(dist).toBeLessThan(Math.hypot(-10, 0));
    expect(vendor!.x).toBeLessThan(0);
  });

  it("stays off the fountain and the cobble cross (edge)", () => {
    const vendor = CITY_BUILDINGS.find((b) => b.type === "vendor_stall")!;
    expect(Math.abs(vendor.x)).toBeGreaterThan(2);
    expect(Math.abs(vendor.z)).toBeGreaterThan(0);
    expect(CITY_BUILDINGS.filter((b) => b.x === vendor.x && b.z === vendor.z)).toHaveLength(
      1,
    );
  });

  it("does not leave the stall in the mill bay (failure)", () => {
    const vendor = CITY_BUILDINGS.find((b) => b.type === "vendor_stall")!;
    expect(vendor.x).not.toBe(-10);
    expect(vendor.z).not.toBe(0);
  });
});
