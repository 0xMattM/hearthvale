import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MAIL_EMPTY_REFUSE_CUE,
  MAIL_PLAYER_MISSING_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashMailEmptyRefuseCue,
  shouldFlashMailPlayerMissingRefuseCue,
  mailEmptyRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL93.1 — Mail-empty refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Empty` instead of sticky long mail prose.
 * Mail escrow unchanged; mute ok.
 */
describe("CityLands PL93.1 mail-empty refuse ephemeral", () => {
  it("flashes Empty for mailEmpty (happy)", () => {
    expect(mailEmptyRefuseCueText()).toBe(MAIL_EMPTY_REFUSE_CUE);
    expect(mailEmptyRefuseCueText()).toBe("Empty");
    expect(shouldFlashMailEmptyRefuseCue(ACTION_ERROR.mailEmpty)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailEmpty)).toBe(true);
    expect(isCoreSuccessCueText("Empty")).toBe(true);
    expect(ACTION_ERROR.mailEmpty.toLowerCase()).toMatch(/goods|coins|parcel/);
  });

  it("stays quiet for unrelated mail player-missing refuse (edge)", () => {
    expect(
      shouldFlashMailEmptyRefuseCue(ACTION_ERROR.mailPlayerMissing),
    ).toBe(false);
    expect(mailEmptyRefuseCueText()).not.toBe(MAIL_PLAYER_MISSING_REFUSE_CUE);
    expect(shouldFlashMailPlayerMissingRefuseCue(ACTION_ERROR.mailEmpty)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent mail rules (failure)", () => {
    expect(shouldFlashMailEmptyRefuseCue(null)).toBe(false);
    expect(shouldFlashMailEmptyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMailEmptyRefuseCue("")).toBe(false);
    expect(shouldFlashMailEmptyRefuseCue(ACTION_ERROR.mailSelf)).toBe(false);
    expect(mailEmptyRefuseCueText()).not.toMatch(/\d/);
    expect(mailEmptyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.mailEmpty.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.mailEmpty)).toBe(false);
    expect(mailEmptyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
