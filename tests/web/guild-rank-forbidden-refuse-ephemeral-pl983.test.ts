import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_BANK_FULL_REFUSE_CUE,
  GUILD_RANK_FORBIDDEN_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGuildBankFullRefuseCue,
  shouldFlashGuildRankForbiddenRefuseCue,
  guildRankForbiddenRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL98.3 — Guild-rank-forbidden refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Rank` instead of sticky long guild prose.
 * Guild rank / invite refresh rules unchanged; mute ok.
 */
describe("CityLands PL98.3 guild-rank-forbidden refuse ephemeral", () => {
  it("flashes Rank for guildRankForbidden and guildInviteForbidden (happy)", () => {
    expect(guildRankForbiddenRefuseCueText()).toBe(
      GUILD_RANK_FORBIDDEN_REFUSE_CUE,
    );
    expect(guildRankForbiddenRefuseCueText()).toBe("Rank");
    expect(
      shouldFlashGuildRankForbiddenRefuseCue(ACTION_ERROR.guildRankForbidden),
    ).toBe(true);
    expect(
      shouldFlashGuildRankForbiddenRefuseCue(ACTION_ERROR.guildInviteForbidden),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildRankForbidden)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildInviteForbidden)).toBe(true);
    expect(isCoreSuccessCueText("Rank")).toBe(true);
    expect(ACTION_ERROR.guildRankForbidden.toLowerCase()).toMatch(
      /owner|rank/,
    );
    expect(ACTION_ERROR.guildInviteForbidden.toLowerCase()).toMatch(
      /officer|invite/,
    );
  });

  it("stays quiet for unrelated guild-bank-full refuse (edge)", () => {
    expect(
      shouldFlashGuildRankForbiddenRefuseCue(ACTION_ERROR.guildBankFull),
    ).toBe(false);
    expect(guildRankForbiddenRefuseCueText()).not.toBe(
      GUILD_BANK_FULL_REFUSE_CUE,
    );
    expect(
      shouldFlashGuildBankFullRefuseCue(ACTION_ERROR.guildRankForbidden),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent rank rules (failure)", () => {
    expect(shouldFlashGuildRankForbiddenRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildRankForbiddenRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildRankForbiddenRefuseCue("")).toBe(false);
    expect(
      shouldFlashGuildRankForbiddenRefuseCue(ACTION_ERROR.guildInviteInvalid),
    ).toBe(false);
    expect(guildRankForbiddenRefuseCueText()).not.toMatch(/\d/);
    expect(guildRankForbiddenRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildRankForbidden.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildRankForbidden)).toBe(false);
    expect(guildRankForbiddenRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
