import { describe, expect, it } from "vitest";
import {
  CITY_COMMERCE_SERVICE_PAD,
  CITY_MARKET_BOARD_ATMOSPHERE_CUE,
  CITY_MARKET_BOARD_LANDMARK_CUE,
  EXPLORE_VENDOR_LANDMARK_CUE,
  cityMarketBoardAtmosphereCue,
  cityMarketBoardAtmosphereEmissiveIntensity,
  cityMarketBoardAtmosphereHazeOpacity,
  cityMarketBoardAtmospherePulseEnvelope,
  cityMarketBoardAtmosphereVsCommercePadContrast,
  cityMarketBoardAtmosphereVsExploreVendorContrast,
  cityMarketBoardAtmosphereVsLandmarkContrast,
} from "@game/shared";

/**
 * PL186.2 — City market-board soft atmosphere leftover.
 * Choice: quiet warm pulsing parchment mist over existing market board pad
 * while on City (complements board landmark + commerce pad; prices unchanged).
 */
describe("CityLands PL186.2 city market-board soft atmosphere leftover", () => {
  it("pulses quiet warm parchment mist while on City (happy)", () => {
    const cue = cityMarketBoardAtmosphereCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_MARKET_BOARD_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(
      CITY_MARKET_BOARD_ATMOSPHERE_CUE.hazeOpacityBase,
    );
    expect(cue.hazeRadius).toBe(CITY_MARKET_BOARD_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(CITY_MARKET_BOARD_ATMOSPHERE_CUE.hazeY);

    const peak = cityMarketBoardAtmosphereEmissiveIntensity(1);
    const floor = cityMarketBoardAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(CITY_MARKET_BOARD_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(CITY_MARKET_BOARD_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityMarketBoardAtmosphereHazeOpacity(1);
    const hazeFloor = cityMarketBoardAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; mist ≠ landmark / pad / Explore stall (edge)", () => {
    expect(cityMarketBoardAtmosphereCue("warrior").show).toBe(false);
    expect(cityMarketBoardAtmosphereCue("explore").show).toBe(false);
    expect(cityMarketBoardAtmosphereCue("player_land").show).toBe(false);
    expect(cityMarketBoardAtmosphereCue(null).show).toBe(false);
    expect(cityMarketBoardAtmosphereCue("").show).toBe(false);
    expect(cityMarketBoardAtmosphereCue("warrior").intensity).toBe(0);
    expect(cityMarketBoardAtmosphereCue("warrior").hazeOpacity).toBe(0);

    expect(cityMarketBoardAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(cityMarketBoardAtmosphereVsCommercePadContrast()).toBeGreaterThan(0);
    expect(cityMarketBoardAtmosphereVsExploreVendorContrast()).toBeGreaterThan(
      0,
    );
    expect(CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_MARKET_BOARD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_COMMERCE_SERVICE_PAD.market.padColor.toLowerCase(),
    );
    expect(CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_VENDOR_LANDMARK_CUE.emissive.toLowerCase(),
    );

    // Wider / slower / quieter leftover mist vs board landmark disc.
    expect(CITY_MARKET_BOARD_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_MARKET_BOARD_LANDMARK_CUE.hazeRadius,
    );
    expect(CITY_MARKET_BOARD_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_MARKET_BOARD_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(CITY_MARKET_BOARD_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_MARKET_BOARD_LANDMARK_CUE.intensityPeak,
    );

    const low = cityMarketBoardAtmospherePulseEnvelope(0);
    const mid = cityMarketBoardAtmospherePulseEnvelope(
      CITY_MARKET_BOARD_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent prices or NFT combat (failure)", () => {
    expect(cityMarketBoardAtmosphereEmissiveIntensity(2)).toBe(
      CITY_MARKET_BOARD_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(cityMarketBoardAtmosphereEmissiveIntensity(-1)).toBe(
      CITY_MARKET_BOARD_ATMOSPHERE_CUE.intensityBase,
    );
    expect(cityMarketBoardAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(
      CITY_MARKET_BOARD_ATMOSPHERE_CUE.hazeOpacityPeak,
    ).toBeLessThanOrEqual(1);
    expect(CITY_MARKET_BOARD_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(CITY_MARKET_BOARD_ATMOSPHERE_CUE.hazeRadius).toBeLessThanOrEqual(2.5);
    expect(String(CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|price|fare/i,
    );
  });
});
