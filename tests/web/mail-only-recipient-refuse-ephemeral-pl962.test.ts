import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MAIL_NOT_FOUND_REFUSE_CUE,
  MAIL_ONLY_RECIPIENT_REFUSE_CUE,
  MAIL_ONLY_SENDER_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashMailNotFoundRefuseCue,
  shouldFlashMailOnlyRecipientRefuseCue,
  shouldFlashMailOnlySenderRefuseCue,
  mailOnlyRecipientRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL96.2 — Mail-only-recipient refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Wait` instead of sticky long mail prose.
 * Mail claim rules unchanged; mute ok.
 */
describe("CityLands PL96.2 mail-only-recipient refuse ephemeral", () => {
  it("flashes Wait for mailOnlyRecipient (happy)", () => {
    expect(mailOnlyRecipientRefuseCueText()).toBe(
      MAIL_ONLY_RECIPIENT_REFUSE_CUE,
    );
    expect(mailOnlyRecipientRefuseCueText()).toBe("Wait");
    expect(
      shouldFlashMailOnlyRecipientRefuseCue(ACTION_ERROR.mailOnlyRecipient),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailOnlyRecipient)).toBe(true);
    expect(isCoreSuccessCueText("Wait")).toBe(true);
    expect(ACTION_ERROR.mailOnlyRecipient.toLowerCase()).toMatch(
      /recipient|claim/,
    );
  });

  it("stays quiet for unrelated mail not-found / only-sender refuses (edge)", () => {
    expect(
      shouldFlashMailOnlyRecipientRefuseCue(ACTION_ERROR.mailNotFound),
    ).toBe(false);
    expect(mailOnlyRecipientRefuseCueText()).not.toBe(MAIL_NOT_FOUND_REFUSE_CUE);
    expect(mailOnlyRecipientRefuseCueText()).not.toBe(MAIL_ONLY_SENDER_REFUSE_CUE);
    expect(
      shouldFlashMailNotFoundRefuseCue(ACTION_ERROR.mailOnlyRecipient),
    ).toBe(false);
    expect(
      shouldFlashMailOnlySenderRefuseCue(ACTION_ERROR.mailOnlyRecipient),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent claim rules (failure)", () => {
    expect(shouldFlashMailOnlyRecipientRefuseCue(null)).toBe(false);
    expect(shouldFlashMailOnlyRecipientRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMailOnlyRecipientRefuseCue("")).toBe(false);
    expect(
      shouldFlashMailOnlyRecipientRefuseCue(ACTION_ERROR.tradeOnlyRecipient),
    ).toBe(false);
    expect(mailOnlyRecipientRefuseCueText()).not.toMatch(/\d/);
    expect(mailOnlyRecipientRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.mailOnlyRecipient.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.mailOnlyRecipient)).toBe(false);
    expect(mailOnlyRecipientRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
