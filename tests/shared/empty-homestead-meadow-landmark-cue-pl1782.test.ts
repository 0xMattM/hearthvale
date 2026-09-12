import { describe, expect, it } from "vitest";
import {
  EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE,
  EMPTY_HOMESTEAD_PATH_CUE,
  EXPLORE_WILDS_VISUAL,
  HOMESTEAD_FENCE_LANDMARK_CUE,
  HOMESTEAD_YARD_VISUAL,
  emptyHomesteadMeadowLandmarkCue,
  emptyHomesteadMeadowLandmarkEmissiveIntensity,
  emptyHomesteadMeadowLandmarkHazeOpacity,
  emptyHomesteadMeadowLandmarkPulseEnvelope,
  emptyHomesteadMeadowLandmarkVsEmptyPathContrast,
  emptyHomesteadMeadowLandmarkVsExploreCanopyContrast,
  homesteadYardFloorColors,
} from "@game/shared";

/**
 * PL178.2 — Homestead empty meadow soft landmark leftover.
 * Choice: quiet warm pulsing haze/emissive on existing empty outer meadow
 * (complements empty path cue + meadow contrast; layouts unchanged).
 */
describe("CityLands PL178.2 empty homestead meadow soft landmark leftover", () => {
  it("pulses quiet warm meadow haze while yard is empty (happy)", () => {
    const cue = emptyHomesteadMeadowLandmarkCue("empty");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.intensityBase,
    );
    expect(cue.hazeOpacity).toBe(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.hazeOpacityBase,
    );
    expect(cue.hazeWidth).toBe(EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.hazeWidth);
    expect(cue.hazeDepth).toBe(EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.hazeDepth);

    const peak = emptyHomesteadMeadowLandmarkEmissiveIntensity(1);
    const floor = emptyHomesteadMeadowLandmarkEmissiveIntensity(0);
    expect(peak).toBe(EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = emptyHomesteadMeadowLandmarkHazeOpacity(1);
    const hazeFloor = emptyHomesteadMeadowLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet once lived; warm meadow ≠ empty path / explore canopy (edge)", () => {
    expect(emptyHomesteadMeadowLandmarkCue("lived").show).toBe(false);
    expect(emptyHomesteadMeadowLandmarkCue("lived").intensity).toBe(0);
    expect(emptyHomesteadMeadowLandmarkCue("lived").hazeOpacity).toBe(0);

    expect(emptyHomesteadMeadowLandmarkVsEmptyPathContrast()).toBeGreaterThan(0);
    expect(
      emptyHomesteadMeadowLandmarkVsExploreCanopyContrast(),
    ).toBeGreaterThan(0);
    expect(EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EMPTY_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      HOMESTEAD_FENCE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_WILDS_VISUAL.canopyColor.toLowerCase(),
    );
    expect(EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.hazeColor.toLowerCase()).not.toBe(
      HOMESTEAD_YARD_VISUAL.empty.meadowColor.toLowerCase(),
    );

    const low = emptyHomesteadMeadowLandmarkPulseEnvelope(0);
    const mid = emptyHomesteadMeadowLandmarkPulseEnvelope(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent layouts or NFT combat (failure)", () => {
    const emptyFloors = homesteadYardFloorColors("empty", "home");
    expect(emptyFloors.meadowColor).toBe(HOMESTEAD_YARD_VISUAL.empty.meadowColor);
    expect(emptyHomesteadMeadowLandmarkEmissiveIntensity(2)).toBe(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.intensityPeak,
    );
    expect(emptyHomesteadMeadowLandmarkEmissiveIntensity(-1)).toBe(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.intensityBase,
    );
    expect(emptyHomesteadMeadowLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.hazeOpacityPeak,
    ).toBeLessThanOrEqual(1);
    expect(String(EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe|xp|damage/i,
    );
    expect(
      EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.intensityPeak,
    ).toBeLessThanOrEqual(1);
  });
});
