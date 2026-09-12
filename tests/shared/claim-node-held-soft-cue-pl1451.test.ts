import { describe, expect, it } from "vitest";
import {
  CLAIM_NODE,
  CLAIM_NODE_FIRST_WALKUP_WORLD_TIP,
  CLAIM_NODE_HELD_SOFT_CUE,
  CLAIM_WAR,
  claimNodeFirstWalkUpWorldTip,
  claimNodeHeldSoftCueActive,
  claimNodeHeldSoftCueEmissive,
  claimNodeHeldSoftCueEmissiveIntensity,
  claimNodeHeldSoftCueEnvelope,
  claimNodeOwnershipBannerColor,
} from "@game/shared";

/**
 * PL145.1 — Claim-node held soft cue leftover.
 * Quiet ownership tint on existing claim_node while held by your guild
 * (complements claim tip PL80.1 + soft-war PL31.2; no wars invent).
 * Claim rules unchanged; mute ok.
 * Choice: continuous ownership-green banner/footing pulse (not another
 * Grove claimed toast) so yours stays glanceable vs rival red / unclaimed gold.
 */
describe("CityLands PL145.1 claim-node held soft cue leftover", () => {
  it("pulses ownership green only while yours (happy)", () => {
    expect(claimNodeHeldSoftCueActive(true)).toBe(true);
    expect(claimNodeHeldSoftCueEmissive(true)).toBe(
      CLAIM_NODE_HELD_SOFT_CUE.emissive,
    );
    expect(
      claimNodeHeldSoftCueEmissiveIntensity(true, 1),
    ).toBeCloseTo(CLAIM_NODE_HELD_SOFT_CUE.intensityPeak, 5);
    expect(
      claimNodeHeldSoftCueEmissiveIntensity(true, 0),
    ).toBeCloseTo(CLAIM_NODE_HELD_SOFT_CUE.intensityBase, 5);
    expect(CLAIM_NODE_HELD_SOFT_CUE.emissive).toMatch(/^#/);
    expect(claimNodeOwnershipBannerColor(true, true)).toBe(
      CLAIM_NODE_HELD_SOFT_CUE.bannerYours,
    );
    expect(CLAIM_NODE_HELD_SOFT_CUE.emissive.toLowerCase()).toBe(
      CLAIM_NODE_HELD_SOFT_CUE.bannerYours.toLowerCase(),
    );
  });

  it("stays quiet for rival / unclaimed; tip gold wins (edge)", () => {
    expect(claimNodeHeldSoftCueActive(false)).toBe(false);
    expect(claimNodeHeldSoftCueEmissive(false)).toBe("#000000");
    expect(claimNodeHeldSoftCueEmissiveIntensity(false, 1)).toBe(0);

    expect(claimNodeOwnershipBannerColor(true, false)).toBe(
      CLAIM_NODE_HELD_SOFT_CUE.bannerHeldOther,
    );
    expect(claimNodeOwnershipBannerColor(false, false)).toBe(
      CLAIM_NODE_HELD_SOFT_CUE.bannerUnclaimed,
    );

    expect(claimNodeHeldSoftCueEmissive(true, true)).toBe(
      CLAIM_NODE_HELD_SOFT_CUE.tipEmissive,
    );
    expect(claimNodeHeldSoftCueEmissiveIntensity(true, 1, true)).toBe(
      CLAIM_NODE_HELD_SOFT_CUE.tipIntensity,
    );
    expect(claimNodeFirstWalkUpWorldTip()).toBe(CLAIM_NODE_FIRST_WALKUP_WORLD_TIP);

    const mid = claimNodeHeldSoftCueEnvelope(
      CLAIM_NODE_HELD_SOFT_CUE.pulsePeriodMs / 4,
    );
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThanOrEqual(1);
    expect(CLAIM_NODE_HELD_SOFT_CUE.intensityPeak).toBeGreaterThan(
      CLAIM_NODE_HELD_SOFT_CUE.intensityBase,
    );
    expect(CLAIM_NODE_HELD_SOFT_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_HELD_SOFT_CUE.bannerHeldOther.toLowerCase(),
    );
    expect(CLAIM_NODE_HELD_SOFT_CUE.emissive.toLowerCase()).not.toBe(
      CLAIM_NODE_HELD_SOFT_CUE.bannerUnclaimed.toLowerCase(),
    );
  });

  it("does not invent wars / change claim costs (failure)", () => {
    expect(claimNodeHeldSoftCueEnvelope(-1)).toBeGreaterThanOrEqual(0);
    expect(claimNodeHeldSoftCueEnvelope(Number.NaN)).toBe(0);
    expect(
      claimNodeHeldSoftCueEmissiveIntensity(true, 3),
    ).toBeCloseTo(CLAIM_NODE_HELD_SOFT_CUE.intensityPeak, 5);
    expect(claimNodeHeldSoftCueActive(null as never)).toBe(false);

    expect(CLAIM_NODE.claimEnergyCost).toBe(15);
    expect(CLAIM_NODE.storageCap).toBe(25);
    expect(CLAIM_WAR.windowMs).toBe(3 * 60_000);
    expect(CLAIM_WAR.startEnergyCost).toBe(10);
    expect(String(CLAIM_NODE_HELD_SOFT_CUE.emissive)).not.toMatch(
      /nft|combat|fare/i,
    );
    expect(CLAIM_NODE_HELD_SOFT_CUE.pulsePeriodMs).toBeGreaterThan(0);
  });
});
