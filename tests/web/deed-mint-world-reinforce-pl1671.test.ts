import { describe, expect, it } from "vitest";
import {
  DEED_MINT_WORLD_REINFORCE,
  deedMintWorldReinforceBackground,
  shouldFlashDeedMintWorldReinforce,
} from "../../apps/web/lib/hud/deed-mint-feedback";
import {
  DEED_CLAIM_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/deed-claim-feedback";
import {
  SCARCE_BUSY_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/scarce-busy-world-reinforce-feedback";
import {
  SCARCE_FREE_SETTLE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/scarce-free-settle-feedback";
import {
  DEED_MINT_SUCCESS_CUE,
  deedMintSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL167.1 — Deed-mint soft world reinforce leftover.
 * Brief soft rim after mock mint ok (complements Deed minted ephemeral
 * PL33.3 + desk landmark; stub only; no combat power). Stub path unchanged;
 * mute ok; fail silent.
 * Choice: one-shot cool mint-slate rim (not another claim / Busy / Free)
 * so mint stays world-readable beside the existing ephemeral + desk haze.
 */
describe("CityLands PL167.1 deed-mint soft world reinforce leftover", () => {
  it("flashes quiet mint-slate rim when mint succeeds (happy)", () => {
    expect(shouldFlashDeedMintWorldReinforce(true)).toBe(true);
    expect(DEED_MINT_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(DEED_MINT_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = deedMintWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(DEED_MINT_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Deed minted ephemeral.
    expect(deedMintSuccessCueText()).toBe(DEED_MINT_SUCCESS_CUE);
    expect(deedMintSuccessCueText()).toBe("Deed minted");
  });

  it("stays quiet on fail; rim ≠ claim / Busy / Free settle (edge)", () => {
    expect(shouldFlashDeedMintWorldReinforce(false)).toBe(false);

    expect(DEED_MINT_WORLD_REINFORCE.outerRgba).not.toBe(
      DEED_CLAIM_WORLD_REINFORCE.outerRgba,
    );
    expect(DEED_MINT_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_BUSY_WORLD_REINFORCE.outerRgba,
    );
    expect(DEED_MINT_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_FREE_SETTLE_WORLD_REINFORCE.outerRgba,
    );
    expect(DEED_MINT_WORLD_REINFORCE.midRgba).not.toBe(
      DEED_CLAIM_WORLD_REINFORCE.midRgba,
    );
    expect(DEED_MINT_WORLD_REINFORCE.clearPct).toBeLessThan(
      DEED_MINT_WORLD_REINFORCE.midPct,
    );
    expect(DEED_MINT_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent NFT combat / wallet invent; keeps ok gate (failure)", () => {
    expect(deedMintWorldReinforceBackground()).not.toMatch(
      /nft|combat|fare|always.?on/i,
    );
    expect(String(DEED_MINT_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|nft/i,
    );
    expect(DEED_MINT_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashDeedMintWorldReinforce(true)).not.toBe(
      shouldFlashDeedMintWorldReinforce(false),
    );
  });
});
