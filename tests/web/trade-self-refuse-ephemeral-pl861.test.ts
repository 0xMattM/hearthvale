import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRADE_EMPTY_REFUSE_CUE,
  TRADE_SELF_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashTradeEmptyRefuseCue,
  shouldFlashTradeSelfRefuseCue,
  tradeSelfRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL86.1 — Trade-self refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Self` instead of sticky long trade prose.
 * Trade rules unchanged; mute ok.
 */
describe("CityLands PL86.1 trade-self refuse ephemeral", () => {
  it("flashes Self for tradeSelf (happy)", () => {
    expect(tradeSelfRefuseCueText()).toBe(TRADE_SELF_REFUSE_CUE);
    expect(tradeSelfRefuseCueText()).toBe("Self");
    expect(shouldFlashTradeSelfRefuseCue(ACTION_ERROR.tradeSelf)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeSelf)).toBe(true);
    expect(isCoreSuccessCueText("Self")).toBe(true);
    expect(ACTION_ERROR.tradeSelf.toLowerCase()).toMatch(/yourself|self/);
  });

  it("stays quiet for unrelated trade empty refuse (edge)", () => {
    expect(shouldFlashTradeSelfRefuseCue(ACTION_ERROR.tradeEmpty)).toBe(false);
    expect(tradeSelfRefuseCueText()).not.toBe(TRADE_EMPTY_REFUSE_CUE);
    expect(shouldFlashTradeEmptyRefuseCue(ACTION_ERROR.tradeSelf)).toBe(false);
  });

  it("refuses unrelated errors and does not invent trade rules (failure)", () => {
    expect(shouldFlashTradeSelfRefuseCue(null)).toBe(false);
    expect(shouldFlashTradeSelfRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTradeSelfRefuseCue("")).toBe(false);
    expect(shouldFlashTradeSelfRefuseCue(ACTION_ERROR.tradePlayerMissing)).toBe(
      false,
    );
    expect(tradeSelfRefuseCueText()).not.toMatch(/\d/);
    expect(tradeSelfRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.tradeSelf.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.tradeSelf)).toBe(false);
    expect(tradeSelfRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
