import { describe, expect, it } from "vitest";
import {
  WALLET_DISCONNECT_WORLD_REINFORCE,
  walletDisconnectWorldReinforceBackground,
  shouldFlashWalletDisconnectWorldReinforce,
} from "../../apps/web/lib/hud/wallet-disconnect-feedback";
import {
  WALLET_LINK_WORLD_REINFORCE,
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
  WALLET_DISCONNECT_SUCCESS_CUE,
  walletDisconnectSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL168.1 — Wallet-disconnect soft world reinforce leftover.
 * Brief soft rim after wallet disconnect ok (complements Wallet disconnected
 * ephemeral PL33.3; core loops stay wallet-free). Mute ok; fail silent;
 * no combat power.
 * Choice: one-shot cool disconnect ash-slate rim (not another link-slate /
 * deed claim/mint / Busy / Free) so disconnect stays world-readable beside
 * the existing ephemeral.
 */
describe("CityLands PL168.1 wallet-disconnect soft world reinforce leftover", () => {
  it("flashes quiet disconnect ash-slate rim when disconnect succeeds (happy)", () => {
    expect(shouldFlashWalletDisconnectWorldReinforce(true)).toBe(true);
    expect(WALLET_DISCONNECT_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(WALLET_DISCONNECT_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = walletDisconnectWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(WALLET_DISCONNECT_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Wallet disconnected ephemeral.
    expect(walletDisconnectSuccessCueText()).toBe(WALLET_DISCONNECT_SUCCESS_CUE);
    expect(walletDisconnectSuccessCueText()).toBe("Wallet disconnected");
  });

  it("stays quiet on fail; rim ≠ link / deed claim/mint / Busy / Free (edge)", () => {
    expect(shouldFlashWalletDisconnectWorldReinforce(false)).toBe(false);

    expect(WALLET_DISCONNECT_WORLD_REINFORCE.outerRgba).not.toBe(
      WALLET_LINK_WORLD_REINFORCE.outerRgba,
    );
    expect(WALLET_DISCONNECT_WORLD_REINFORCE.midRgba).not.toBe(
      WALLET_LINK_WORLD_REINFORCE.midRgba,
    );
    expect(WALLET_DISCONNECT_WORLD_REINFORCE.outerRgba).not.toBe(
      DEED_CLAIM_WORLD_REINFORCE.outerRgba,
    );
    expect(WALLET_DISCONNECT_WORLD_REINFORCE.outerRgba).not.toBe(
      DEED_MINT_WORLD_REINFORCE.outerRgba,
    );
    expect(WALLET_DISCONNECT_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_BUSY_WORLD_REINFORCE.outerRgba,
    );
    expect(WALLET_DISCONNECT_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_FREE_SETTLE_WORLD_REINFORCE.outerRgba,
    );
    expect(WALLET_DISCONNECT_WORLD_REINFORCE.clearPct).toBeLessThan(
      WALLET_DISCONNECT_WORLD_REINFORCE.midPct,
    );
    expect(WALLET_DISCONNECT_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent NFT combat; keeps core loops wallet-free (failure)", () => {
    expect(walletDisconnectWorldReinforceBackground()).not.toMatch(
      /nft|combat|fare|always.?on/i,
    );
    expect(String(WALLET_DISCONNECT_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|nft/i,
    );
    expect(WALLET_DISCONNECT_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashWalletDisconnectWorldReinforce(true)).not.toBe(
      shouldFlashWalletDisconnectWorldReinforce(false),
    );
  });
});
