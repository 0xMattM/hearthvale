import { describe, expect, it } from "vitest";
import {
  SUCCESS_CUE_MS,
  GUILD_RANK_CHANGE_SUCCESS_CUE,
  GUILD_INVITE_REFRESH_SUCCESS_CUE,
  GUILD_RANK_FORBIDDEN_REFUSE_CUE,
  GUILD_RANK_INVALID_REFUSE_CUE,
  isCoreSuccessCueText,
  guildRankChangeSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import { SFX_PRESETS, sfxStepsFor } from "../../apps/web/lib/game-audio";

/**
 * PL111.1 — Guild-rank-change success ephemeral.
 * Ephemeral TopBar Ranked + soft guild_claim SFX after owner sets member rank.
 * Rank enum / permissions unchanged; mute ok.
 */
describe("CityLands PL111.1 guild-rank-change success ephemeral", () => {
  it("uses short Ranked copy + soft guild_claim SFX (happy)", () => {
    expect(guildRankChangeSuccessCueText()).toBe(GUILD_RANK_CHANGE_SUCCESS_CUE);
    expect(guildRankChangeSuccessCueText()).toBe("Ranked");
    expect(isCoreSuccessCueText("Ranked")).toBe(true);
    expect(sfxStepsFor("guild_claim").length).toBeGreaterThan(0);
    expect(SFX_PRESETS.guild_claim.length).toBeGreaterThanOrEqual(1);
  });

  it("stays distinct from refuse Rank and invite refresh (edge)", () => {
    expect(guildRankChangeSuccessCueText()).not.toBe(
      GUILD_RANK_FORBIDDEN_REFUSE_CUE,
    );
    expect(guildRankChangeSuccessCueText()).not.toBe(
      GUILD_RANK_INVALID_REFUSE_CUE,
    );
    expect(guildRankChangeSuccessCueText()).not.toBe(
      GUILD_INVITE_REFRESH_SUCCESS_CUE,
    );
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not invent ranks or sticky prose (failure)", () => {
    expect(isCoreSuccessCueText("Ranked · officer forever")).toBe(false);
    expect(isCoreSuccessCueText("Member promoted to officer")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(GUILD_RANK_CHANGE_SUCCESS_CUE).not.toMatch(/officer|member|nft/i);
    expect(GUILD_RANK_CHANGE_SUCCESS_CUE.length).toBeLessThan(12);
  });
});
