import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MAIL_ALREADY_CLAIMED_REFUSE_CUE,
  MAIL_PLAYER_MISSING_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashMailAlreadyClaimedRefuseCue,
  shouldFlashMailPlayerMissingRefuseCue,
  mailAlreadyClaimedRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL93.3 — Mail-already-claimed refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Claimed` instead of sticky long mail prose.
 * Mail claim rules unchanged; mute ok.
 */
describe("CityLands PL93.3 mail-already-claimed refuse ephemeral", () => {
  it("flashes Claimed for mailAlreadyClaimed (happy)", () => {
    expect(mailAlreadyClaimedRefuseCueText()).toBe(
      MAIL_ALREADY_CLAIMED_REFUSE_CUE,
    );
    expect(mailAlreadyClaimedRefuseCueText()).toBe("Claimed");
    expect(
      shouldFlashMailAlreadyClaimedRefuseCue(ACTION_ERROR.mailAlreadyClaimed),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailAlreadyClaimed)).toBe(true);
    expect(isCoreSuccessCueText("Claimed")).toBe(true);
    expect(ACTION_ERROR.mailAlreadyClaimed.toLowerCase()).toMatch(/claimed/);
  });

  it("stays quiet for unrelated mail player-missing refuse (edge)", () => {
    expect(
      shouldFlashMailAlreadyClaimedRefuseCue(ACTION_ERROR.mailPlayerMissing),
    ).toBe(false);
    expect(mailAlreadyClaimedRefuseCueText()).not.toBe(
      MAIL_PLAYER_MISSING_REFUSE_CUE,
    );
    expect(
      shouldFlashMailPlayerMissingRefuseCue(ACTION_ERROR.mailAlreadyClaimed),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent claim rules (failure)", () => {
    expect(shouldFlashMailAlreadyClaimedRefuseCue(null)).toBe(false);
    expect(shouldFlashMailAlreadyClaimedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMailAlreadyClaimedRefuseCue("")).toBe(false);
    expect(
      shouldFlashMailAlreadyClaimedRefuseCue(ACTION_ERROR.questAlreadyClaimed),
    ).toBe(false);
    expect(mailAlreadyClaimedRefuseCueText()).not.toMatch(/\d/);
    expect(mailAlreadyClaimedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.mailAlreadyClaimed.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.mailAlreadyClaimed)).toBe(false);
    expect(mailAlreadyClaimedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
