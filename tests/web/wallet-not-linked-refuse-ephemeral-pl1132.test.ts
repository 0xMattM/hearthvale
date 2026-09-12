import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  WALLET_ALREADY_LINKED_REFUSE_CUE,
  WALLET_NOT_LINKED_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashWalletAlreadyLinkedRefuseCue,
  shouldFlashWalletNotLinkedRefuseCue,
  walletNotLinkedRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL113.2 — Wallet-not-linked refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Wallet` instead of sticky long wallet prose.
 * Disconnect rules unchanged; settings only; mute ok.
 */
describe("CityLands PL113.2 wallet-not-linked refuse ephemeral", () => {
  it("flashes Wallet for walletNotLinked (happy)", () => {
    expect(walletNotLinkedRefuseCueText()).toBe(WALLET_NOT_LINKED_REFUSE_CUE);
    expect(walletNotLinkedRefuseCueText()).toBe("Wallet");
    expect(
      shouldFlashWalletNotLinkedRefuseCue(ACTION_ERROR.walletNotLinked),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.walletNotLinked)).toBe(true);
    expect(isCoreSuccessCueText("Wallet")).toBe(true);
    expect(ACTION_ERROR.walletNotLinked.toLowerCase()).toMatch(
      /no wallet|not linked|linked/,
    );
  });

  it("stays quiet for wallet-already-linked refuse (edge)", () => {
    expect(
      shouldFlashWalletNotLinkedRefuseCue(ACTION_ERROR.walletAlreadyLinked),
    ).toBe(false);
    expect(walletNotLinkedRefuseCueText()).not.toBe(
      WALLET_ALREADY_LINKED_REFUSE_CUE,
    );
    expect(
      shouldFlashWalletAlreadyLinkedRefuseCue(ACTION_ERROR.walletNotLinked),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent disconnect rules (failure)", () => {
    expect(shouldFlashWalletNotLinkedRefuseCue(null)).toBe(false);
    expect(shouldFlashWalletNotLinkedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashWalletNotLinkedRefuseCue("")).toBe(false);
    expect(
      shouldFlashWalletNotLinkedRefuseCue(ACTION_ERROR.deedNotYours),
    ).toBe(false);
    expect(walletNotLinkedRefuseCueText()).not.toMatch(/\d/);
    expect(walletNotLinkedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.walletNotLinked.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.walletNotLinked)).toBe(false);
    expect(walletNotLinkedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
