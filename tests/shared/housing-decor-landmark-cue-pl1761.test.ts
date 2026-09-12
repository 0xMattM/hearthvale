import { describe, expect, it } from "vitest";
import {
  HOUSING_DECOR,
  HOUSING_DECOR_LANDMARK_CUE,
  LIVED_HOMESTEAD_PATH_CUE,
  housingDecorLandmarkCue,
  housingDecorLandmarkEmissiveIntensity,
  housingDecorLandmarkHazeOpacity,
  housingDecorLandmarkPulseEnvelope,
  housingDecorLandmarkVsLivedPathContrast,
  housingDecorLandmarkVsWalkUpTipContrast,
} from "@game/shared";

/**
 * PL176.1 — Housing decor soft landmark cue leftover.
 * Choice: quiet warm decor haze/emissive on existing housing decor_pad /
 * placed decor while on player land (complements decor tip + place rim;
 * costs / slots unchanged). Continuous landmark on player land only.
 */
describe("CityLands PL176.1 housing decor soft landmark cue leftover", () => {
  it("pulses quiet warm decor haze on player-land housing decor (happy)", () => {
    const cue = housingDecorLandmarkCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      HOUSING_DECOR_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(HOUSING_DECOR_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(HOUSING_DECOR_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(HOUSING_DECOR_LANDMARK_CUE.hazeRadius);

    const peak = housingDecorLandmarkEmissiveIntensity(1);
    const floor = housingDecorLandmarkEmissiveIntensity(0);
    expect(peak).toBe(HOUSING_DECOR_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(HOUSING_DECOR_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = housingDecorLandmarkHazeOpacity(1);
    const hazeFloor = housingDecorLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; warm decor ≠ tip / lived path (edge)", () => {
    expect(housingDecorLandmarkCue("city").show).toBe(false);
    expect(housingDecorLandmarkCue("explore").show).toBe(false);
    expect(housingDecorLandmarkCue("warrior").show).toBe(false);
    expect(housingDecorLandmarkCue(null).show).toBe(false);
    expect(housingDecorLandmarkCue("").show).toBe(false);
    expect(housingDecorLandmarkCue("city").intensity).toBe(0);
    expect(housingDecorLandmarkCue("city").hazeOpacity).toBe(0);
    // Reason: legacy starter alias still maps to player land.
    expect(housingDecorLandmarkCue("starter").show).toBe(true);

    expect(housingDecorLandmarkVsWalkUpTipContrast()).toBeGreaterThan(0);
    expect(housingDecorLandmarkVsLivedPathContrast()).toBeGreaterThan(0);
    expect(HOUSING_DECOR_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      "#c4b07a",
    );
    expect(HOUSING_DECOR_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );

    const low = housingDecorLandmarkPulseEnvelope(0);
    const mid = housingDecorLandmarkPulseEnvelope(
      HOUSING_DECOR_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent decor costs or NFT combat (failure)", () => {
    expect(HOUSING_DECOR.planter.coinCost).toBe(12);
    expect(HOUSING_DECOR.banner.coinCost).toBe(18);
    expect(housingDecorLandmarkEmissiveIntensity(2)).toBe(
      HOUSING_DECOR_LANDMARK_CUE.intensityPeak,
    );
    expect(housingDecorLandmarkEmissiveIntensity(-1)).toBe(
      HOUSING_DECOR_LANDMARK_CUE.intensityBase,
    );
    expect(housingDecorLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(HOUSING_DECOR_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(HOUSING_DECOR_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(HOUSING_DECOR_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
