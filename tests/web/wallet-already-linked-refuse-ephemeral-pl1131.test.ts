import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  WALLET_ALREADY_LINKED_REFUSE_CUE,
  WALLET_NOT_LINKED_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashWalletAlreadyLinkedRefuseCue,
  shouldFlashWalletNotLinkedRefuseCue,
  walletAlreadyLinkedRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL113.1 — Wallet-already-linked refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Linked` instead of sticky long wallet prose.
 * Wallet rules unchanged; settings only; mute ok.
 */
describe("CityLands PL113.1 wallet-already-linked refuse ephemeral", () => {
  it("flashes Linked for walletAlreadyLinked (happy)", () => {
    expect(walletAlreadyLinkedRefuseCueText()).toBe(
      WALLET_ALREADY_LINKED_REFUSE_CUE,
    );
    expect(walletAlreadyLinkedRefuseCueText()).toBe("Linked");
    expect(
      shouldFlashWalletAlreadyLinkedRefuseCue(ACTION_ERROR.walletAlreadyLinked),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.walletAlreadyLinked)).toBe(true);
    expect(isCoreSuccessCueText("Linked")).toBe(true);
    expect(ACTION_ERROR.walletAlreadyLinked.toLowerCase()).toMatch(
      /already linked|wallet/,
    );
  });

  it("stays quiet for wallet-not-linked refuse (edge)", () => {
    expect(
      shouldFlashWalletAlreadyLinkedRefuseCue(ACTION_ERROR.walletNotLinked),
    ).toBe(false);
    expect(walletAlreadyLinkedRefuseCueText()).not.toBe(
      WALLET_NOT_LINKED_REFUSE_CUE,
    );
    expect(
      shouldFlashWalletNotLinkedRefuseCue(ACTION_ERROR.walletAlreadyLinked),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent wallet rules (failure)", () => {
    expect(shouldFlashWalletAlreadyLinkedRefuseCue(null)).toBe(false);
    expect(shouldFlashWalletAlreadyLinkedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashWalletAlreadyLinkedRefuseCue("")).toBe(false);
    expect(
      shouldFlashWalletAlreadyLinkedRefuseCue(ACTION_ERROR.deedMissing),
    ).toBe(false);
    expect(walletAlreadyLinkedRefuseCueText()).not.toMatch(/\d/);
    expect(walletAlreadyLinkedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.walletAlreadyLinked.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.walletAlreadyLinked)).toBe(false);
    expect(walletAlreadyLinkedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
