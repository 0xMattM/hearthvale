import { describe, expect, it } from "vitest";
import {
  CITY_FISHING_DOCK_LANDMARK_CUE,
  FISHING_DOCK,
  FISHING_DOCK_ATMOSPHERE_CUE,
  FISHING_DOCK_READY_WATER_SHIMMER,
  fishingDockAtmosphereCue,
  fishingDockAtmosphereEmissiveIntensity,
  fishingDockAtmosphereHazeOpacity,
  fishingDockAtmospherePulseEnvelope,
  fishingDockAtmosphereVsLandmarkContrast,
  fishingDockAtmosphereVsReadyShimmerContrast,
} from "@game/shared";

/**
 * PL190.2 — Fishing-dock soft atmosphere leftover.
 * Choice: quiet cool pulsing water mist over existing dock on City or player
 * land (complements City landmark PL169.1 + ready shimmer PL118.2; catch rates
 * unchanged). City kinship covered by distinct leftover layer (not duplicate).
 */
describe("CityLands PL190.2 fishing-dock soft atmosphere leftover", () => {
  it("pulses quiet cool water mist on City and player land (happy)", () => {
    const city = fishingDockAtmosphereCue("city");
    expect(city.show).toBe(true);
    expect(city.emissive.toLowerCase()).toBe(
      FISHING_DOCK_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(city.intensity).toBe(FISHING_DOCK_ATMOSPHERE_CUE.intensityBase);
    expect(city.hazeOpacity).toBe(FISHING_DOCK_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(city.hazeRadius).toBe(FISHING_DOCK_ATMOSPHERE_CUE.hazeRadius);
    expect(city.hazeY).toBe(FISHING_DOCK_ATMOSPHERE_CUE.hazeY);

    const land = fishingDockAtmosphereCue("player_land");
    expect(land.show).toBe(true);

    const peak = fishingDockAtmosphereEmissiveIntensity(1);
    const floor = fishingDockAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(FISHING_DOCK_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(FISHING_DOCK_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = fishingDockAtmosphereHazeOpacity(1);
    const hazeFloor = fishingDockAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City/player land; mist ≠ landmark / ready shimmer (edge)", () => {
    expect(fishingDockAtmosphereCue("explore").show).toBe(false);
    expect(fishingDockAtmosphereCue("warrior").show).toBe(false);
    expect(fishingDockAtmosphereCue(null).show).toBe(false);
    expect(fishingDockAtmosphereCue("explore").intensity).toBe(0);

    expect(fishingDockAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(fishingDockAtmosphereVsReadyShimmerContrast()).toBeGreaterThan(0);
    expect(FISHING_DOCK_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_FISHING_DOCK_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(FISHING_DOCK_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      FISHING_DOCK_READY_WATER_SHIMMER.waterEmissive.toLowerCase(),
    );

    expect(FISHING_DOCK_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_FISHING_DOCK_LANDMARK_CUE.hazeRadius,
    );
    expect(FISHING_DOCK_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_FISHING_DOCK_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(FISHING_DOCK_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_FISHING_DOCK_LANDMARK_CUE.intensityPeak,
    );

    const low = fishingDockAtmospherePulseEnvelope(0);
    const mid = fishingDockAtmospherePulseEnvelope(
      FISHING_DOCK_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent catch rates or NFT combat (failure)", () => {
    expect(FISHING_DOCK.cooldownMs).toBeGreaterThan(0);
    expect(FISHING_DOCK.yieldQty).toBeGreaterThan(0);

    expect(fishingDockAtmosphereEmissiveIntensity(2)).toBe(
      FISHING_DOCK_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(fishingDockAtmosphereEmissiveIntensity(-1)).toBe(
      FISHING_DOCK_ATMOSPHERE_CUE.intensityBase,
    );
    expect(fishingDockAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(FISHING_DOCK_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(FISHING_DOCK_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(FISHING_DOCK_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|catch|rate/i,
    );
  });
});
