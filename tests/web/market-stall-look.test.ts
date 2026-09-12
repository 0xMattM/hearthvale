import { describe, expect, it } from "vitest";
import {
  marketStallKitMaterials,
  vendorStallKitMaterials,
} from "../../packages/shared/src/world-object-materials";

/**
 * Market stall shares the vendor silhouette but uses sage/gold cloth.
 */
describe("market stall look", () => {
  it("uses a distinct awning color from the vendor (happy)", () => {
    const market = marketStallKitMaterials(false);
    const vendor = vendorStallKitMaterials(false);
    expect(market.awningColor.toLowerCase()).not.toBe(
      vendor.awningColor.toLowerCase(),
    );
    expect(market.stripeColor.toLowerCase()).not.toBe(
      vendor.stripeColor.toLowerCase(),
    );
    expect(market.awning.roughness).toBeGreaterThan(market.counter.roughness);
  });

  it("brightens cloth on highlight without flattening PBR (edge)", () => {
    const idle = marketStallKitMaterials(false);
    const lit = marketStallKitMaterials(true);
    expect(lit.awningColor).not.toBe(idle.awningColor);
    expect(lit.awning.roughness).toBe(idle.awning.roughness);
  });

  it("does not reuse vendor cream/burgundy (failure)", () => {
    const market = marketStallKitMaterials(false);
    expect(market.awningColor.toLowerCase()).not.toBe("#e4d4b0");
    expect(market.stripeColor.toLowerCase()).not.toBe("#9a3030");
  });
});
