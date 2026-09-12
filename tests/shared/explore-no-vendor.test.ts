import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  EXPLORE_BUILDINGS,
  EXPLORE_LAND,
  STARTER_BUILDINGS,
  getVendorPrices,
} from "@game/shared";

/**
 * Explore is gather/hunt wilds — sell at City or homestead, not a forest stall.
 */
describe("Explore has no vendor stall", () => {
  it("keeps trees, ores, and dens without a stall (happy)", () => {
    expect(EXPLORE_BUILDINGS.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    expect(EXPLORE_BUILDINGS).toHaveLength(12);
    expect(EXPLORE_LAND.buildSlots).toBe(12);
    expect(EXPLORE_BUILDINGS.length).toBe(EXPLORE_LAND.buildSlots);
    expect(
      EXPLORE_BUILDINGS.filter((b) => b.type === "tree_stump"),
    ).toHaveLength(4);
    expect(EXPLORE_BUILDINGS.filter((b) => b.type === "ore_node")).toHaveLength(
      4,
    );
  });

  it("keeps regional Explore price books and City/land stalls (edge)", () => {
    expect(getVendorPrices("explore").sell.wood).toBeGreaterThan(
      getVendorPrices("city").sell.wood!,
    );
    expect(CITY_BUILDINGS.some((b) => b.type === "vendor_stall")).toBe(true);
    expect(STARTER_BUILDINGS.some((b) => b.type === "vendor_stall")).toBe(
      true,
    );
  });

  it("rejects putting a vendor_stall back on the Explore template (failure)", () => {
    expect(
      EXPLORE_BUILDINGS.filter((b) => b.type === "vendor_stall"),
    ).toHaveLength(0);
    expect(EXPLORE_BUILDINGS.some((b) => b.slotIndex === 13)).toBe(false);
  });
});
