import { describe, expect, it } from "vitest";
import {
  EMPTY_HOMESTEAD_PATH_CUE,
  HOMESTEAD_FENCE_LANDMARK_CUE,
  HOMESTEAD_YARD_VISUAL,
  HOUSING_DECOR_LANDMARK_CUE,
  LIVED_HOMESTEAD_PATH_CUE,
  VISIT_LAND_ATMOSPHERE_CUE,
  homesteadFenceLandmarkCue,
  homesteadFenceLandmarkEmissiveIntensity,
  homesteadFenceLandmarkHazeOpacity,
  homesteadFenceLandmarkPulseEnvelope,
  homesteadFenceLandmarkVsDecorContrast,
  homesteadFenceLandmarkVsEmptyPathContrast,
  homesteadFenceLandmarkVsLivedPathContrast,
  homesteadYardFloorColors,
} from "@game/shared";

/**
 * PL176.2 — Homestead fence soft landmark cue leftover.
 * Choice: quiet cool fence-post haze/emissive on existing homestead fence while
 * on player land (complements yard atmosphere + path cues; layouts unchanged).
 * Continuous landmark on player land only.
 */
describe("CityLands PL176.2 homestead fence soft landmark cue leftover", () => {
  it("pulses quiet cool fence-post haze on player-land fence (happy)", () => {
    const cue = homesteadFenceLandmarkCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      HOMESTEAD_FENCE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(HOMESTEAD_FENCE_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(HOMESTEAD_FENCE_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(HOMESTEAD_FENCE_LANDMARK_CUE.hazeRadius);

    const peak = homesteadFenceLandmarkEmissiveIntensity(1);
    const floor = homesteadFenceLandmarkEmissiveIntensity(0);
    expect(peak).toBe(HOMESTEAD_FENCE_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(HOMESTEAD_FENCE_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = homesteadFenceLandmarkHazeOpacity(1);
    const hazeFloor = homesteadFenceLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; cool fence ≠ decor / path / visit (edge)", () => {
    expect(homesteadFenceLandmarkCue("city").show).toBe(false);
    expect(homesteadFenceLandmarkCue("explore").show).toBe(false);
    expect(homesteadFenceLandmarkCue("warrior").show).toBe(false);
    expect(homesteadFenceLandmarkCue(null).show).toBe(false);
    expect(homesteadFenceLandmarkCue("").show).toBe(false);
    expect(homesteadFenceLandmarkCue("city").intensity).toBe(0);
    expect(homesteadFenceLandmarkCue("city").hazeOpacity).toBe(0);
    // Reason: legacy starter alias still maps to player land.
    expect(homesteadFenceLandmarkCue("starter").show).toBe(true);

    expect(homesteadFenceLandmarkVsDecorContrast()).toBeGreaterThan(0);
    expect(homesteadFenceLandmarkVsLivedPathContrast()).toBeGreaterThan(0);
    expect(homesteadFenceLandmarkVsEmptyPathContrast()).toBeGreaterThan(0);
    expect(HOMESTEAD_FENCE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      HOUSING_DECOR_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_FENCE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_FENCE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EMPTY_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(HOMESTEAD_FENCE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      VISIT_LAND_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );

    const low = homesteadFenceLandmarkPulseEnvelope(0);
    const mid = homesteadFenceLandmarkPulseEnvelope(
      HOMESTEAD_FENCE_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent fence layouts or NFT combat (failure)", () => {
    const emptyFloors = homesteadYardFloorColors("empty", "home");
    const livedFloors = homesteadYardFloorColors("lived", "home");
    expect(emptyFloors.fencePostColor).toBe(
      HOMESTEAD_YARD_VISUAL.empty.fencePostColor,
    );
    expect(livedFloors.fencePostColor).toBe(
      HOMESTEAD_YARD_VISUAL.lived.fencePostColor,
    );
    expect(homesteadFenceLandmarkEmissiveIntensity(2)).toBe(
      HOMESTEAD_FENCE_LANDMARK_CUE.intensityPeak,
    );
    expect(homesteadFenceLandmarkEmissiveIntensity(-1)).toBe(
      HOMESTEAD_FENCE_LANDMARK_CUE.intensityBase,
    );
    expect(homesteadFenceLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(HOMESTEAD_FENCE_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(HOMESTEAD_FENCE_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(HOMESTEAD_FENCE_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
