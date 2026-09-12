import { describe, expect, it } from "vitest";
import {
  CITY_COMMERCE_SERVICE_PAD,
  CITY_HUB_VISUAL,
  CITY_SERVICE_VISUAL_KITS,
  cityCommerceServicePad,
  cityCommerceVsCivicPadContrast,
  cityCommerceVsScarceYardContrast,
  cityVendorVsMarketPadContrast,
  getVendorPrices,
} from "@game/shared";

/**
 * PL117.1 — Market / vendor service-pad warmth.
 * Choice: always-on warm lantern/pad on commerce meshes (not scarce/civic pads)
 * so City market≠yard at a glance; prices / panels unchanged; no station invent.
 */
describe("CityLands PL117.1 market / vendor service-pad warmth", () => {
  it("warms vendor + market pads apart from scarce yard and civic (happy)", () => {
    const vendor = cityCommerceServicePad("vendor");
    const market = cityCommerceServicePad("market");

    expect(vendor.show).toBe(true);
    expect(market.show).toBe(true);
    expect(vendor.padOpacity).toBeGreaterThan(0);
    expect(market.lanternIntensity).toBeGreaterThan(0);
    expect(vendor.padColor.toLowerCase()).toBe(
      CITY_COMMERCE_SERVICE_PAD.vendor.padColor.toLowerCase(),
    );
    expect(market.padColor.toLowerCase()).toBe(
      CITY_COMMERCE_SERVICE_PAD.market.padColor.toLowerCase(),
    );
    expect(vendor.padColor.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.scarceYardColor.toLowerCase(),
    );
    expect(market.padColor.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.civicPadColor.toLowerCase(),
    );
    expect(cityCommerceVsScarceYardContrast()).toBeGreaterThan(40);
    expect(cityCommerceVsCivicPadContrast()).toBeGreaterThan(40);
    expect(cityVendorVsMarketPadContrast()).toBeGreaterThan(10);
  });

  it("keeps awning/board kits and quiet lantern fields (edge)", () => {
    expect(CITY_SERVICE_VISUAL_KITS.vendor_stall.kit).toBe("awning");
    expect(CITY_SERVICE_VISUAL_KITS.market_board.kit).toBe("board");
    const vendor = cityCommerceServicePad("vendor");
    expect(vendor.lanternColor.length).toBeGreaterThan(0);
    expect(vendor.lanternEmissive.toLowerCase()).not.toBe("#000000");
    expect(CITY_COMMERCE_SERVICE_PAD.vendor.padColor.toLowerCase()).not.toBe(
      CITY_COMMERCE_SERVICE_PAD.market.padColor.toLowerCase(),
    );
  });

  it("does not change city vendor prices or invent stations (failure)", () => {
    const city = getVendorPrices("city");
    expect(city.buy.wheat_seed).toBe(8);
    expect(city.buy.wooden_hoe).toBe(12);
    expect(city.sell.wood).toBeDefined();
    expect(cityCommerceServicePad("vendor").show).toBe(true);
    expect(CITY_HUB_VISUAL.scarceYardColor.toLowerCase()).toBe("#9a7a58");
    expect(cityCommerceVsScarceYardContrast()).not.toBe(0);
  });
});
