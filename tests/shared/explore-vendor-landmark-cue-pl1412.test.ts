import { describe, expect, it } from "vitest";
import {
  CITY_COMMERCE_SERVICE_PAD,
  EXPLORE_BUILDINGS,
  EXPLORE_MINES_LANDMARK_CUE,
  EXPLORE_VENDOR_LANDMARK_CUE,
  EXPLORE_VENDOR_PREMIUM_SELL_ITEMS,
  exploreVendorLandmarkCue,
  exploreVendorLandmarkEmissiveIntensity,
  exploreVendorLandmarkHazeOpacity,
  exploreVendorLandmarkPulseEnvelope,
  exploreVendorLandmarkVsCityCommerceContrast,
  exploreVendorLandmarkVsMinesContrast,
  getVendorPrices,
} from "@game/shared";

/**
 * PL141.2 — Explore vendor soft landmark cue.
 * Choice: quiet warm stall haze/emissive on the existing Explore vendor so
 * regional trade reads at entry (complements vendor tip PL59.2 + premium glow
 * PL116.2); prices / layouts unchanged; no stall invent.
 */
describe("CityLands PL141.2 explore vendor soft landmark cue", () => {
  it("pulses warm stall haze on Explore vendor (happy)", () => {
    const cue = exploreVendorLandmarkCue("explore");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      EXPLORE_VENDOR_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(EXPLORE_VENDOR_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(EXPLORE_VENDOR_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(EXPLORE_VENDOR_LANDMARK_CUE.hazeRadius);

    const peak = exploreVendorLandmarkEmissiveIntensity(1);
    const floor = exploreVendorLandmarkEmissiveIntensity(0);
    expect(peak).toBe(EXPLORE_VENDOR_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(EXPLORE_VENDOR_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = exploreVendorLandmarkHazeOpacity(1);
    const hazeFloor = exploreVendorLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off Explore; warm vs mines / city commerce (edge)", () => {
    expect(exploreVendorLandmarkCue("city").show).toBe(false);
    expect(exploreVendorLandmarkCue("player_land").show).toBe(false);
    expect(exploreVendorLandmarkCue("warrior").show).toBe(false);
    expect(exploreVendorLandmarkCue("city").intensity).toBe(0);
    expect(exploreVendorLandmarkCue("city").hazeOpacity).toBe(0);

    expect(exploreVendorLandmarkVsMinesContrast()).toBeGreaterThan(80);
    expect(exploreVendorLandmarkVsCityCommerceContrast()).toBeGreaterThan(0);
    expect(EXPLORE_VENDOR_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_MINES_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(EXPLORE_VENDOR_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_COMMERCE_SERVICE_PAD.vendor.padColor.toLowerCase(),
    );

    const low = exploreVendorLandmarkPulseEnvelope(0);
    const mid = exploreVendorLandmarkPulseEnvelope(
      EXPLORE_VENDOR_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent stalls or change Explore prices (failure)", () => {
    expect(EXPLORE_BUILDINGS.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    expect(
      EXPLORE_BUILDINGS.filter((b) => b.type === "vendor_stall"),
    ).toHaveLength(0);

    const explore = getVendorPrices("explore");
    const city = getVendorPrices("city");
    expect(explore.sell.wood).toBeGreaterThan(city.sell.wood ?? 0);
    expect(explore.sell.iron_ore).toBeGreaterThan(city.sell.iron_ore ?? 0);
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain("wood");
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain("iron_ore");

    expect(exploreVendorLandmarkEmissiveIntensity(2)).toBe(
      EXPLORE_VENDOR_LANDMARK_CUE.intensityPeak,
    );
    expect(exploreVendorLandmarkEmissiveIntensity(-1)).toBe(
      EXPLORE_VENDOR_LANDMARK_CUE.intensityBase,
    );
    expect(exploreVendorLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(EXPLORE_VENDOR_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(EXPLORE_VENDOR_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat/i,
    );
  });
});
