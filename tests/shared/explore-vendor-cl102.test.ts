import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  EXPLORE_VENDOR_PREMIUM_SELL_ITEMS,
  exploreRegionalVendorTip,
  getVendorPrices,
} from "@game/shared";

describe("CityLands CL10.2 explore vs city vendor value", () => {
  it("pays more for wood and hunt mats at explore than city (happy)", () => {
    const explore = getVendorPrices("explore").sell;
    const city = getVendorPrices("city").sell;
    for (const itemId of EXPLORE_VENDOR_PREMIUM_SELL_ITEMS) {
      expect(explore[itemId]).toBeGreaterThan(city[itemId]!);
      expect(explore[itemId]).toBeGreaterThan(
        getVendorPrices("player_land").sell[itemId]!,
      );
    }
  });

  it("keeps farm staples cheaper at explore and seeds pricier (edge)", () => {
    expect(getVendorPrices("explore").sell.wheat!).toBeLessThan(
      getVendorPrices("city").sell.wheat!,
    );
    expect(getVendorPrices("explore").sell.flour!).toBeLessThan(
      getVendorPrices("city").sell.flour!,
    );
    expect(getVendorPrices("explore").buy.wheat_seed!).toBeGreaterThan(
      getVendorPrices("city").buy.wheat_seed!,
    );
  });

  it("README tip copy matches exploreRegionalVendorTip (failure if drift)", () => {
    const tip = exploreRegionalVendorTip();
    expect(tip).toMatch(/Exploration vendor/i);
    expect(tip).toMatch(/leather/i);
    expect(tip).toMatch(/more coins/i);
    expect(tip).toMatch(/City/i);
    expect(tip).toMatch(/seeds cost more/i);

    const readme = readFileSync(
      path.join(process.cwd(), "README.md"),
      "utf8",
    );
    expect(readme).toContain(tip);
  });
});
