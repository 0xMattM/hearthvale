import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRADE_EMPTY_REFUSE_CUE,
  TRADE_SELF_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashTradeEmptyRefuseCue,
  shouldFlashTradeSelfRefuseCue,
  tradeEmptyRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL86.2 — Trade-empty refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Empty` instead of sticky long trade prose.
 * Trade rules unchanged; mute ok.
 */
describe("CityLands PL86.2 trade-empty refuse ephemeral", () => {
  it("flashes Empty for tradeEmpty (happy)", () => {
    expect(tradeEmptyRefuseCueText()).toBe(TRADE_EMPTY_REFUSE_CUE);
    expect(tradeEmptyRefuseCueText()).toBe("Empty");
    expect(shouldFlashTradeEmptyRefuseCue(ACTION_ERROR.tradeEmpty)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeEmpty)).toBe(true);
    expect(isCoreSuccessCueText("Empty")).toBe(true);
    expect(ACTION_ERROR.tradeEmpty.toLowerCase()).toMatch(/item|coin|add/);
  });

  it("stays quiet for unrelated trade self refuse (edge)", () => {
    expect(shouldFlashTradeEmptyRefuseCue(ACTION_ERROR.tradeSelf)).toBe(false);
    expect(tradeEmptyRefuseCueText()).not.toBe(TRADE_SELF_REFUSE_CUE);
    expect(shouldFlashTradeSelfRefuseCue(ACTION_ERROR.tradeEmpty)).toBe(false);
  });

  it("refuses unrelated errors and does not invent trade rules (failure)", () => {
    expect(shouldFlashTradeEmptyRefuseCue(null)).toBe(false);
    expect(shouldFlashTradeEmptyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTradeEmptyRefuseCue("")).toBe(false);
    expect(
      shouldFlashTradeEmptyRefuseCue(ACTION_ERROR.tradePlayerMissing),
    ).toBe(false);
    expect(tradeEmptyRefuseCueText()).not.toMatch(/\d/);
    expect(tradeEmptyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.tradeEmpty.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.tradeEmpty)).toBe(false);
    expect(tradeEmptyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
