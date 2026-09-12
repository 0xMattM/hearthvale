import { describe, expect, it } from "vitest";
import {
  CITY_CROP_PLOT_LANDMARK_CUE,
  CITY_FISHING_DOCK_LANDMARK_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  CITY_TREE_STUMP_LANDMARK_CUE,
  GATHER_NODE_DEPLETED_CUE,
  WOOD_STUMP,
  cityTreeStumpLandmarkCue,
  cityTreeStumpLandmarkEmissiveIntensity,
  cityTreeStumpLandmarkHazeOpacity,
  cityTreeStumpLandmarkPulseEnvelope,
  cityTreeStumpLandmarkVsCropContrast,
  cityTreeStumpLandmarkVsDockContrast,
  cityTreeStumpLandmarkVsFreeStickyContrast,
  cityTreeStumpLandmarkVsReadyContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL171.2 — City tree-stump soft landmark cue leftover.
 * Choice: quiet cool woodland haze/emissive on existing city scarce tree_stump
 * while on City (complements gather ready + Free/Busy pads; yields unchanged).
 * Continuous landmark on City only; ready / Explore premium stay their own cues.
 */
describe("CityLands PL171.2 city tree-stump soft landmark cue leftover", () => {
  it("pulses quiet cool woodland haze on City scarce stump (happy)", () => {
    const cue = cityTreeStumpLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_TREE_STUMP_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_TREE_STUMP_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_TREE_STUMP_LANDMARK_CUE.hazeOpacityBase : 0);
    expect(cue.hazeRadius).toBe(CITY_TREE_STUMP_LANDMARK_CUE.hazeRadius);
    expect(CITY_SCARCE_STATION_TYPES).toContain("tree_stump");

    const peak = cityTreeStumpLandmarkEmissiveIntensity(1);
    const floor = cityTreeStumpLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_TREE_STUMP_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_TREE_STUMP_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityTreeStumpLandmarkHazeOpacity(1);
    const hazeFloor = cityTreeStumpLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; cool woodland ≠ ready / Free / crop / dock (edge)", () => {
    expect(cityTreeStumpLandmarkCue("player_land").show).toBe(false);
    expect(cityTreeStumpLandmarkCue("explore").show).toBe(false);
    expect(cityTreeStumpLandmarkCue("warrior").show).toBe(false);
    expect(cityTreeStumpLandmarkCue(null).show).toBe(false);
    expect(cityTreeStumpLandmarkCue("").show).toBe(false);
    expect(cityTreeStumpLandmarkCue("player_land").intensity).toBe(0);
    expect(cityTreeStumpLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityTreeStumpLandmarkVsReadyContrast()).toBeGreaterThan(0);
    expect(cityTreeStumpLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(cityTreeStumpLandmarkVsCropContrast()).toBeGreaterThan(0);
    expect(cityTreeStumpLandmarkVsDockContrast()).toBeGreaterThan(0);
    expect(CITY_TREE_STUMP_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      GATHER_NODE_DEPLETED_CUE.stumpReadyTop.toLowerCase(),
    );
    expect(CITY_TREE_STUMP_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_TREE_STUMP_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_CROP_PLOT_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_TREE_STUMP_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_FISHING_DOCK_LANDMARK_CUE.emissive.toLowerCase(),
    );

    expect(CITY_TREE_STUMP_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(CITY_TREE_STUMP_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(2000);

    const low = cityTreeStumpLandmarkPulseEnvelope(0);
    const mid = cityTreeStumpLandmarkPulseEnvelope(
      CITY_TREE_STUMP_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent yields, combat, or NFT power (failure)", () => {
    expect(WOOD_STUMP.yieldQty).toBe(1);
    expect(WOOD_STUMP.cooldownMs).toBe(75_000);
    expect(WOOD_STUMP.xp).toBe(5);
    expect(cityTreeStumpLandmarkEmissiveIntensity(2)).toBe(
      CITY_TREE_STUMP_LANDMARK_CUE.intensityPeak,
    );
    expect(cityTreeStumpLandmarkEmissiveIntensity(-1)).toBe(
      CITY_TREE_STUMP_LANDMARK_CUE.intensityBase,
    );
    expect(cityTreeStumpLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_TREE_STUMP_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_TREE_STUMP_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|yield/i,
    );
    expect(CITY_TREE_STUMP_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
