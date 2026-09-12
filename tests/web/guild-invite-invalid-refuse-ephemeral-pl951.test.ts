import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_INVITE_INVALID_REFUSE_CUE,
  GUILD_NAME_INVALID_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGuildInviteInvalidRefuseCue,
  shouldFlashGuildNameInvalidRefuseCue,
  guildInviteInvalidRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL95.1 — Guild-invite-invalid refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Code` instead of sticky long guild prose.
 * Guild invite rules unchanged; mute ok.
 */
describe("CityLands PL95.1 guild-invite-invalid refuse ephemeral", () => {
  it("flashes Code for guildInviteInvalid (happy)", () => {
    expect(guildInviteInvalidRefuseCueText()).toBe(
      GUILD_INVITE_INVALID_REFUSE_CUE,
    );
    expect(guildInviteInvalidRefuseCueText()).toBe("Code");
    expect(
      shouldFlashGuildInviteInvalidRefuseCue(ACTION_ERROR.guildInviteInvalid),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildInviteInvalid)).toBe(true);
    expect(isCoreSuccessCueText("Code")).toBe(true);
    expect(ACTION_ERROR.guildInviteInvalid.toLowerCase()).toMatch(
      /invite|valid/,
    );
  });

  it("stays quiet for unrelated guild name-invalid refuse (edge)", () => {
    expect(
      shouldFlashGuildInviteInvalidRefuseCue(ACTION_ERROR.guildNameInvalid),
    ).toBe(false);
    expect(guildInviteInvalidRefuseCueText()).not.toBe(
      GUILD_NAME_INVALID_REFUSE_CUE,
    );
    expect(
      shouldFlashGuildNameInvalidRefuseCue(ACTION_ERROR.guildInviteInvalid),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent invite rules (failure)", () => {
    expect(shouldFlashGuildInviteInvalidRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildInviteInvalidRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildInviteInvalidRefuseCue("")).toBe(false);
    expect(
      shouldFlashGuildInviteInvalidRefuseCue(ACTION_ERROR.guildExists),
    ).toBe(false);
    expect(guildInviteInvalidRefuseCueText()).not.toMatch(/\d/);
    expect(guildInviteInvalidRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildInviteInvalid.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildInviteInvalid)).toBe(false);
    expect(guildInviteInvalidRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
