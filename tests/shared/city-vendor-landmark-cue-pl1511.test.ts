import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_COMMERCE_SERVICE_PAD,
  CITY_MARKET_BOARD_LANDMARK_CUE,
  CITY_VENDOR_LANDMARK_CUE,
  EXPLORE_VENDOR_LANDMARK_CUE,
  cityVendorLandmarkCue,
  cityVendorLandmarkEmissiveIntensity,
  cityVendorLandmarkHazeOpacity,
  cityVendorLandmarkPulseEnvelope,
  cityVendorLandmarkVsCommercePadContrast,
  cityVendorLandmarkVsExploreVendorContrast,
  cityVendorLandmarkVsMarketBoardContrast,
  getVendorPrices,
} from "@game/shared";

/**
 * PL151.1 — City vendor soft landmark cue.
 * Choice: quiet warm stall haze/emissive on the existing City vendor so hub
 * NPC trade reads at glance (complements Explore stall PL141.2 + market board
 * PL150.2 + commerce pad PL117.1); prices / layouts unchanged; no stall invent.
 */
describe("CityLands PL151.1 city vendor soft landmark cue", () => {
  it("pulses warm stall haze on City vendor (happy)", () => {
    const cue = cityVendorLandmarkCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_VENDOR_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_VENDOR_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CITY_VENDOR_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(CITY_VENDOR_LANDMARK_CUE.hazeRadius);

    const peak = cityVendorLandmarkEmissiveIntensity(1);
    const floor = cityVendorLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_VENDOR_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_VENDOR_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityVendorLandmarkHazeOpacity(1);
    const hazeFloor = cityVendorLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; hub honey ≠ Explore / market / pad alone (edge)", () => {
    expect(cityVendorLandmarkCue("explore").show).toBe(false);
    expect(cityVendorLandmarkCue("player_land").show).toBe(false);
    expect(cityVendorLandmarkCue("warrior").show).toBe(false);
    expect(cityVendorLandmarkCue("explore").intensity).toBe(0);
    expect(cityVendorLandmarkCue("explore").hazeOpacity).toBe(0);

    expect(cityVendorLandmarkVsExploreVendorContrast()).toBeGreaterThan(0);
    expect(cityVendorLandmarkVsMarketBoardContrast()).toBeGreaterThan(0);
    expect(cityVendorLandmarkVsCommercePadContrast()).toBeGreaterThan(0);
    expect(CITY_VENDOR_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_VENDOR_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_VENDOR_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_MARKET_BOARD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_VENDOR_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_COMMERCE_SERVICE_PAD.vendor.padColor.toLowerCase(),
    );

    const low = cityVendorLandmarkPulseEnvelope(0);
    const mid = cityVendorLandmarkPulseEnvelope(
      CITY_VENDOR_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent stalls or change City prices (failure)", () => {
    expect(CITY_BUILDINGS.some((b) => b.type === "vendor_stall")).toBe(true);
    expect(
      CITY_BUILDINGS.filter((b) => b.type === "vendor_stall"),
    ).toHaveLength(1);

    const city = getVendorPrices("city");
    const explore = getVendorPrices("explore");
    expect(city.sell.wood).toBeLessThan(explore.sell.wood ?? 0);
    expect(city.buy.wheat_seed).toBeGreaterThan(0);

    expect(cityVendorLandmarkEmissiveIntensity(2)).toBe(
      CITY_VENDOR_LANDMARK_CUE.intensityPeak,
    );
    expect(cityVendorLandmarkEmissiveIntensity(-1)).toBe(
      CITY_VENDOR_LANDMARK_CUE.intensityBase,
    );
    expect(cityVendorLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_VENDOR_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_VENDOR_LANDMARK_CUE.emissive)).not.toMatch(/nft|combat/i);
  });
});
