import { describe, expect, it } from "vitest";
import {
  CITY_ORE_NODE_LANDMARK_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  CITY_TREE_STUMP_LANDMARK_CUE,
  GATHER_NODE_DEPLETED_CUE,
  ORE_NODE,
  cityOreNodeLandmarkCue,
  cityOreNodeLandmarkEmissiveIntensity,
  cityOreNodeLandmarkHazeOpacity,
  cityOreNodeLandmarkPulseEnvelope,
  cityOreNodeLandmarkVsFreeStickyContrast,
  cityOreNodeLandmarkVsReadyContrast,
  cityOreNodeLandmarkVsTreeStumpContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL172.1 — City ore-node soft landmark cue leftover.
 * Choice: quiet cool mineral haze/emissive on existing city scarce ore_node
 * while on City (complements ore ready + Free/Busy pads; yields unchanged).
 * Continuous landmark on City only; ready / Explore premium stay their own cues.
 */
describe("CityLands PL172.1 city ore-node soft landmark cue leftover", () => {
  it("pulses quiet cool mineral haze on City scarce ore (happy)", () => {
    const cue = cityOreNodeLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_ORE_NODE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_ORE_NODE_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_ORE_NODE_LANDMARK_CUE.hazeOpacityBase : 0);
    expect(cue.hazeRadius).toBe(CITY_ORE_NODE_LANDMARK_CUE.hazeRadius);
    expect(CITY_SCARCE_STATION_TYPES).toContain("ore_node");

    const peak = cityOreNodeLandmarkEmissiveIntensity(1);
    const floor = cityOreNodeLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_ORE_NODE_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_ORE_NODE_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityOreNodeLandmarkHazeOpacity(1);
    const hazeFloor = cityOreNodeLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; cool mineral ≠ ready / Free / stump (edge)", () => {
    expect(cityOreNodeLandmarkCue("player_land").show).toBe(false);
    expect(cityOreNodeLandmarkCue("explore").show).toBe(false);
    expect(cityOreNodeLandmarkCue("warrior").show).toBe(false);
    expect(cityOreNodeLandmarkCue(null).show).toBe(false);
    expect(cityOreNodeLandmarkCue("").show).toBe(false);
    expect(cityOreNodeLandmarkCue("player_land").intensity).toBe(0);
    expect(cityOreNodeLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityOreNodeLandmarkVsReadyContrast()).toBeGreaterThan(0);
    expect(cityOreNodeLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(cityOreNodeLandmarkVsTreeStumpContrast()).toBeGreaterThan(0);
    expect(CITY_ORE_NODE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      GATHER_NODE_DEPLETED_CUE.oreReadyRock.toLowerCase(),
    );
    expect(CITY_ORE_NODE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_ORE_NODE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_TREE_STUMP_LANDMARK_CUE.emissive.toLowerCase(),
    );

    expect(CITY_ORE_NODE_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(CITY_ORE_NODE_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(2000);

    const low = cityOreNodeLandmarkPulseEnvelope(0);
    const mid = cityOreNodeLandmarkPulseEnvelope(
      CITY_ORE_NODE_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent yields, combat, or NFT power (failure)", () => {
    expect(ORE_NODE.yieldQty).toBe(1);
    expect(ORE_NODE.cooldownMs).toBe(90_000);
    expect(ORE_NODE.xp).toBe(5);
    expect(cityOreNodeLandmarkEmissiveIntensity(2)).toBe(
      CITY_ORE_NODE_LANDMARK_CUE.intensityPeak,
    );
    expect(cityOreNodeLandmarkEmissiveIntensity(-1)).toBe(
      CITY_ORE_NODE_LANDMARK_CUE.intensityBase,
    );
    expect(cityOreNodeLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_ORE_NODE_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_ORE_NODE_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|yield/i,
    );
    expect(CITY_ORE_NODE_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
