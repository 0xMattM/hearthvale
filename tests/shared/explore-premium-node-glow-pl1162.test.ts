import { describe, expect, it } from "vitest";
import {
  EXPLORE_PREMIUM_NODE_GLOW,
  EXPLORE_VENDOR_PREMIUM_SELL_ITEMS,
  GATHER_NODE_DEPLETED_CUE,
  explorePremiumNodeGlow,
  explorePremiumWoodVsOrePadContrast,
  gatherOreDepletedPad,
  gatherStumpWorldVisual,
  getVendorPrices,
} from "@game/shared";

/**
 * PL116.2 — Explore premium-node soft glow.
 * Choice: ready-only Explore pad/emissive on wood/ore so wilds premiums read
 * apart from City/Land common gather; rates unchanged; depleted stays PL12.2.
 */
describe("CityLands PL116.2 explore premium-node soft glow", () => {
  it("glows Explore ready wood/ore pads distinct from each other (happy)", () => {
    const wood = explorePremiumNodeGlow("explore", true, "wood");
    const ore = explorePremiumNodeGlow("explore", true, "ore");

    expect(wood.show).toBe(true);
    expect(ore.show).toBe(true);
    expect(wood.padOpacity).toBeGreaterThan(0);
    expect(ore.intensity).toBeGreaterThan(0);
    expect(wood.padColor.toLowerCase()).toBe(
      EXPLORE_PREMIUM_NODE_GLOW.wood.padColor.toLowerCase(),
    );
    expect(ore.padColor.toLowerCase()).toBe(
      EXPLORE_PREMIUM_NODE_GLOW.ore.padColor.toLowerCase(),
    );
    expect(wood.padColor.toLowerCase()).not.toBe(ore.padColor.toLowerCase());
    expect(explorePremiumWoodVsOrePadContrast()).toBeGreaterThan(40);
  });

  it("stays quiet off Explore and when depleted; PL12.2 pad remains (edge)", () => {
    expect(explorePremiumNodeGlow("player_land", true, "wood").show).toBe(
      false,
    );
    expect(explorePremiumNodeGlow("city", true, "ore").show).toBe(false);
    expect(explorePremiumNodeGlow("warrior", true, "wood").show).toBe(false);
    expect(explorePremiumNodeGlow("explore", false, "wood").show).toBe(false);
    expect(explorePremiumNodeGlow("explore", false, "ore").intensity).toBe(0);

    const depletedStump = gatherStumpWorldVisual(false, false);
    expect(depletedStump.showDepletedPad).toBe(true);
    expect(depletedStump.padColor).toBe(GATHER_NODE_DEPLETED_CUE.stumpDepletedPad);
    expect(gatherOreDepletedPad(false).show).toBe(true);
    expect(gatherOreDepletedPad(true).show).toBe(false);
  });

  it("does not change Explore premium sell rates (failure)", () => {
    const explore = getVendorPrices("explore");
    const city = getVendorPrices("city");
    expect(explore.sell.wood).toBeGreaterThan(city.sell.wood ?? 0);
    expect(explore.sell.iron_ore).toBeGreaterThan(city.sell.iron_ore ?? 0);
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain("wood");
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain("iron_ore");
    expect(explorePremiumNodeGlow("explore", true, "wood").show).toBe(true);
    expect(explorePremiumNodeGlow("player_land", true, "wood").padOpacity).toBe(
      0,
    );
    expect(explorePremiumWoodVsOrePadContrast()).not.toBe(0);
  });
});
