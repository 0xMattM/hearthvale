import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MAIL_ONLY_RECIPIENT_REFUSE_CUE,
  MAIL_ONLY_SENDER_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashMailOnlyRecipientRefuseCue,
  shouldFlashMailOnlySenderRefuseCue,
  mailOnlySenderRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL96.3 — Mail-only-sender refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Sender` instead of sticky long mail prose.
 * Mail cancel rules unchanged; mute ok.
 */
describe("CityLands PL96.3 mail-only-sender refuse ephemeral", () => {
  it("flashes Sender for mailOnlySender (happy)", () => {
    expect(mailOnlySenderRefuseCueText()).toBe(MAIL_ONLY_SENDER_REFUSE_CUE);
    expect(mailOnlySenderRefuseCueText()).toBe("Sender");
    expect(shouldFlashMailOnlySenderRefuseCue(ACTION_ERROR.mailOnlySender)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.mailOnlySender)).toBe(true);
    expect(isCoreSuccessCueText("Sender")).toBe(true);
    expect(ACTION_ERROR.mailOnlySender.toLowerCase()).toMatch(/sender|cancel/);
  });

  it("stays quiet for unrelated mail only-recipient refuse (edge)", () => {
    expect(
      shouldFlashMailOnlySenderRefuseCue(ACTION_ERROR.mailOnlyRecipient),
    ).toBe(false);
    expect(mailOnlySenderRefuseCueText()).not.toBe(
      MAIL_ONLY_RECIPIENT_REFUSE_CUE,
    );
    expect(
      shouldFlashMailOnlyRecipientRefuseCue(ACTION_ERROR.mailOnlySender),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent cancel rules (failure)", () => {
    expect(shouldFlashMailOnlySenderRefuseCue(null)).toBe(false);
    expect(shouldFlashMailOnlySenderRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMailOnlySenderRefuseCue("")).toBe(false);
    expect(shouldFlashMailOnlySenderRefuseCue(ACTION_ERROR.mailNotFound)).toBe(
      false,
    );
    expect(mailOnlySenderRefuseCueText()).not.toMatch(/\d/);
    expect(mailOnlySenderRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.mailOnlySender.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.mailOnlySender)).toBe(false);
    expect(mailOnlySenderRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
