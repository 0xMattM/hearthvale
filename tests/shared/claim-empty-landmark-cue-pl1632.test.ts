import { describe, expect, it } from "vitest";
import {
  CLAIM_EMPTY_LANDMARK_CUE,
  CLAIM_NODE,
  CLAIM_NODE_CONTEST_SOFT_CUE,
  CLAIM_NODE_HELD_SOFT_CUE,
  claimEmptyLandmarkCue,
  claimEmptyLandmarkEmissiveIntensity,
  claimEmptyLandmarkHazeOpacity,
  claimEmptyLandmarkPulseEnvelope,
  claimEmptyLandmarkVsContestContrast,
  claimEmptyLandmarkVsHeldContrast,
  claimEmptyLandmarkVsTipContrast,
  claimNodeContestSoftCueActive,
} from "@game/shared";

/**
 * PL163.2 — Claim-empty soft landmark cue leftover.
 * Choice: quiet cool grove mist haze/emissive on existing claim_node while
 * unheld / no contest (complements tip PL80.1 + held/contest cues);
 * claim / war rules unchanged.
 */
describe("CityLands PL163.2 claim-empty soft landmark cue leftover", () => {
  it("pulses cool grove mist while unheld and no contest (happy)", () => {
    const cue = claimEmptyLandmarkCue(false, false);
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CLAIM_EMPTY_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CLAIM_EMPTY_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CLAIM_EMPTY_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(CLAIM_EMPTY_LANDMARK_CUE.hazeRadius);

    const peak = claimEmptyLandmarkEmissiveIntensity(1);
    const floor = claimEmptyLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CLAIM_EMPTY_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CLAIM_EMPTY_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = claimEmptyLandmarkHazeOpacity(1);
    const hazeFloor = claimEmptyLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);

    expect(claimNodeContestSoftCueActive(null, Date.now())).toBe(false);
  });

  it("stays quiet when held or contested; mist ≠ held / contest / tip (edge)", () => {
    expect(claimEmptyLandmarkCue(true, false).show).toBe(false);
    expect(claimEmptyLandmarkCue(false, true).show).toBe(false);
    expect(claimEmptyLandmarkCue(true, true).show).toBe(false);
    expect(claimEmptyLandmarkCue(true, false).intensity).toBe(0);
    expect(claimEmptyLandmarkCue(false, true).hazeOpacity).toBe(0);

    expect(claimEmptyLandmarkVsHeldContrast()).toBeGreaterThan(0);
    expect(claimEmptyLandmarkVsContestContrast()).toBeGreaterThan(0);
    expect(claimEmptyLandmarkVsTipContrast()).toBeGreaterThan(0);
    expect(CLAIM_EMPTY_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_HELD_SOFT_CUE.emissive.toLowerCase(),
    );
    expect(CLAIM_EMPTY_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_CONTEST_SOFT_CUE.emissive.toLowerCase(),
    );
    expect(CLAIM_EMPTY_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_HELD_SOFT_CUE.tipEmissive.toLowerCase(),
    );

    // Continuous empty landmark stays quieter / slower than contest pulse.
    expect(CLAIM_EMPTY_LANDMARK_CUE.intensityPeak).toBeLessThan(
      CLAIM_NODE_CONTEST_SOFT_CUE.intensityPeak,
    );
    expect(CLAIM_EMPTY_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      CLAIM_NODE_CONTEST_SOFT_CUE.pulsePeriodMs,
    );

    const low = claimEmptyLandmarkPulseEnvelope(0);
    const mid = claimEmptyLandmarkPulseEnvelope(
      CLAIM_EMPTY_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent claim nodes or change war rules (failure)", () => {
    expect(CLAIM_NODE.claimEnergyCost).toBe(15);
    expect(CLAIM_NODE.storageCap).toBe(25);

    expect(claimEmptyLandmarkEmissiveIntensity(2)).toBe(
      CLAIM_EMPTY_LANDMARK_CUE.intensityPeak,
    );
    expect(claimEmptyLandmarkEmissiveIntensity(-1)).toBe(
      CLAIM_EMPTY_LANDMARK_CUE.intensityBase,
    );
    expect(claimEmptyLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CLAIM_EMPTY_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CLAIM_EMPTY_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|fare/i,
    );
  });
});
