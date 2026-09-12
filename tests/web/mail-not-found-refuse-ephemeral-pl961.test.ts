import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MAIL_NOT_FOUND_REFUSE_CUE,
  MAIL_ONLY_RECIPIENT_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashMailNotFoundRefuseCue,
  shouldFlashMailOnlyRecipientRefuseCue,
  mailNotFoundRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL96.1 — Mail-not-found refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` instead of sticky long mail prose.
 * Mail escrow unchanged; mute ok.
 */
describe("CityLands PL96.1 mail-not-found refuse ephemeral", () => {
  it("flashes Gone for mailNotFound (happy)", () => {
    expect(mailNotFoundRefuseCueText()).toBe(MAIL_NOT_FOUND_REFUSE_CUE);
    expect(mailNotFoundRefuseCueText()).toBe("Gone");
    expect(shouldFlashMailNotFoundRefuseCue(ACTION_ERROR.mailNotFound)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.mailNotFound)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.mailNotFound.toLowerCase()).toMatch(
      /no longer|available/,
    );
  });

  it("stays quiet for unrelated mail only-recipient refuse (edge)", () => {
    expect(
      shouldFlashMailNotFoundRefuseCue(ACTION_ERROR.mailOnlyRecipient),
    ).toBe(false);
    expect(mailNotFoundRefuseCueText()).not.toBe(MAIL_ONLY_RECIPIENT_REFUSE_CUE);
    expect(
      shouldFlashMailOnlyRecipientRefuseCue(ACTION_ERROR.mailNotFound),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent mail escrow (failure)", () => {
    expect(shouldFlashMailNotFoundRefuseCue(null)).toBe(false);
    expect(shouldFlashMailNotFoundRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMailNotFoundRefuseCue("")).toBe(false);
    expect(
      shouldFlashMailNotFoundRefuseCue(ACTION_ERROR.mailAlreadyClaimed),
    ).toBe(false);
    expect(mailNotFoundRefuseCueText()).not.toMatch(/\d/);
    expect(mailNotFoundRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.mailNotFound.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.mailNotFound)).toBe(false);
    expect(mailNotFoundRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
