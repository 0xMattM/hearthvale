import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MAIL_INBOX_FULL_REFUSE_CUE,
  MAIL_SELF_REFUSE_CUE,
  isCoreSuccessCueText,
  mailSelfRefuseCueText,
  shouldFlashMailInboxFullRefuseCue,
  shouldFlashMailSelfRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL84.1 — Mail-self refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Self` instead of sticky long mail prose.
 * Mail escrow unchanged; mute ok.
 */
describe("CityLands PL84.1 mail-self refuse ephemeral", () => {
  it("flashes Self for mailSelf (happy)", () => {
    expect(mailSelfRefuseCueText()).toBe(MAIL_SELF_REFUSE_CUE);
    expect(mailSelfRefuseCueText()).toBe("Self");
    expect(shouldFlashMailSelfRefuseCue(ACTION_ERROR.mailSelf)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailSelf)).toBe(true);
    expect(isCoreSuccessCueText("Self")).toBe(true);
    expect(ACTION_ERROR.mailSelf.toLowerCase()).toMatch(/yourself|self/);
  });

  it("stays quiet for unrelated mail inbox-full refuse (edge)", () => {
    expect(shouldFlashMailSelfRefuseCue(ACTION_ERROR.mailInboxFull)).toBe(
      false,
    );
    expect(mailSelfRefuseCueText()).not.toBe(MAIL_INBOX_FULL_REFUSE_CUE);
    expect(shouldFlashMailInboxFullRefuseCue(ACTION_ERROR.mailSelf)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent mail rules (failure)", () => {
    expect(shouldFlashMailSelfRefuseCue(null)).toBe(false);
    expect(shouldFlashMailSelfRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMailSelfRefuseCue("")).toBe(false);
    expect(shouldFlashMailSelfRefuseCue(ACTION_ERROR.mailEmpty)).toBe(false);
    expect(mailSelfRefuseCueText()).not.toMatch(/\d/);
    expect(mailSelfRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.mailSelf.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.mailSelf)).toBe(false);
    expect(mailSelfRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
