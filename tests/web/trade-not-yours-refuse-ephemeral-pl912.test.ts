import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRADE_NOT_FOUND_REFUSE_CUE,
  TRADE_NOT_YOURS_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashTradeNotFoundRefuseCue,
  shouldFlashTradeNotYoursRefuseCue,
  tradeNotYoursRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL91.2 — Trade-not-yours refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Yours` instead of sticky long trade prose.
 * Trade escrow unchanged; mute ok.
 */
describe("CityLands PL91.2 trade-not-yours refuse ephemeral", () => {
  it("flashes Yours for tradeNotYours (happy)", () => {
    expect(tradeNotYoursRefuseCueText()).toBe(TRADE_NOT_YOURS_REFUSE_CUE);
    expect(tradeNotYoursRefuseCueText()).toBe("Yours");
    expect(shouldFlashTradeNotYoursRefuseCue(ACTION_ERROR.tradeNotYours)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.tradeNotYours)).toBe(true);
    expect(isCoreSuccessCueText("Yours")).toBe(true);
    expect(ACTION_ERROR.tradeNotYours.toLowerCase()).toMatch(/not yours/);
  });

  it("stays quiet for unrelated trade not-found refuse (edge)", () => {
    expect(shouldFlashTradeNotYoursRefuseCue(ACTION_ERROR.tradeNotFound)).toBe(
      false,
    );
    expect(tradeNotYoursRefuseCueText()).not.toBe(TRADE_NOT_FOUND_REFUSE_CUE);
    expect(shouldFlashTradeNotFoundRefuseCue(ACTION_ERROR.tradeNotYours)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent trade rules (failure)", () => {
    expect(shouldFlashTradeNotYoursRefuseCue(null)).toBe(false);
    expect(shouldFlashTradeNotYoursRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTradeNotYoursRefuseCue("")).toBe(false);
    expect(
      shouldFlashTradeNotYoursRefuseCue(ACTION_ERROR.tradeOnlyRecipient),
    ).toBe(false);
    expect(tradeNotYoursRefuseCueText()).not.toMatch(/\d/);
    expect(tradeNotYoursRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.tradeNotYours.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.tradeNotYours)).toBe(false);
    expect(tradeNotYoursRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
