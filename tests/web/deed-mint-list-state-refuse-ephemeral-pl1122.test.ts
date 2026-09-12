import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  DEED_ALREADY_LISTED_REFUSE_CUE,
  DEED_ALREADY_MINTED_REFUSE_CUE,
  DEED_NEED_MINT_REFUSE_CUE,
  DEED_NOT_LISTED_REFUSE_CUE,
  isCoreSuccessCueText,
  deedAlreadyListedRefuseCueText,
  deedAlreadyMintedRefuseCueText,
  deedNeedMintRefuseCueText,
  deedNotListedRefuseCueText,
  shouldFlashDeedAlreadyListedRefuseCue,
  shouldFlashDeedAlreadyMintedRefuseCue,
  shouldFlashDeedMissingRefuseCue,
  shouldFlashDeedNeedMintRefuseCue,
  shouldFlashDeedNotListedRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL112.2 — Deed-mint / list-state refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Mint` / `Listed` / `Unlisted` instead of sticky prose.
 * Mint/list rules unchanged; surface only; mute ok.
 */
describe("CityLands PL112.2 deed-mint / list-state refuse ephemeral", () => {
  it("flashes Mint / Listed / Unlisted for mint and list-state refuses (happy)", () => {
    expect(deedNeedMintRefuseCueText()).toBe(DEED_NEED_MINT_REFUSE_CUE);
    expect(deedNeedMintRefuseCueText()).toBe("Mint");
    expect(shouldFlashDeedNeedMintRefuseCue(ACTION_ERROR.deedNeedMint)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.deedNeedMint)).toBe(true);

    expect(deedAlreadyMintedRefuseCueText()).toBe(
      DEED_ALREADY_MINTED_REFUSE_CUE,
    );
    expect(deedAlreadyMintedRefuseCueText()).toBe("Mint");
    expect(
      shouldFlashDeedAlreadyMintedRefuseCue(ACTION_ERROR.deedAlreadyMinted),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.deedAlreadyMinted)).toBe(true);

    expect(deedAlreadyListedRefuseCueText()).toBe(
      DEED_ALREADY_LISTED_REFUSE_CUE,
    );
    expect(deedAlreadyListedRefuseCueText()).toBe("Listed");
    expect(
      shouldFlashDeedAlreadyListedRefuseCue(ACTION_ERROR.deedAlreadyListed),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.deedAlreadyListed)).toBe(true);

    expect(deedNotListedRefuseCueText()).toBe(DEED_NOT_LISTED_REFUSE_CUE);
    expect(deedNotListedRefuseCueText()).toBe("Unlisted");
    expect(shouldFlashDeedNotListedRefuseCue(ACTION_ERROR.deedNotListed)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.deedNotListed)).toBe(true);

    expect(isCoreSuccessCueText("Mint")).toBe(true);
    expect(isCoreSuccessCueText("Listed")).toBe(true);
    expect(isCoreSuccessCueText("Unlisted")).toBe(true);
  });

  it("keeps mint vs list flashers isolated from each other and Gone (edge)", () => {
    expect(shouldFlashDeedNeedMintRefuseCue(ACTION_ERROR.deedAlreadyListed)).toBe(
      false,
    );
    expect(
      shouldFlashDeedAlreadyListedRefuseCue(ACTION_ERROR.deedNeedMint),
    ).toBe(false);
    expect(shouldFlashDeedNotListedRefuseCue(ACTION_ERROR.deedAlreadyListed)).toBe(
      false,
    );
    expect(
      shouldFlashDeedAlreadyMintedRefuseCue(ACTION_ERROR.deedNeedMint),
    ).toBe(false);
    expect(shouldFlashDeedMissingRefuseCue(ACTION_ERROR.deedNeedMint)).toBe(
      false,
    );
    expect(deedNeedMintRefuseCueText()).toBe(deedAlreadyMintedRefuseCueText());
    expect(deedAlreadyListedRefuseCueText()).not.toBe(
      deedNotListedRefuseCueText(),
    );
    expect(deedNeedMintRefuseCueText()).not.toBe(
      deedAlreadyListedRefuseCueText(),
    );
  });

  it("refuses unrelated errors and does not invent mint/list rules (failure)", () => {
    expect(shouldFlashDeedNeedMintRefuseCue(null)).toBe(false);
    expect(shouldFlashDeedAlreadyListedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashDeedNotListedRefuseCue("")).toBe(false);
    expect(
      shouldFlashDeedAlreadyMintedRefuseCue(ACTION_ERROR.deedMissing),
    ).toBe(false);
    expect(deedNeedMintRefuseCueText()).not.toMatch(/\d/);
    expect(deedAlreadyListedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.deedAlreadyListed.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.deedNeedMint)).toBe(false);
    expect(deedNotListedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
