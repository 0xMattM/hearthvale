import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_COMMERCE_SERVICE_PAD,
  CITY_MARKET_BOARD_LANDMARK_CUE,
  EXPLORE_VENDOR_LANDMARK_CUE,
  cityMarketBoardLandmarkCue,
  cityMarketBoardLandmarkEmissiveIntensity,
  cityMarketBoardLandmarkHazeOpacity,
  cityMarketBoardLandmarkPulseEnvelope,
  cityMarketBoardLandmarkVsCommercePadContrast,
  cityMarketBoardLandmarkVsExploreVendorContrast,
} from "@game/shared";

/**
 * PL150.2 — City market board soft landmark cue.
 * Choice: quiet warm listing haze/emissive on the existing city market board
 * so hub trade reads at glance (complements market tip PL59.1 + commerce pad
 * PL117.1); prices / layouts unchanged; no board invent.
 */
describe("CityLands PL150.2 city market board soft landmark cue", () => {
  it("pulses warm listing haze on City market board (happy)", () => {
    const cue = cityMarketBoardLandmarkCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_MARKET_BOARD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_MARKET_BOARD_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CITY_MARKET_BOARD_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(CITY_MARKET_BOARD_LANDMARK_CUE.hazeRadius);

    const peak = cityMarketBoardLandmarkEmissiveIntensity(1);
    const floor = cityMarketBoardLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_MARKET_BOARD_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_MARKET_BOARD_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityMarketBoardLandmarkHazeOpacity(1);
    const hazeFloor = cityMarketBoardLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; listing gold ≠ Explore stall / pad alone (edge)", () => {
    expect(cityMarketBoardLandmarkCue("explore").show).toBe(false);
    expect(cityMarketBoardLandmarkCue("player_land").show).toBe(false);
    expect(cityMarketBoardLandmarkCue("warrior").show).toBe(false);
    expect(cityMarketBoardLandmarkCue("explore").intensity).toBe(0);
    expect(cityMarketBoardLandmarkCue("explore").hazeOpacity).toBe(0);

    expect(cityMarketBoardLandmarkVsExploreVendorContrast()).toBeGreaterThan(0);
    expect(cityMarketBoardLandmarkVsCommercePadContrast()).toBeGreaterThan(0);
    expect(CITY_MARKET_BOARD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_VENDOR_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_MARKET_BOARD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_COMMERCE_SERVICE_PAD.market.padColor.toLowerCase(),
    );

    const low = cityMarketBoardLandmarkPulseEnvelope(0);
    const mid = cityMarketBoardLandmarkPulseEnvelope(
      CITY_MARKET_BOARD_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent boards or change City layouts (failure)", () => {
    expect(CITY_BUILDINGS.some((b) => b.type === "market_board")).toBe(true);
    expect(
      CITY_BUILDINGS.filter((b) => b.type === "market_board"),
    ).toHaveLength(1);

    expect(cityMarketBoardLandmarkEmissiveIntensity(2)).toBe(
      CITY_MARKET_BOARD_LANDMARK_CUE.intensityPeak,
    );
    expect(cityMarketBoardLandmarkEmissiveIntensity(-1)).toBe(
      CITY_MARKET_BOARD_LANDMARK_CUE.intensityBase,
    );
    expect(cityMarketBoardLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_MARKET_BOARD_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(String(CITY_MARKET_BOARD_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat/i,
    );
  });
});
