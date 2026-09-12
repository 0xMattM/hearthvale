import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MAIL_EMPTY_REFUSE_CUE,
  MAIL_PLAYER_MISSING_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashMailEmptyRefuseCue,
  shouldFlashMailPlayerMissingRefuseCue,
  mailPlayerMissingRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL93.2 — Mail-player-missing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` instead of sticky long mail prose.
 * Mail rules unchanged; mute ok.
 */
describe("CityLands PL93.2 mail-player-missing refuse ephemeral", () => {
  it("flashes Gone for mailPlayerMissing (happy)", () => {
    expect(mailPlayerMissingRefuseCueText()).toBe(
      MAIL_PLAYER_MISSING_REFUSE_CUE,
    );
    expect(mailPlayerMissingRefuseCueText()).toBe("Gone");
    expect(
      shouldFlashMailPlayerMissingRefuseCue(ACTION_ERROR.mailPlayerMissing),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailPlayerMissing)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.mailPlayerMissing.toLowerCase()).toMatch(
      /find|player/,
    );
  });

  it("stays quiet for unrelated mail empty refuse (edge)", () => {
    expect(
      shouldFlashMailPlayerMissingRefuseCue(ACTION_ERROR.mailEmpty),
    ).toBe(false);
    expect(mailPlayerMissingRefuseCueText()).not.toBe(MAIL_EMPTY_REFUSE_CUE);
    expect(
      shouldFlashMailEmptyRefuseCue(ACTION_ERROR.mailPlayerMissing),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent mail rules (failure)", () => {
    expect(shouldFlashMailPlayerMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashMailPlayerMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMailPlayerMissingRefuseCue("")).toBe(false);
    // Reason: tradePlayerMissing shares the same ACTION_ERROR prose; use mailSelf instead.
    expect(shouldFlashMailPlayerMissingRefuseCue(ACTION_ERROR.mailSelf)).toBe(
      false,
    );
    expect(mailPlayerMissingRefuseCueText()).not.toMatch(/\d/);
    expect(mailPlayerMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.mailPlayerMissing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.mailPlayerMissing)).toBe(false);
    expect(mailPlayerMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
