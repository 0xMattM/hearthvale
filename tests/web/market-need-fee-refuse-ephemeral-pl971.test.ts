import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MARKET_NEED_FEE_REFUSE_CUE,
  MARKET_NOT_STACKABLE_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashCoinsRefuseCue,
  shouldFlashMarketNeedFeeRefuseCue,
  shouldFlashMarketNotStackableRefuseCue,
  marketNeedFeeRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL97.1 — Market-need-fee refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Fee` instead of sticky long market / Coins prose.
 * Listing fee numbers unchanged; mute ok.
 */
describe("CityLands PL97.1 market-need-fee refuse ephemeral", () => {
  it("flashes Fee for marketNeedFee (happy)", () => {
    expect(marketNeedFeeRefuseCueText()).toBe(MARKET_NEED_FEE_REFUSE_CUE);
    expect(marketNeedFeeRefuseCueText()).toBe("Fee");
    expect(
      shouldFlashMarketNeedFeeRefuseCue(ACTION_ERROR.marketNeedFee(12)),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketNeedFee(12))).toBe(true);
    expect(isCoreSuccessCueText("Fee")).toBe(true);
    expect(ACTION_ERROR.marketNeedFee(12).toLowerCase()).toMatch(
      /listing fee|coin/,
    );
  });

  it("stays quiet for place coins and not-stackable refuses (edge)", () => {
    expect(
      shouldFlashMarketNeedFeeRefuseCue(ACTION_ERROR.needCoinsBuild(40)),
    ).toBe(false);
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.marketNeedFee(12))).toBe(
      false,
    );
    expect(marketNeedFeeRefuseCueText()).not.toBe(
      MARKET_NOT_STACKABLE_REFUSE_CUE,
    );
    expect(
      shouldFlashMarketNotStackableRefuseCue(ACTION_ERROR.marketNeedFee(12)),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent listing fees (failure)", () => {
    expect(shouldFlashMarketNeedFeeRefuseCue(null)).toBe(false);
    expect(shouldFlashMarketNeedFeeRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMarketNeedFeeRefuseCue("")).toBe(false);
    expect(
      shouldFlashMarketNeedFeeRefuseCue(ACTION_ERROR.notEnoughCoins),
    ).toBe(false);
    expect(marketNeedFeeRefuseCueText()).not.toMatch(/\d/);
    expect(marketNeedFeeRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.marketNeedFee(12).length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.marketNeedFee(12))).toBe(false);
    expect(marketNeedFeeRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
