import { describe, expect, it } from "vitest";
import {
  EXPLORE_SECTION_LANDMARK_CUE,
  EXPLORE_THICKET_LANDMARK_CUE,
  EXPLORE_TRAIL_LANDMARK_CUE,
  HUNT,
  HUNT_TRAIL_WAYFINDING,
  exploreThicketLandmarkCue,
  exploreThicketLandmarkEmissiveIntensity,
  exploreThicketLandmarkHazeOpacity,
  exploreThicketLandmarkPulseEnvelope,
  exploreThicketLandmarkVsHuntPadContrast,
  exploreThicketLandmarkVsTrailContrast,
  exploreThicketLandmarkVsWoodlandContrast,
} from "@game/shared";

/**
 * PL175.1 — Explore thicket soft landmark cue leftover.
 * Choice: quiet cool thicket haze/emissive on existing Explore edge_thicket
 * while on Explore (complements hunt tip + ready cues; hunt rates unchanged).
 * Continuous landmark on Explore only; ready pad / tip stay their own cues.
 */
describe("CityLands PL175.1 explore thicket soft landmark cue leftover", () => {
  it("pulses quiet cool thicket haze on Explore edge_thicket (happy)", () => {
    const cue = exploreThicketLandmarkCue("explore");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      EXPLORE_THICKET_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(EXPLORE_THICKET_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(EXPLORE_THICKET_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(EXPLORE_THICKET_LANDMARK_CUE.hazeRadius);

    const peak = exploreThicketLandmarkEmissiveIntensity(1);
    const floor = exploreThicketLandmarkEmissiveIntensity(0);
    expect(peak).toBe(EXPLORE_THICKET_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(EXPLORE_THICKET_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = exploreThicketLandmarkHazeOpacity(1);
    const hazeFloor = exploreThicketLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off Explore; cool thicket ≠ pad / trail / woodland (edge)", () => {
    expect(exploreThicketLandmarkCue("city").show).toBe(false);
    expect(exploreThicketLandmarkCue("player_land").show).toBe(false);
    expect(exploreThicketLandmarkCue("warrior").show).toBe(false);
    expect(exploreThicketLandmarkCue(null).show).toBe(false);
    expect(exploreThicketLandmarkCue("").show).toBe(false);
    expect(exploreThicketLandmarkCue("city").intensity).toBe(0);
    expect(exploreThicketLandmarkCue("city").hazeOpacity).toBe(0);
    // Reason: legacy forest alias still maps to Explore.
    expect(exploreThicketLandmarkCue("forest").show).toBe(true);

    expect(exploreThicketLandmarkVsHuntPadContrast()).toBeGreaterThan(0);
    expect(exploreThicketLandmarkVsTrailContrast()).toBeGreaterThan(0);
    expect(exploreThicketLandmarkVsWoodlandContrast()).toBeGreaterThan(0);
    expect(EXPLORE_THICKET_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      HUNT_TRAIL_WAYFINDING.thicket.padEmissive.toLowerCase(),
    );
    expect(EXPLORE_THICKET_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_TRAIL_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(EXPLORE_THICKET_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_SECTION_LANDMARK_CUE.emissive.toLowerCase(),
    );

    const low = exploreThicketLandmarkPulseEnvelope(0);
    const mid = exploreThicketLandmarkPulseEnvelope(
      EXPLORE_THICKET_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent hunt rates or NFT combat (failure)", () => {
    expect(HUNT.cooldownMs).toBe(60_000);
    expect(HUNT.leatherQty).toBe(1);
    expect(HUNT.meatQty).toBe(1);
    expect(exploreThicketLandmarkEmissiveIntensity(2)).toBe(
      EXPLORE_THICKET_LANDMARK_CUE.intensityPeak,
    );
    expect(exploreThicketLandmarkEmissiveIntensity(-1)).toBe(
      EXPLORE_THICKET_LANDMARK_CUE.intensityBase,
    );
    expect(exploreThicketLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(EXPLORE_THICKET_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(EXPLORE_THICKET_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(EXPLORE_THICKET_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
