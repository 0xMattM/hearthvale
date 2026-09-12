import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MAIL_INBOX_FULL_REFUSE_CUE,
  MAIL_SELF_REFUSE_CUE,
  isCoreSuccessCueText,
  mailInboxFullRefuseCueText,
  shouldFlashMailInboxFullRefuseCue,
  shouldFlashMailSelfRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL84.2 — Mail-inbox-full refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Full` instead of sticky long mail prose.
 * Mailbox caps unchanged; mute ok.
 */
describe("CityLands PL84.2 mail-inbox-full refuse ephemeral", () => {
  it("flashes Full for mailInboxFull (happy)", () => {
    expect(mailInboxFullRefuseCueText()).toBe(MAIL_INBOX_FULL_REFUSE_CUE);
    expect(mailInboxFullRefuseCueText()).toBe("Full");
    expect(shouldFlashMailInboxFullRefuseCue(ACTION_ERROR.mailInboxFull)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.mailInboxFull)).toBe(true);
    expect(isCoreSuccessCueText("Full")).toBe(true);
    expect(ACTION_ERROR.mailInboxFull.toLowerCase()).toMatch(/full|mailbox/);
  });

  it("stays quiet for unrelated mail self refuse (edge)", () => {
    expect(shouldFlashMailInboxFullRefuseCue(ACTION_ERROR.mailSelf)).toBe(
      false,
    );
    expect(mailInboxFullRefuseCueText()).not.toBe(MAIL_SELF_REFUSE_CUE);
    expect(shouldFlashMailSelfRefuseCue(ACTION_ERROR.mailInboxFull)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent mail rules (failure)", () => {
    expect(shouldFlashMailInboxFullRefuseCue(null)).toBe(false);
    expect(shouldFlashMailInboxFullRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMailInboxFullRefuseCue("")).toBe(false);
    expect(shouldFlashMailInboxFullRefuseCue(ACTION_ERROR.mailEmpty)).toBe(
      false,
    );
    expect(mailInboxFullRefuseCueText()).not.toMatch(/\d/);
    expect(mailInboxFullRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.mailInboxFull.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.mailInboxFull)).toBe(false);
    expect(mailInboxFullRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
