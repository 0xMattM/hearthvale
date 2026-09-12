import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRADE_BROKE_REFUSE_CUE,
  TRADE_MISSING_ITEMS_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashTradeBrokeRefuseCue,
  shouldFlashTradeMissingItemsRefuseCue,
  tradeBrokeRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL92.1 — Trade-broke refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Broke` instead of sticky long trade prose.
 * Trade coin escrow unchanged; mute ok.
 */
describe("CityLands PL92.1 trade-broke refuse ephemeral", () => {
  it("flashes Broke for tradeYouBroke and tradeSenderBroke (happy)", () => {
    expect(tradeBrokeRefuseCueText()).toBe(TRADE_BROKE_REFUSE_CUE);
    expect(tradeBrokeRefuseCueText()).toBe("Broke");
    expect(shouldFlashTradeBrokeRefuseCue(ACTION_ERROR.tradeYouBroke)).toBe(
      true,
    );
    expect(shouldFlashTradeBrokeRefuseCue(ACTION_ERROR.tradeSenderBroke)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.tradeYouBroke)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeSenderBroke)).toBe(true);
    expect(isCoreSuccessCueText("Broke")).toBe(true);
    expect(ACTION_ERROR.tradeYouBroke.toLowerCase()).toMatch(/coin/);
  });

  it("stays quiet for unrelated trade missing-items refuse (edge)", () => {
    expect(
      shouldFlashTradeBrokeRefuseCue(ACTION_ERROR.tradeYouMissingItems),
    ).toBe(false);
    expect(tradeBrokeRefuseCueText()).not.toBe(TRADE_MISSING_ITEMS_REFUSE_CUE);
    expect(shouldFlashTradeMissingItemsRefuseCue(ACTION_ERROR.tradeYouBroke)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent coin escrow (failure)", () => {
    expect(shouldFlashTradeBrokeRefuseCue(null)).toBe(false);
    expect(shouldFlashTradeBrokeRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTradeBrokeRefuseCue("")).toBe(false);
    expect(shouldFlashTradeBrokeRefuseCue(ACTION_ERROR.notEnoughCoins)).toBe(
      false,
    );
    expect(tradeBrokeRefuseCueText()).not.toMatch(/\d/);
    expect(tradeBrokeRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.tradeYouBroke.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.tradeYouBroke)).toBe(false);
    expect(tradeBrokeRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
