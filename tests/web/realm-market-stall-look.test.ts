import { describe, expect, it } from "vitest";
import {
  marketStallKitMaterials,
  realmMarketStallKitMaterials,
  vendorStallKitMaterials,
} from "../../packages/shared/src/world-object-materials";

/**
 * REALM stall shares the peaked-canvas kit but uses indigo/gold, not sage.
 */
describe("REALM market stall look", () => {
  it("uses indigo cloth distinct from coin Market sage (happy)", () => {
    const realm = realmMarketStallKitMaterials(false);
    const coins = marketStallKitMaterials(false);
    expect(realm.awningColor.toLowerCase()).not.toBe(
      coins.awningColor.toLowerCase(),
    );
    expect(realm.awningColor.toLowerCase()).toBe("#4a5a88");
    expect(coins.awningColor.toLowerCase()).toBe("#6e9a88");
    expect(realm.awning.roughness).toBeGreaterThan(realm.counter.roughness);
  });

  it("brightens cloth on highlight without flattening PBR (edge)", () => {
    const idle = realmMarketStallKitMaterials(false);
    const lit = realmMarketStallKitMaterials(true);
    expect(lit.awningColor).not.toBe(idle.awningColor);
    expect(lit.awning.roughness).toBe(idle.awning.roughness);
  });

  it("does not reuse vendor cream or coin-market sage (failure)", () => {
    const realm = realmMarketStallKitMaterials(false);
    const vendor = vendorStallKitMaterials(false);
    expect(realm.awningColor.toLowerCase()).not.toBe(
      vendor.awningColor.toLowerCase(),
    );
    expect(realm.awningColor.toLowerCase()).not.toBe("#6e9a88");
    expect(realm.awningColor.toLowerCase()).not.toBe("#e4d4b0");
    expect(realm.stripeColor.toLowerCase()).not.toBe("#9a3030");
  });
});
