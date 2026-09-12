import { describe, expect, it } from "vitest";
import {
  EXPLORE_SECTION_LANDMARK_CUE,
  EXPLORE_TRAIL_LANDMARK_CUE,
  HUNT,
  HUNT_TRAIL_WAYFINDING,
  exploreTrailLandmarkCue,
  exploreTrailLandmarkEmissiveIntensity,
  exploreTrailLandmarkHazeOpacity,
  exploreTrailLandmarkPulseEnvelope,
  exploreTrailLandmarkVsHuntPadContrast,
  exploreTrailLandmarkVsWoodlandContrast,
} from "@game/shared";

/**
 * PL174.2 — Explore trail soft landmark cue leftover.
 * Choice: quiet warm trail haze/emissive on existing Explore game_trail
 * while on Explore (complements hunt tip + ready cues; hunt rates unchanged).
 * Continuous landmark on Explore only; ready pad / tip stay their own cues.
 */
describe("CityLands PL174.2 explore trail soft landmark cue leftover", () => {
  it("pulses quiet warm trail haze on Explore game_trail (happy)", () => {
    const cue = exploreTrailLandmarkCue("explore");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      EXPLORE_TRAIL_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(EXPLORE_TRAIL_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(EXPLORE_TRAIL_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(EXPLORE_TRAIL_LANDMARK_CUE.hazeRadius);

    const peak = exploreTrailLandmarkEmissiveIntensity(1);
    const floor = exploreTrailLandmarkEmissiveIntensity(0);
    expect(peak).toBe(EXPLORE_TRAIL_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(EXPLORE_TRAIL_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = exploreTrailLandmarkHazeOpacity(1);
    const hazeFloor = exploreTrailLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off Explore; warm trail ≠ ready pad / woodland (edge)", () => {
    expect(exploreTrailLandmarkCue("city").show).toBe(false);
    expect(exploreTrailLandmarkCue("player_land").show).toBe(false);
    expect(exploreTrailLandmarkCue("warrior").show).toBe(false);
    expect(exploreTrailLandmarkCue(null).show).toBe(false);
    expect(exploreTrailLandmarkCue("").show).toBe(false);
    expect(exploreTrailLandmarkCue("city").intensity).toBe(0);
    expect(exploreTrailLandmarkCue("city").hazeOpacity).toBe(0);
    // Reason: legacy forest alias still maps to Explore.
    expect(exploreTrailLandmarkCue("forest").show).toBe(true);

    expect(exploreTrailLandmarkVsHuntPadContrast()).toBeGreaterThan(0);
    expect(exploreTrailLandmarkVsWoodlandContrast()).toBeGreaterThan(0);
    expect(EXPLORE_TRAIL_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      HUNT_TRAIL_WAYFINDING.trail.padEmissive.toLowerCase(),
    );
    expect(EXPLORE_TRAIL_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_SECTION_LANDMARK_CUE.emissive.toLowerCase(),
    );

    const low = exploreTrailLandmarkPulseEnvelope(0);
    const mid = exploreTrailLandmarkPulseEnvelope(
      EXPLORE_TRAIL_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent hunt rates or NFT combat (failure)", () => {
    expect(HUNT.cooldownMs).toBe(60_000);
    expect(HUNT.leatherQty).toBe(1);
    expect(HUNT.meatQty).toBe(1);
    expect(exploreTrailLandmarkEmissiveIntensity(2)).toBe(
      EXPLORE_TRAIL_LANDMARK_CUE.intensityPeak,
    );
    expect(exploreTrailLandmarkEmissiveIntensity(-1)).toBe(
      EXPLORE_TRAIL_LANDMARK_CUE.intensityBase,
    );
    expect(exploreTrailLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(EXPLORE_TRAIL_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(EXPLORE_TRAIL_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(EXPLORE_TRAIL_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
