import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRADE_NOT_FOUND_REFUSE_CUE,
  TRADE_NOT_YOURS_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashTradeNotFoundRefuseCue,
  shouldFlashTradeNotYoursRefuseCue,
  tradeNotFoundRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL91.1 — Trade-not-found refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` instead of sticky long trade prose.
 * Trade escrow unchanged; mute ok.
 */
describe("CityLands PL91.1 trade-not-found refuse ephemeral", () => {
  it("flashes Gone for tradeNotFound (happy)", () => {
    expect(tradeNotFoundRefuseCueText()).toBe(TRADE_NOT_FOUND_REFUSE_CUE);
    expect(tradeNotFoundRefuseCueText()).toBe("Gone");
    expect(shouldFlashTradeNotFoundRefuseCue(ACTION_ERROR.tradeNotFound)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.tradeNotFound)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.tradeNotFound.toLowerCase()).toMatch(
      /no longer|available/,
    );
  });

  it("stays quiet for unrelated trade not-yours refuse (edge)", () => {
    expect(shouldFlashTradeNotFoundRefuseCue(ACTION_ERROR.tradeNotYours)).toBe(
      false,
    );
    expect(tradeNotFoundRefuseCueText()).not.toBe(TRADE_NOT_YOURS_REFUSE_CUE);
    expect(shouldFlashTradeNotYoursRefuseCue(ACTION_ERROR.tradeNotFound)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent trade rules (failure)", () => {
    expect(shouldFlashTradeNotFoundRefuseCue(null)).toBe(false);
    expect(shouldFlashTradeNotFoundRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTradeNotFoundRefuseCue("")).toBe(false);
    expect(
      shouldFlashTradeNotFoundRefuseCue(ACTION_ERROR.tradePlayerMissing),
    ).toBe(false);
    expect(tradeNotFoundRefuseCueText()).not.toMatch(/\d/);
    expect(tradeNotFoundRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.tradeNotFound.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.tradeNotFound)).toBe(false);
    expect(tradeNotFoundRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
