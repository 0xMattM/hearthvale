import { describe, expect, it } from "vitest";
import {
  CITY_COMMERCE_SERVICE_PAD,
  CITY_MARKET_BOARD_ATMOSPHERE_CUE,
  CITY_VENDOR_ATMOSPHERE_CUE,
  CITY_VENDOR_LANDMARK_CUE,
  EXPLORE_VENDOR_LANDMARK_CUE,
  cityVendorAtmosphereCue,
  cityVendorAtmosphereEmissiveIntensity,
  cityVendorAtmosphereHazeOpacity,
  cityVendorAtmospherePulseEnvelope,
  cityVendorAtmosphereVsCommercePadContrast,
  cityVendorAtmosphereVsExploreVendorContrast,
  cityVendorAtmosphereVsLandmarkContrast,
  cityVendorAtmosphereVsMarketBoardAtmosphereContrast,
  getVendorPrices,
} from "@game/shared";

/**
 * PL187.1 — City vendor soft atmosphere leftover.
 * Choice: quiet warm pulsing stall mist over existing City vendor pad while on
 * City (complements stall landmark PL151.1; ≠ duplicate landmark honey-copper;
 * prices unchanged).
 */
describe("CityLands PL187.1 city vendor soft atmosphere leftover", () => {
  it("pulses quiet warm stall mist while on City (happy)", () => {
    const cue = cityVendorAtmosphereCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_VENDOR_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_VENDOR_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CITY_VENDOR_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(CITY_VENDOR_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(CITY_VENDOR_ATMOSPHERE_CUE.hazeY);

    const peak = cityVendorAtmosphereEmissiveIntensity(1);
    const floor = cityVendorAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(CITY_VENDOR_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(CITY_VENDOR_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityVendorAtmosphereHazeOpacity(1);
    const hazeFloor = cityVendorAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; mist ≠ landmark / pad / Explore / board mist (edge)", () => {
    expect(cityVendorAtmosphereCue("warrior").show).toBe(false);
    expect(cityVendorAtmosphereCue("explore").show).toBe(false);
    expect(cityVendorAtmosphereCue("player_land").show).toBe(false);
    expect(cityVendorAtmosphereCue(null).show).toBe(false);
    expect(cityVendorAtmosphereCue("").show).toBe(false);
    expect(cityVendorAtmosphereCue("warrior").intensity).toBe(0);
    expect(cityVendorAtmosphereCue("warrior").hazeOpacity).toBe(0);

    expect(cityVendorAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(cityVendorAtmosphereVsCommercePadContrast()).toBeGreaterThan(0);
    expect(cityVendorAtmosphereVsExploreVendorContrast()).toBeGreaterThan(0);
    expect(
      cityVendorAtmosphereVsMarketBoardAtmosphereContrast(),
    ).toBeGreaterThan(0);
    expect(CITY_VENDOR_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_VENDOR_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_VENDOR_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_COMMERCE_SERVICE_PAD.vendor.padColor.toLowerCase(),
    );
    expect(CITY_VENDOR_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_VENDOR_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_VENDOR_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );

    // Wider / slower / quieter leftover mist vs stall landmark disc.
    expect(CITY_VENDOR_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_VENDOR_LANDMARK_CUE.hazeRadius,
    );
    expect(CITY_VENDOR_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_VENDOR_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(CITY_VENDOR_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_VENDOR_LANDMARK_CUE.intensityPeak,
    );

    const low = cityVendorAtmospherePulseEnvelope(0);
    const mid = cityVendorAtmospherePulseEnvelope(
      CITY_VENDOR_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent prices or NFT combat (failure)", () => {
    const city = getVendorPrices("city");
    expect(city.buy.wheat_seed).toBeGreaterThan(0);
    expect(city.sell.wood).toBeGreaterThan(0);

    expect(cityVendorAtmosphereEmissiveIntensity(2)).toBe(
      CITY_VENDOR_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(cityVendorAtmosphereEmissiveIntensity(-1)).toBe(
      CITY_VENDOR_ATMOSPHERE_CUE.intensityBase,
    );
    expect(cityVendorAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_VENDOR_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(CITY_VENDOR_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(CITY_VENDOR_ATMOSPHERE_CUE.hazeRadius).toBeLessThanOrEqual(2.5);
    expect(String(CITY_VENDOR_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|price|fare/i,
    );
  });
});
