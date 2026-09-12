import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  DEED_ALREADY_OWNED_REFUSE_CUE,
  DEED_BAD_PRICE_REFUSE_CUE,
  DEED_NEED_FOREST_REFUSE_CUE,
  isCoreSuccessCueText,
  deedAlreadyOwnedRefuseCueText,
  deedBadPriceRefuseCueText,
  deedNeedForestRefuseCueText,
  shouldFlashDeedAlreadyOwnedRefuseCue,
  shouldFlashDeedBadPriceRefuseCue,
  shouldFlashDeedMissingRefuseCue,
  shouldFlashDeedNeedForestRefuseCue,
  shouldFlashDeedNeedMintRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL112.3 — Deed-price / owned / forest refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Price` / `Owned` / `Forest` instead of sticky prose.
 * Price bounds / forest unlock unchanged; surface only; mute ok.
 */
describe("CityLands PL112.3 deed-price / owned / forest refuse ephemeral", () => {
  it("flashes Price / Owned / Forest for price·owned·forest refuses (happy)", () => {
    expect(deedBadPriceRefuseCueText()).toBe(DEED_BAD_PRICE_REFUSE_CUE);
    expect(deedBadPriceRefuseCueText()).toBe("Price");
    expect(shouldFlashDeedBadPriceRefuseCue(ACTION_ERROR.deedBadPrice)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.deedBadPrice)).toBe(true);

    expect(deedAlreadyOwnedRefuseCueText()).toBe(DEED_ALREADY_OWNED_REFUSE_CUE);
    expect(deedAlreadyOwnedRefuseCueText()).toBe("Owned");
    expect(
      shouldFlashDeedAlreadyOwnedRefuseCue(ACTION_ERROR.deedAlreadyOwned),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.deedAlreadyOwned)).toBe(true);

    expect(deedNeedForestRefuseCueText()).toBe(DEED_NEED_FOREST_REFUSE_CUE);
    expect(deedNeedForestRefuseCueText()).toBe("Forest");
    expect(shouldFlashDeedNeedForestRefuseCue(ACTION_ERROR.deedNeedForest)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.deedNeedForest)).toBe(true);

    expect(isCoreSuccessCueText("Price")).toBe(true);
    expect(isCoreSuccessCueText("Owned")).toBe(true);
    expect(isCoreSuccessCueText("Forest")).toBe(true);
    expect(ACTION_ERROR.deedBadPrice.toLowerCase()).toMatch(/price|10|500/);
    expect(ACTION_ERROR.deedNeedForest.toLowerCase()).toMatch(/forest/);
  });

  it("keeps price·owned·forest flashers isolated from mint/Gone (edge)", () => {
    expect(shouldFlashDeedBadPriceRefuseCue(ACTION_ERROR.deedAlreadyOwned)).toBe(
      false,
    );
    expect(
      shouldFlashDeedAlreadyOwnedRefuseCue(ACTION_ERROR.deedNeedForest),
    ).toBe(false);
    expect(shouldFlashDeedNeedForestRefuseCue(ACTION_ERROR.deedBadPrice)).toBe(
      false,
    );
    expect(shouldFlashDeedNeedMintRefuseCue(ACTION_ERROR.deedBadPrice)).toBe(
      false,
    );
    expect(shouldFlashDeedMissingRefuseCue(ACTION_ERROR.deedNeedForest)).toBe(
      false,
    );
    expect(deedBadPriceRefuseCueText()).not.toBe(
      deedAlreadyOwnedRefuseCueText(),
    );
    expect(deedNeedForestRefuseCueText()).not.toBe(
      deedBadPriceRefuseCueText(),
    );
  });

  it("refuses unrelated errors and does not invent price/forest rules (failure)", () => {
    expect(shouldFlashDeedBadPriceRefuseCue(null)).toBe(false);
    expect(shouldFlashDeedAlreadyOwnedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashDeedNeedForestRefuseCue("")).toBe(false);
    expect(
      shouldFlashDeedBadPriceRefuseCue(ACTION_ERROR.deedAlreadyListed),
    ).toBe(false);
    expect(deedBadPriceRefuseCueText()).not.toMatch(/\d/);
    expect(deedAlreadyOwnedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.deedAlreadyOwned.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.deedBadPrice)).toBe(false);
    expect(deedNeedForestRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
