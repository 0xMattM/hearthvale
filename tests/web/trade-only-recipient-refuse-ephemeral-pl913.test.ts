import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRADE_NOT_YOURS_REFUSE_CUE,
  TRADE_ONLY_RECIPIENT_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashTradeNotYoursRefuseCue,
  shouldFlashTradeOnlyRecipientRefuseCue,
  tradeOnlyRecipientRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL91.3 — Trade-only-recipient refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Wait` instead of sticky long trade prose.
 * Trade accept rules unchanged; mute ok.
 */
describe("CityLands PL91.3 trade-only-recipient refuse ephemeral", () => {
  it("flashes Wait for tradeOnlyRecipient (happy)", () => {
    expect(tradeOnlyRecipientRefuseCueText()).toBe(
      TRADE_ONLY_RECIPIENT_REFUSE_CUE,
    );
    expect(tradeOnlyRecipientRefuseCueText()).toBe("Wait");
    expect(
      shouldFlashTradeOnlyRecipientRefuseCue(ACTION_ERROR.tradeOnlyRecipient),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeOnlyRecipient)).toBe(true);
    expect(isCoreSuccessCueText("Wait")).toBe(true);
    expect(ACTION_ERROR.tradeOnlyRecipient.toLowerCase()).toMatch(
      /other player|accept/,
    );
  });

  it("stays quiet for unrelated trade not-yours refuse (edge)", () => {
    expect(
      shouldFlashTradeOnlyRecipientRefuseCue(ACTION_ERROR.tradeNotYours),
    ).toBe(false);
    expect(tradeOnlyRecipientRefuseCueText()).not.toBe(
      TRADE_NOT_YOURS_REFUSE_CUE,
    );
    expect(
      shouldFlashTradeNotYoursRefuseCue(ACTION_ERROR.tradeOnlyRecipient),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent accept rules (failure)", () => {
    expect(shouldFlashTradeOnlyRecipientRefuseCue(null)).toBe(false);
    expect(shouldFlashTradeOnlyRecipientRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTradeOnlyRecipientRefuseCue("")).toBe(false);
    expect(
      shouldFlashTradeOnlyRecipientRefuseCue(ACTION_ERROR.tradeYouBroke),
    ).toBe(false);
    expect(tradeOnlyRecipientRefuseCueText()).not.toMatch(/\d/);
    expect(tradeOnlyRecipientRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.tradeOnlyRecipient.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.tradeOnlyRecipient)).toBe(false);
    expect(tradeOnlyRecipientRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
