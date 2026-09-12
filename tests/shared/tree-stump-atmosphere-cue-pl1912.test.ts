import { describe, expect, it } from "vitest";
import {
  CITY_TREE_STUMP_LANDMARK_CUE,
  GATHER_NODE_DEPLETED_CUE,
  TREE_STUMP_ATMOSPHERE_CUE,
  WOOD_STUMP,
  treeStumpAtmosphereCue,
  treeStumpAtmosphereEmissiveIntensity,
  treeStumpAtmosphereHazeOpacity,
  treeStumpAtmospherePulseEnvelope,
  treeStumpAtmosphereVsCityLandmarkContrast,
  treeStumpAtmosphereVsReadyTopContrast,
} from "@game/shared";

/**
 * PL191.2 — Tree-stump soft atmosphere leftover.
 * Choice: quiet cool pulsing wood mist over existing tree stump on player land
 * (complements ready / depleted PL12.2 + City landmark PL171.2; chop cooldown SoT).
 * City kinship covered by landmark alone — distinct leftover, not duplicate stack.
 */
describe("CityLands PL191.2 tree-stump soft atmosphere leftover", () => {
  it("pulses quiet cool wood mist on player land (happy)", () => {
    const cue = treeStumpAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      TREE_STUMP_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(TREE_STUMP_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(TREE_STUMP_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(TREE_STUMP_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(TREE_STUMP_ATMOSPHERE_CUE.hazeY);

    const peak = treeStumpAtmosphereEmissiveIntensity(1);
    const floor = treeStumpAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(TREE_STUMP_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(TREE_STUMP_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = treeStumpAtmosphereHazeOpacity(1);
    const hazeFloor = treeStumpAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; mist ≠ City landmark / ready top (edge)", () => {
    expect(treeStumpAtmosphereCue("city").show).toBe(false);
    expect(treeStumpAtmosphereCue("explore").show).toBe(false);
    expect(treeStumpAtmosphereCue("warrior").show).toBe(false);
    expect(treeStumpAtmosphereCue(null).show).toBe(false);
    expect(treeStumpAtmosphereCue("city").intensity).toBe(0);

    expect(treeStumpAtmosphereVsCityLandmarkContrast()).toBeGreaterThan(0);
    expect(treeStumpAtmosphereVsReadyTopContrast()).toBeGreaterThan(0);
    expect(TREE_STUMP_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_TREE_STUMP_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(TREE_STUMP_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      GATHER_NODE_DEPLETED_CUE.stumpReadyTop.toLowerCase(),
    );

    expect(TREE_STUMP_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_TREE_STUMP_LANDMARK_CUE.hazeRadius,
    );
    expect(TREE_STUMP_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_TREE_STUMP_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(TREE_STUMP_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_TREE_STUMP_LANDMARK_CUE.intensityPeak,
    );

    const low = treeStumpAtmospherePulseEnvelope(0);
    const mid = treeStumpAtmospherePulseEnvelope(
      TREE_STUMP_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent chop cooldown / yields or NFT combat (failure)", () => {
    expect(WOOD_STUMP.cooldownMs).toBe(75_000);
    expect(WOOD_STUMP.yieldItemId).toBe("wood");
    expect(WOOD_STUMP.yieldQty).toBe(1);

    expect(treeStumpAtmosphereEmissiveIntensity(2)).toBe(
      TREE_STUMP_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(treeStumpAtmosphereEmissiveIntensity(-1)).toBe(
      TREE_STUMP_ATMOSPHERE_CUE.intensityBase,
    );
    expect(treeStumpAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(TREE_STUMP_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(TREE_STUMP_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(TREE_STUMP_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|yield|cooldown/i,
    );
  });
});
