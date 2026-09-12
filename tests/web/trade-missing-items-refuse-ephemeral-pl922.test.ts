import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRADE_BROKE_REFUSE_CUE,
  TRADE_MISSING_ITEMS_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashTradeBrokeRefuseCue,
  shouldFlashTradeMissingItemsRefuseCue,
  tradeMissingItemsRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL92.2 — Trade-missing-items refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Items` instead of sticky long trade prose.
 * Trade item escrow unchanged; mute ok.
 */
describe("CityLands PL92.2 trade-missing-items refuse ephemeral", () => {
  it("flashes Items for you/sender missing items (happy)", () => {
    expect(tradeMissingItemsRefuseCueText()).toBe(
      TRADE_MISSING_ITEMS_REFUSE_CUE,
    );
    expect(tradeMissingItemsRefuseCueText()).toBe("Items");
    expect(
      shouldFlashTradeMissingItemsRefuseCue(ACTION_ERROR.tradeYouMissingItems),
    ).toBe(true);
    expect(
      shouldFlashTradeMissingItemsRefuseCue(
        ACTION_ERROR.tradeSenderMissingItems,
      ),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeYouMissingItems)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeSenderMissingItems)).toBe(true);
    expect(isCoreSuccessCueText("Items")).toBe(true);
    expect(ACTION_ERROR.tradeYouMissingItems.toLowerCase()).toMatch(/item/);
  });

  it("stays quiet for unrelated trade broke refuse (edge)", () => {
    expect(
      shouldFlashTradeMissingItemsRefuseCue(ACTION_ERROR.tradeYouBroke),
    ).toBe(false);
    expect(tradeMissingItemsRefuseCueText()).not.toBe(TRADE_BROKE_REFUSE_CUE);
    expect(
      shouldFlashTradeBrokeRefuseCue(ACTION_ERROR.tradeYouMissingItems),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent item escrow (failure)", () => {
    expect(shouldFlashTradeMissingItemsRefuseCue(null)).toBe(false);
    expect(shouldFlashTradeMissingItemsRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTradeMissingItemsRefuseCue("")).toBe(false);
    expect(
      shouldFlashTradeMissingItemsRefuseCue(ACTION_ERROR.notEnoughItems),
    ).toBe(false);
    expect(tradeMissingItemsRefuseCueText()).not.toMatch(/\d/);
    expect(tradeMissingItemsRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.tradeYouMissingItems.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.tradeYouMissingItems)).toBe(false);
    expect(tradeMissingItemsRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
