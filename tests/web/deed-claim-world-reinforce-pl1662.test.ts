import { describe, expect, it } from "vitest";
import {
  DEED_CLAIM_WORLD_REINFORCE,
  deedClaimWorldReinforceBackground,
  shouldFlashDeedClaimWorldReinforce,
} from "../../apps/web/lib/hud/deed-claim-feedback";
import {
  SCARCE_BUSY_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/scarce-busy-world-reinforce-feedback";
import {
  SCARCE_FREE_SETTLE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/scarce-free-settle-feedback";
import {
  DEED_CLAIM_SUCCESS_CUE,
  deedClaimSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL166.2 — Deed-claim soft world reinforce leftover.
 * Brief soft rim after cosmetic deed claim ok (complements Deed claimed
 * ephemeral PL33.3 + desk landmark PL165.1; no combat power). Wallet path
 * unchanged; mute ok; fail silent.
 * Choice: one-shot cool system-slate rim (not another Busy / Free settle)
 * so claim stays world-readable beside the existing ephemeral + desk haze.
 */
describe("CityLands PL166.2 deed-claim soft world reinforce leftover", () => {
  it("flashes quiet system-slate rim when claim succeeds (happy)", () => {
    expect(shouldFlashDeedClaimWorldReinforce(true)).toBe(true);
    expect(DEED_CLAIM_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(DEED_CLAIM_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = deedClaimWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(DEED_CLAIM_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Deed claimed ephemeral.
    expect(deedClaimSuccessCueText()).toBe(DEED_CLAIM_SUCCESS_CUE);
    expect(deedClaimSuccessCueText()).toBe("Deed claimed");
  });

  it("stays quiet on fail; rim ≠ Busy coral / Free settle cyan (edge)", () => {
    expect(shouldFlashDeedClaimWorldReinforce(false)).toBe(false);

    expect(DEED_CLAIM_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_BUSY_WORLD_REINFORCE.outerRgba,
    );
    expect(DEED_CLAIM_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_FREE_SETTLE_WORLD_REINFORCE.outerRgba,
    );
    expect(DEED_CLAIM_WORLD_REINFORCE.midRgba).not.toBe(
      SCARCE_BUSY_WORLD_REINFORCE.midRgba,
    );
    expect(DEED_CLAIM_WORLD_REINFORCE.clearPct).toBeLessThan(
      DEED_CLAIM_WORLD_REINFORCE.midPct,
    );
    expect(DEED_CLAIM_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent NFT combat / wallet invent; keeps ok gate (failure)", () => {
    expect(deedClaimWorldReinforceBackground()).not.toMatch(
      /nft|combat|fare|always.?on/i,
    );
    expect(String(DEED_CLAIM_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|nft/i,
    );
    expect(DEED_CLAIM_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashDeedClaimWorldReinforce(true)).not.toBe(
      shouldFlashDeedClaimWorldReinforce(false),
    );
  });
});
