import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_RANK_FORBIDDEN_REFUSE_CUE,
  GUILD_RANK_INVALID_REFUSE_CUE,
  GUILD_TARGET_MISSING_REFUSE_CUE,
  isCoreSuccessCueText,
  guildRankInvalidRefuseCueText,
  shouldFlashGuildRankForbiddenRefuseCue,
  shouldFlashGuildRankInvalidRefuseCue,
  shouldFlashGuildTargetMissingRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL109.3 — Guild-rank-invalid refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Rank` instead of sticky long guild prose.
 * Rank enum unchanged; mute ok.
 */
describe("CityLands PL109.3 guild-rank-invalid refuse ephemeral", () => {
  it("flashes Rank for guildRankInvalid (happy)", () => {
    expect(guildRankInvalidRefuseCueText()).toBe(GUILD_RANK_INVALID_REFUSE_CUE);
    expect(guildRankInvalidRefuseCueText()).toBe("Rank");
    expect(
      shouldFlashGuildRankInvalidRefuseCue(ACTION_ERROR.guildRankInvalid),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildRankInvalid)).toBe(true);
    expect(isCoreSuccessCueText("Rank")).toBe(true);
    expect(ACTION_ERROR.guildRankInvalid.toLowerCase()).toMatch(/rank/);
  });

  it("stays quiet for rank-forbidden and target-missing refuses (edge)", () => {
    expect(
      shouldFlashGuildRankInvalidRefuseCue(ACTION_ERROR.guildRankForbidden),
    ).toBe(false);
    expect(
      shouldFlashGuildRankInvalidRefuseCue(ACTION_ERROR.guildTargetMissing),
    ).toBe(false);
    expect(guildRankInvalidRefuseCueText()).toBe(
      GUILD_RANK_FORBIDDEN_REFUSE_CUE,
    );
    expect(guildRankInvalidRefuseCueText()).not.toBe(
      GUILD_TARGET_MISSING_REFUSE_CUE,
    );
    expect(
      shouldFlashGuildRankForbiddenRefuseCue(ACTION_ERROR.guildRankInvalid),
    ).toBe(false);
    expect(
      shouldFlashGuildTargetMissingRefuseCue(ACTION_ERROR.guildRankInvalid),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent rank rules (failure)", () => {
    expect(shouldFlashGuildRankInvalidRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildRankInvalidRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildRankInvalidRefuseCue("")).toBe(false);
    expect(
      shouldFlashGuildRankInvalidRefuseCue(ACTION_ERROR.guildInviteForbidden),
    ).toBe(false);
    expect(guildRankInvalidRefuseCueText()).not.toMatch(/\d/);
    expect(guildRankInvalidRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildRankInvalid.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildRankInvalid)).toBe(false);
    expect(guildRankInvalidRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
