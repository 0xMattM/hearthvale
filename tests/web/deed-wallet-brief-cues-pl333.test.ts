import { describe, expect, it } from "vitest";
import {
  DEED_CLAIM_SUCCESS_CUE,
  DEED_LIST_SUCCESS_CUE,
  DEED_MINT_SUCCESS_CUE,
  DEED_UNLIST_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  WALLET_DISCONNECT_SUCCESS_CUE,
  WALLET_LINK_SUCCESS_CUE,
  deedClaimSuccessCueText,
  deedListSuccessCueText,
  deedMintSuccessCueText,
  deedUnlistSuccessCueText,
  isCoreSuccessCueText,
  walletDisconnectSuccessCueText,
  walletLinkSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL33.3 — Deed / wallet surface brief cues (ephemeral; sticky setInfo replaced).
 * No combat power; core loops stay wallet-free; settings/deed surface only.
 */
describe("CityLands PL33.3 deed / wallet surface brief cues", () => {
  it("ships short deed + wallet ephemeral cues (happy)", () => {
    expect(deedClaimSuccessCueText()).toBe(DEED_CLAIM_SUCCESS_CUE);
    expect(deedClaimSuccessCueText()).toBe("Deed claimed");
    expect(deedMintSuccessCueText()).toBe(DEED_MINT_SUCCESS_CUE);
    expect(deedMintSuccessCueText()).toBe("Deed minted");
    expect(deedListSuccessCueText()).toBe(DEED_LIST_SUCCESS_CUE);
    expect(deedListSuccessCueText()).toBe("Deed listed");
    expect(deedUnlistSuccessCueText()).toBe(DEED_UNLIST_SUCCESS_CUE);
    expect(deedUnlistSuccessCueText()).toBe("Deed unlisted");
    expect(walletLinkSuccessCueText()).toBe(WALLET_LINK_SUCCESS_CUE);
    expect(walletLinkSuccessCueText()).toBe("Wallet linked");
    expect(walletDisconnectSuccessCueText()).toBe(
      WALLET_DISCONNECT_SUCCESS_CUE,
    );
    expect(walletDisconnectSuccessCueText()).toBe("Wallet disconnected");

    expect(isCoreSuccessCueText(deedClaimSuccessCueText())).toBe(true);
    expect(isCoreSuccessCueText(deedMintSuccessCueText())).toBe(true);
    expect(isCoreSuccessCueText(deedListSuccessCueText())).toBe(true);
    expect(isCoreSuccessCueText(deedUnlistSuccessCueText())).toBe(true);
    expect(isCoreSuccessCueText(walletLinkSuccessCueText())).toBe(true);
    expect(isCoreSuccessCueText(walletDisconnectSuccessCueText())).toBe(true);
  });

  it("keeps brief SUCCESS_CUE_MS and distinct short copy (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);

    const cues = [
      deedClaimSuccessCueText(),
      deedMintSuccessCueText(),
      deedListSuccessCueText(),
      deedUnlistSuccessCueText(),
      walletLinkSuccessCueText(),
      walletDisconnectSuccessCueText(),
    ];
    expect(new Set(cues).size).toBe(cues.length);
    for (const cue of cues) {
      expect(cue.length).toBeLessThanOrEqual(24);
      expect(cue.includes(".")).toBe(false);
    }
  });

  it("does not treat sticky deed/wallet prose as the cue (failure)", () => {
    expect(
      isCoreSuccessCueText("Deed claimed — cosmetic/production only."),
    ).toBe(false);
    expect(isCoreSuccessCueText("Stub mint recorded (mock chain).")).toBe(
      false,
    );
    expect(isCoreSuccessCueText("Listed on mock deed board.")).toBe(false);
    expect(isCoreSuccessCueText("Unlisted from mock board.")).toBe(false);
    expect(
      isCoreSuccessCueText(
        "Stub wallet linked — play still works without it.",
      ),
    ).toBe(false);
    expect(
      isCoreSuccessCueText(
        "Premium forest deed recorded off-chain — no combat bonus.",
      ),
    ).toBe(false);
    expect(isCoreSuccessCueText("Wallet disconnected.")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
  });
});
