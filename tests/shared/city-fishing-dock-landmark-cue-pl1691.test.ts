import { describe, expect, it } from "vitest";
import {
  CITY_FISHING_DOCK_LANDMARK_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  FISHING_DOCK_READY_WATER_SHIMMER,
  cityFishingDockLandmarkCue,
  cityFishingDockLandmarkEmissiveIntensity,
  cityFishingDockLandmarkHazeOpacity,
  cityFishingDockLandmarkPulseEnvelope,
  cityFishingDockLandmarkVsFreeStickyContrast,
  cityFishingDockLandmarkVsReadyShimmerContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL169.1 — City fishing-dock soft landmark cue leftover.
 * Choice: quiet cool water haze/emissive on existing city scarce fishing_dock
 * while on City (complements dock tip + Free/Busy pads; catch rates unchanged).
 * Continuous landmark on City only; ready shimmer / pads stay their own cues.
 */
describe("CityLands PL169.1 city fishing-dock soft landmark cue leftover", () => {
  it("pulses quiet cool water haze on City scarce fishing dock (happy)", () => {
    const cue = cityFishingDockLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_FISHING_DOCK_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_FISHING_DOCK_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_FISHING_DOCK_LANDMARK_CUE.hazeOpacityBase : 0);
    expect(cue.hazeRadius).toBe(CITY_FISHING_DOCK_LANDMARK_CUE.hazeRadius);
    expect(CITY_SCARCE_STATION_TYPES).toContain("fishing_dock");

    const peak = cityFishingDockLandmarkEmissiveIntensity(1);
    const floor = cityFishingDockLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_FISHING_DOCK_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_FISHING_DOCK_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityFishingDockLandmarkHazeOpacity(1);
    const hazeFloor = cityFishingDockLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; cool water ≠ ready shimmer / Free sticky (edge)", () => {
    expect(cityFishingDockLandmarkCue("player_land").show).toBe(false);
    expect(cityFishingDockLandmarkCue("explore").show).toBe(false);
    expect(cityFishingDockLandmarkCue("warrior").show).toBe(false);
    expect(cityFishingDockLandmarkCue(null).show).toBe(false);
    expect(cityFishingDockLandmarkCue("").show).toBe(false);
    expect(cityFishingDockLandmarkCue("player_land").intensity).toBe(0);
    expect(cityFishingDockLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityFishingDockLandmarkVsReadyShimmerContrast()).toBeGreaterThan(0);
    expect(cityFishingDockLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(CITY_FISHING_DOCK_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      FISHING_DOCK_READY_WATER_SHIMMER.waterEmissive.toLowerCase(),
    );
    expect(CITY_FISHING_DOCK_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );

    // Continuous landmark stays quieter / slower than ready shimmer.
    expect(CITY_FISHING_DOCK_LANDMARK_CUE.intensityPeak).toBeLessThan(
      FISHING_DOCK_READY_WATER_SHIMMER.intensityPeak,
    );
    expect(CITY_FISHING_DOCK_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      FISHING_DOCK_READY_WATER_SHIMMER.shimmerPeriodMs,
    );

    const low = cityFishingDockLandmarkPulseEnvelope(0);
    const mid = cityFishingDockLandmarkPulseEnvelope(
      CITY_FISHING_DOCK_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent catch rates or NFT combat (failure)", () => {
    expect(cityFishingDockLandmarkEmissiveIntensity(2)).toBe(
      CITY_FISHING_DOCK_LANDMARK_CUE.intensityPeak,
    );
    expect(cityFishingDockLandmarkEmissiveIntensity(-1)).toBe(
      CITY_FISHING_DOCK_LANDMARK_CUE.intensityBase,
    );
    expect(cityFishingDockLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_FISHING_DOCK_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(String(CITY_FISHING_DOCK_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|catch.?rate/i,
    );
    expect(CITY_FISHING_DOCK_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
