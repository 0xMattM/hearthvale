import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRADE_EMPTY_REFUSE_CUE,
  TRADE_PLAYER_MISSING_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashTradeEmptyRefuseCue,
  shouldFlashTradePlayerMissingRefuseCue,
  tradePlayerMissingRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL86.3 — Trade-player-missing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` instead of sticky long trade prose.
 * Trade rules unchanged; mute ok.
 */
describe("CityLands PL86.3 trade-player-missing refuse ephemeral", () => {
  it("flashes Gone for tradePlayerMissing (happy)", () => {
    expect(tradePlayerMissingRefuseCueText()).toBe(
      TRADE_PLAYER_MISSING_REFUSE_CUE,
    );
    expect(tradePlayerMissingRefuseCueText()).toBe("Gone");
    expect(
      shouldFlashTradePlayerMissingRefuseCue(ACTION_ERROR.tradePlayerMissing),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradePlayerMissing)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.tradePlayerMissing.toLowerCase()).toMatch(
      /find|player/,
    );
  });

  it("stays quiet for unrelated trade empty refuse (edge)", () => {
    expect(
      shouldFlashTradePlayerMissingRefuseCue(ACTION_ERROR.tradeEmpty),
    ).toBe(false);
    expect(tradePlayerMissingRefuseCueText()).not.toBe(TRADE_EMPTY_REFUSE_CUE);
    expect(
      shouldFlashTradeEmptyRefuseCue(ACTION_ERROR.tradePlayerMissing),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent trade rules (failure)", () => {
    expect(shouldFlashTradePlayerMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashTradePlayerMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTradePlayerMissingRefuseCue("")).toBe(false);
    expect(
      shouldFlashTradePlayerMissingRefuseCue(ACTION_ERROR.tradeSelf),
    ).toBe(false);
    expect(tradePlayerMissingRefuseCueText()).not.toMatch(/\d/);
    expect(tradePlayerMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.tradePlayerMissing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.tradePlayerMissing)).toBe(false);
    expect(tradePlayerMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
