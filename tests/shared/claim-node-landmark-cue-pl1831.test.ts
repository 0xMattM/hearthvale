import { describe, expect, it } from "vitest";
import {
  CLAIM_EMPTY_LANDMARK_CUE,
  CLAIM_NODE,
  CLAIM_NODE_CONTEST_SOFT_CUE,
  CLAIM_NODE_HELD_SOFT_CUE,
  claimEmptyLandmarkCue,
  claimEmptyLandmarkEmissiveIntensity,
  claimEmptyLandmarkVsContestContrast,
  claimEmptyLandmarkVsHeldContrast,
  claimEmptyLandmarkVsTipContrast,
  claimNodeContestSoftCueActive,
} from "@game/shared";

/**
 * PL183.1 — Claim-node soft landmark leftover.
 * Kinship: acceptance matches PL163.2 `CLAIM_EMPTY_LANDMARK_CUE` (quiet cool
 * grove haze/emissive on existing claim_node). Do **not** stack a second
 * identical grove mist — assert the empty landmark still covers glanceable
 * claim presence beside held PL145.1 + contest PL146.1 + first tip PL80.1.
 * Claim rules unchanged; mute ok.
 */
describe("CityLands PL183.1 claim-node soft landmark leftover", () => {
  it("reuses PL163.2 grove mist while claim_node is present unheld (happy)", () => {
    const cue = claimEmptyLandmarkCue(false, false);
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CLAIM_EMPTY_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CLAIM_EMPTY_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CLAIM_EMPTY_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(CLAIM_EMPTY_LANDMARK_CUE.hazeRadius);

    const peak = claimEmptyLandmarkEmissiveIntensity(1);
    expect(peak).toBe(CLAIM_EMPTY_LANDMARK_CUE.intensityPeak);
    expect(peak).toBeGreaterThan(CLAIM_EMPTY_LANDMARK_CUE.intensityBase);

    // Complements — does not replace — held / contest / tip SoT.
    expect(CLAIM_NODE_HELD_SOFT_CUE.emissive).toBeTruthy();
    expect(CLAIM_NODE_CONTEST_SOFT_CUE.emissive).toBeTruthy();
    expect(CLAIM_NODE_HELD_SOFT_CUE.tipEmissive).toBeTruthy();
    expect(claimNodeContestSoftCueActive(null, Date.now())).toBe(false);
  });

  it("stays quiet when held or contested; mist ≠ held / contest / tip (edge)", () => {
    expect(claimEmptyLandmarkCue(true, false).show).toBe(false);
    expect(claimEmptyLandmarkCue(false, true).show).toBe(false);
    expect(claimEmptyLandmarkCue(true, true).show).toBe(false);
    expect(claimEmptyLandmarkCue(true, false).intensity).toBe(0);

    expect(claimEmptyLandmarkVsHeldContrast()).toBeGreaterThan(0);
    expect(claimEmptyLandmarkVsContestContrast()).toBeGreaterThan(0);
    expect(claimEmptyLandmarkVsTipContrast()).toBeGreaterThan(0);
    expect(CLAIM_EMPTY_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_HELD_SOFT_CUE.emissive.toLowerCase(),
    );
    expect(CLAIM_EMPTY_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_CONTEST_SOFT_CUE.emissive.toLowerCase(),
    );
  });

  it("does not invent a second grove mist or change claim rules (failure)", () => {
    expect(CLAIM_NODE.claimEnergyCost).toBe(15);
    expect(CLAIM_NODE.storageCap).toBe(25);
    expect(CLAIM_EMPTY_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CLAIM_EMPTY_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|second.?mist|fare/i,
    );
    expect(claimEmptyLandmarkCue(false, false).show).not.toBe(
      claimEmptyLandmarkCue(true, false).show,
    );
  });
});
