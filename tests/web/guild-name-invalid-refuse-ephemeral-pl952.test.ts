import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_INVITE_INVALID_REFUSE_CUE,
  GUILD_NAME_INVALID_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGuildInviteInvalidRefuseCue,
  shouldFlashGuildNameInvalidRefuseCue,
  guildNameInvalidRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL95.2 — Guild-name-invalid refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Name` instead of sticky long guild prose.
 * Guild naming bounds unchanged; mute ok.
 */
describe("CityLands PL95.2 guild-name-invalid refuse ephemeral", () => {
  it("flashes Name for guildNameInvalid (happy)", () => {
    expect(guildNameInvalidRefuseCueText()).toBe(
      GUILD_NAME_INVALID_REFUSE_CUE,
    );
    expect(guildNameInvalidRefuseCueText()).toBe("Name");
    expect(
      shouldFlashGuildNameInvalidRefuseCue(ACTION_ERROR.guildNameInvalid),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildNameInvalid)).toBe(true);
    expect(isCoreSuccessCueText("Name")).toBe(true);
    expect(ACTION_ERROR.guildNameInvalid.toLowerCase()).toMatch(
      /guild name|letters/,
    );
  });

  it("stays quiet for unrelated guild invite-invalid refuse (edge)", () => {
    expect(
      shouldFlashGuildNameInvalidRefuseCue(ACTION_ERROR.guildInviteInvalid),
    ).toBe(false);
    expect(guildNameInvalidRefuseCueText()).not.toBe(
      GUILD_INVITE_INVALID_REFUSE_CUE,
    );
    expect(
      shouldFlashGuildInviteInvalidRefuseCue(ACTION_ERROR.guildNameInvalid),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent naming bounds (failure)", () => {
    expect(shouldFlashGuildNameInvalidRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildNameInvalidRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildNameInvalidRefuseCue("")).toBe(false);
    expect(
      shouldFlashGuildNameInvalidRefuseCue(ACTION_ERROR.guildExists),
    ).toBe(false);
    expect(guildNameInvalidRefuseCueText()).not.toMatch(/\d/);
    expect(guildNameInvalidRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildNameInvalid.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildNameInvalid)).toBe(false);
    expect(guildNameInvalidRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
