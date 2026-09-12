import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  COINS_REFUSE_CUE,
  DECOR_NEED_COINS_REFUSE_CUE,
  MARKET_NEED_FEE_REFUSE_CUE,
  TRAVEL_NEED_COINS_REFUSE_CUE,
  UNKNOWN_DECOR_REFUSE_CUE,
  decorNeedCoinsRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashCoinsRefuseCue,
  shouldFlashDecorNeedCoinsRefuseCue,
  shouldFlashMarketNeedFeeRefuseCue,
  shouldFlashTravelNeedCoinsRefuseCue,
  shouldFlashUnknownDecorRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL106.2 — Decor-need-coins refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Coins` instead of sticky long decor-price prose.
 * Decor prices unchanged; mute ok; distinct from market Fee.
 */
describe("CityLands PL106.2 decor-need-coins refuse ephemeral", () => {
  it("flashes Coins for needCoinsDecor (happy)", () => {
    expect(decorNeedCoinsRefuseCueText()).toBe(DECOR_NEED_COINS_REFUSE_CUE);
    expect(decorNeedCoinsRefuseCueText()).toBe("Coins");
    expect(
      shouldFlashDecorNeedCoinsRefuseCue(ACTION_ERROR.needCoinsDecor(18)),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needCoinsDecor(18))).toBe(true);
    expect(isCoreSuccessCueText("Coins")).toBe(true);
    expect(ACTION_ERROR.needCoinsDecor(18).toLowerCase()).toMatch(
      /decor|coin/,
    );
  });

  it("stays quiet for place coins, fee, travel, and unknown-decor (edge)", () => {
    expect(
      shouldFlashDecorNeedCoinsRefuseCue(ACTION_ERROR.needCoinsBuild(40)),
    ).toBe(false);
    expect(
      shouldFlashDecorNeedCoinsRefuseCue(ACTION_ERROR.notEnoughCoins),
    ).toBe(false);
    expect(
      shouldFlashDecorNeedCoinsRefuseCue(ACTION_ERROR.marketNeedFee(12)),
    ).toBe(false);
    expect(
      shouldFlashDecorNeedCoinsRefuseCue(ACTION_ERROR.needCoinsTravel(15)),
    ).toBe(false);
    expect(
      shouldFlashDecorNeedCoinsRefuseCue(ACTION_ERROR.unknownDecor),
    ).toBe(false);
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.needCoinsDecor(18))).toBe(
      false,
    );
    expect(
      shouldFlashMarketNeedFeeRefuseCue(ACTION_ERROR.needCoinsDecor(18)),
    ).toBe(false);
    expect(
      shouldFlashTravelNeedCoinsRefuseCue(ACTION_ERROR.needCoinsDecor(18)),
    ).toBe(false);
    expect(
      shouldFlashUnknownDecorRefuseCue(ACTION_ERROR.needCoinsDecor(18)),
    ).toBe(false);
    expect(decorNeedCoinsRefuseCueText()).toBe(COINS_REFUSE_CUE);
    expect(decorNeedCoinsRefuseCueText()).toBe(TRAVEL_NEED_COINS_REFUSE_CUE);
    expect(decorNeedCoinsRefuseCueText()).not.toBe(MARKET_NEED_FEE_REFUSE_CUE);
    expect(decorNeedCoinsRefuseCueText()).not.toBe(UNKNOWN_DECOR_REFUSE_CUE);
  });

  it("refuses unrelated errors and does not invent decor prices (failure)", () => {
    expect(shouldFlashDecorNeedCoinsRefuseCue(null)).toBe(false);
    expect(shouldFlashDecorNeedCoinsRefuseCue(undefined)).toBe(false);
    expect(shouldFlashDecorNeedCoinsRefuseCue("")).toBe(false);
    expect(
      shouldFlashDecorNeedCoinsRefuseCue(ACTION_ERROR.decorPadMissing),
    ).toBe(false);
    expect(decorNeedCoinsRefuseCueText()).not.toMatch(/\d/);
    expect(decorNeedCoinsRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.needCoinsDecor(18).length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.needCoinsDecor(18))).toBe(false);
    expect(decorNeedCoinsRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
