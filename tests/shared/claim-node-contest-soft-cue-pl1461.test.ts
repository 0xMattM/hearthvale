import { describe, expect, it } from "vitest";
import {
  CLAIM_NODE,
  CLAIM_NODE_CONTEST_SOFT_CUE,
  CLAIM_NODE_FIRST_WALKUP_WORLD_TIP,
  CLAIM_NODE_HELD_SOFT_CUE,
  CLAIM_WAR,
  claimNodeContestSoftCueActive,
  claimNodeContestSoftCueEmissive,
  claimNodeContestSoftCueEmissiveIntensity,
  claimNodeContestSoftCueEnvelope,
  claimNodeFirstWalkUpWorldTip,
  claimNodeHeldSoftCueEmissive,
} from "@game/shared";

/**
 * PL146.1 — Claim soft-war contest world cue.
 * Quiet contest tint/pulse on existing claim_node while `contestEndsAt` is
 * active (complements held ownership PL145.1 + Soft war ephemeral PL31.2;
 * no wars invent). Soft-war rules unchanged; mute ok.
 * Choice: continuous warm-ember banner/footing pulse (not another Contest
 * toast) so open soft wars stay glanceable beside ownership green.
 */
describe("CityLands PL146.1 claim soft-war contest world cue", () => {
  it("pulses warm ember only while contestEndsAt is future (happy)", () => {
    const now = 1_000_000;
    expect(claimNodeContestSoftCueActive(now + 60_000, now)).toBe(true);
    expect(claimNodeContestSoftCueEmissive(true)).toBe(
      CLAIM_NODE_CONTEST_SOFT_CUE.emissive,
    );
    expect(
      claimNodeContestSoftCueEmissiveIntensity(true, 1),
    ).toBeCloseTo(CLAIM_NODE_CONTEST_SOFT_CUE.intensityPeak, 5);
    expect(
      claimNodeContestSoftCueEmissiveIntensity(true, 0),
    ).toBeCloseTo(CLAIM_NODE_CONTEST_SOFT_CUE.intensityBase, 5);
    expect(CLAIM_NODE_CONTEST_SOFT_CUE.emissive).toMatch(/^#/);
    expect(CLAIM_NODE_CONTEST_SOFT_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_HELD_SOFT_CUE.emissive.toLowerCase(),
    );
  });

  it("stays quiet when idle / expired; tip gold wins (edge)", () => {
    const now = 1_000_000;
    expect(claimNodeContestSoftCueActive(null, now)).toBe(false);
    expect(claimNodeContestSoftCueActive(undefined, now)).toBe(false);
    expect(claimNodeContestSoftCueActive(now - 1, now)).toBe(false);
    expect(claimNodeContestSoftCueActive(now, now)).toBe(false);
    expect(claimNodeContestSoftCueEmissive(false)).toBe("#000000");
    expect(claimNodeContestSoftCueEmissiveIntensity(false, 1)).toBe(0);

    expect(claimNodeContestSoftCueEmissive(true, true)).toBe(
      CLAIM_NODE_HELD_SOFT_CUE.tipEmissive,
    );
    expect(claimNodeContestSoftCueEmissiveIntensity(true, 1, true)).toBe(
      CLAIM_NODE_HELD_SOFT_CUE.tipIntensity,
    );
    expect(claimNodeFirstWalkUpWorldTip()).toBe(CLAIM_NODE_FIRST_WALKUP_WORLD_TIP);

    // Contest yields to tip; held green stays available when contest idle.
    expect(claimNodeHeldSoftCueEmissive(true)).toBe(
      CLAIM_NODE_HELD_SOFT_CUE.emissive,
    );

    const mid = claimNodeContestSoftCueEnvelope(
      CLAIM_NODE_CONTEST_SOFT_CUE.pulsePeriodMs / 4,
    );
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThanOrEqual(1);
    expect(CLAIM_NODE_CONTEST_SOFT_CUE.intensityPeak).toBeGreaterThan(
      CLAIM_NODE_CONTEST_SOFT_CUE.intensityBase,
    );
    expect(CLAIM_NODE_CONTEST_SOFT_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_HELD_SOFT_CUE.bannerHeldOther.toLowerCase(),
    );
    expect(CLAIM_NODE_CONTEST_SOFT_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_HELD_SOFT_CUE.bannerUnclaimed.toLowerCase(),
    );
  });

  it("does not invent wars / change claim costs (failure)", () => {
    expect(claimNodeContestSoftCueEnvelope(-1)).toBeGreaterThanOrEqual(0);
    expect(claimNodeContestSoftCueEnvelope(Number.NaN)).toBe(0);
    expect(
      claimNodeContestSoftCueEmissiveIntensity(true, 3),
    ).toBeCloseTo(CLAIM_NODE_CONTEST_SOFT_CUE.intensityPeak, 5);
    expect(claimNodeContestSoftCueActive(null as never, Number.NaN)).toBe(
      false,
    );

    expect(CLAIM_NODE.claimEnergyCost).toBe(15);
    expect(CLAIM_NODE.storageCap).toBe(25);
    expect(CLAIM_WAR.windowMs).toBe(3 * 60_000);
    expect(CLAIM_WAR.startEnergyCost).toBe(10);
    expect(CLAIM_WAR.deliverItemId).toBe("wood");
    expect(String(CLAIM_NODE_CONTEST_SOFT_CUE.emissive)).not.toMatch(
      /nft|combat|fare/i,
    );
    expect(CLAIM_NODE_CONTEST_SOFT_CUE.pulsePeriodMs).toBeGreaterThan(0);
    expect(CLAIM_NODE_CONTEST_SOFT_CUE.pulsePeriodMs).toBeLessThan(
      CLAIM_NODE_HELD_SOFT_CUE.pulsePeriodMs,
    );
  });
});
