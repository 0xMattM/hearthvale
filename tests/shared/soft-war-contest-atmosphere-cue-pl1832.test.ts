import { describe, expect, it } from "vitest";
import {
  CLAIM_EMPTY_LANDMARK_CUE,
  CLAIM_NODE,
  CLAIM_NODE_CONTEST_SOFT_CUE,
  CLAIM_NODE_HELD_SOFT_CUE,
  SOFT_WAR_CONTEST_ATMOSPHERE_CUE,
  claimNodeContestSoftCueActive,
  softWarContestAtmosphereCue,
  softWarContestAtmosphereEmissiveIntensity,
  softWarContestAtmosphereHazeOpacity,
  softWarContestAtmospherePulseEnvelope,
  softWarContestAtmosphereVsBeaconContrast,
  softWarContestAtmosphereVsEmptyContrast,
  softWarContestAtmosphereVsTipContrast,
} from "@game/shared";

/**
 * PL183.2 — Soft-war contest soft atmosphere leftover.
 * Choice: quiet ember mist tint/haze while a soft-war contest is open
 * (complements contest pulse + deliver rim; scoring unchanged).
 */
describe("CityLands PL183.2 soft-war contest soft atmosphere leftover", () => {
  it("pulses quiet ember mist while contest is open (happy)", () => {
    const endsAt = Date.now() + 60_000;
    const cue = softWarContestAtmosphereCue(endsAt, Date.now());
    expect(cue.show).toBe(true);
    expect(claimNodeContestSoftCueActive(endsAt, Date.now())).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      SOFT_WAR_CONTEST_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(
      SOFT_WAR_CONTEST_ATMOSPHERE_CUE.hazeOpacityBase,
    );
    expect(cue.hazeRadius).toBe(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.hazeRadius);

    const peak = softWarContestAtmosphereEmissiveIntensity(1);
    const floor = softWarContestAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = softWarContestAtmosphereHazeOpacity(1);
    const hazeFloor = softWarContestAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet when contest closed; mist ≠ beacon / empty / tip (edge)", () => {
    expect(softWarContestAtmosphereCue(null, Date.now()).show).toBe(false);
    expect(softWarContestAtmosphereCue(undefined, Date.now()).show).toBe(false);
    expect(
      softWarContestAtmosphereCue(Date.now() - 1, Date.now()).show,
    ).toBe(false);
    expect(softWarContestAtmosphereCue(null, Date.now()).intensity).toBe(0);
    expect(softWarContestAtmosphereCue(null, Date.now()).hazeOpacity).toBe(0);

    expect(softWarContestAtmosphereVsBeaconContrast()).toBeGreaterThan(0);
    expect(softWarContestAtmosphereVsEmptyContrast()).toBeGreaterThan(0);
    expect(softWarContestAtmosphereVsTipContrast()).toBeGreaterThan(0);
    expect(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_CONTEST_SOFT_CUE.emissive.toLowerCase(),
    );
    expect(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_EMPTY_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_HELD_SOFT_CUE.tipEmissive.toLowerCase(),
    );

    // Continuous mist stays quieter / slower than beacon contest pulse.
    expect(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CLAIM_NODE_CONTEST_SOFT_CUE.intensityPeak,
    );
    expect(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CLAIM_NODE_CONTEST_SOFT_CUE.pulsePeriodMs,
    );

    const low = softWarContestAtmospherePulseEnvelope(0);
    const mid = softWarContestAtmospherePulseEnvelope(
      SOFT_WAR_CONTEST_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not change scoring / window or invent NFT combat (failure)", () => {
    expect(CLAIM_NODE.claimEnergyCost).toBe(15);
    expect(CLAIM_NODE.storageCap).toBe(25);
    expect(softWarContestAtmosphereEmissiveIntensity(2)).toBe(
      SOFT_WAR_CONTEST_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(softWarContestAtmosphereEmissiveIntensity(-1)).toBe(
      SOFT_WAR_CONTEST_ATMOSPHERE_CUE.intensityBase,
    );
    expect(softWarContestAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.hazeRadius).toBeLessThanOrEqual(2);
    expect(String(SOFT_WAR_CONTEST_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|score|fare/i,
    );
  });
});
