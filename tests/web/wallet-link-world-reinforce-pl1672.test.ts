import { describe, expect, it } from "vitest";
import {
  WALLET_LINK_WORLD_REINFORCE,
  walletLinkWorldReinforceBackground,
  shouldFlashWalletLinkWorldReinforce,
} from "../../apps/web/lib/hud/wallet-link-feedback";
import {
  DEED_CLAIM_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/deed-claim-feedback";
import {
  DEED_MINT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/deed-mint-feedback";
import {
  SCARCE_BUSY_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/scarce-busy-world-reinforce-feedback";
import {
  SCARCE_FREE_SETTLE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/scarce-free-settle-feedback";
import {
  WALLET_LINK_SUCCESS_CUE,
  walletLinkSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL167.2 — Wallet-link soft world reinforce leftover.
 * Brief soft rim after wallet link ok (complements Wallet linked ephemeral
 * PL33.3; core loops stay wallet-free). Mute ok; fail silent; no combat power.
 * Choice: one-shot cool link-slate rim (not another deed claim/mint / Busy /
 * Free) so link stays world-readable beside the existing ephemeral.
 */
describe("CityLands PL167.2 wallet-link soft world reinforce leftover", () => {
  it("flashes quiet link-slate rim when link succeeds (happy)", () => {
    expect(shouldFlashWalletLinkWorldReinforce(true)).toBe(true);
    expect(WALLET_LINK_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(WALLET_LINK_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = walletLinkWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(WALLET_LINK_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Wallet linked ephemeral.
    expect(walletLinkSuccessCueText()).toBe(WALLET_LINK_SUCCESS_CUE);
    expect(walletLinkSuccessCueText()).toBe("Wallet linked");
  });

  it("stays quiet on fail; rim ≠ deed claim/mint / Busy / Free (edge)", () => {
    expect(shouldFlashWalletLinkWorldReinforce(false)).toBe(false);

    expect(WALLET_LINK_WORLD_REINFORCE.outerRgba).not.toBe(
      DEED_CLAIM_WORLD_REINFORCE.outerRgba,
    );
    expect(WALLET_LINK_WORLD_REINFORCE.outerRgba).not.toBe(
      DEED_MINT_WORLD_REINFORCE.outerRgba,
    );
    expect(WALLET_LINK_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_BUSY_WORLD_REINFORCE.outerRgba,
    );
    expect(WALLET_LINK_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_FREE_SETTLE_WORLD_REINFORCE.outerRgba,
    );
    expect(WALLET_LINK_WORLD_REINFORCE.midRgba).not.toBe(
      DEED_MINT_WORLD_REINFORCE.midRgba,
    );
    expect(WALLET_LINK_WORLD_REINFORCE.clearPct).toBeLessThan(
      WALLET_LINK_WORLD_REINFORCE.midPct,
    );
    expect(WALLET_LINK_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent NFT combat; keeps core loops wallet-free (failure)", () => {
    expect(walletLinkWorldReinforceBackground()).not.toMatch(
      /nft|combat|fare|always.?on/i,
    );
    expect(String(WALLET_LINK_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|nft/i,
    );
    expect(WALLET_LINK_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashWalletLinkWorldReinforce(true)).not.toBe(
      shouldFlashWalletLinkWorldReinforce(false),
    );
  });
});
