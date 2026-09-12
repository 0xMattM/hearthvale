import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  BUILD_PLAYER_LAND_ONLY_REFUSE_CUE,
  CLAIM_WAR_NEED_GUILD_REFUSE_CUE,
  claimWarNeedGuildRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashBuildPlayerLandOnlyRefuseCue,
  shouldFlashClaimWarNeedGuildRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL88.1 — Claim-war-need-guild refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Guild` instead of sticky long contest prose.
 * Soft-war rules unchanged; mute ok.
 */
describe("CityLands PL88.1 claim-war-need-guild refuse ephemeral", () => {
  it("flashes Guild for claimWarNeedGuild (happy)", () => {
    expect(claimWarNeedGuildRefuseCueText()).toBe(
      CLAIM_WAR_NEED_GUILD_REFUSE_CUE,
    );
    expect(claimWarNeedGuildRefuseCueText()).toBe("Guild");
    expect(
      shouldFlashClaimWarNeedGuildRefuseCue(ACTION_ERROR.claimWarNeedGuild),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimWarNeedGuild)).toBe(true);
    expect(isCoreSuccessCueText("Guild")).toBe(true);
    expect(ACTION_ERROR.claimWarNeedGuild.toLowerCase()).toMatch(
      /guild|contest/,
    );
  });

  it("stays quiet for unrelated land-place refuse (edge)", () => {
    expect(
      shouldFlashClaimWarNeedGuildRefuseCue(ACTION_ERROR.buildPlayerLandOnly),
    ).toBe(false);
    expect(claimWarNeedGuildRefuseCueText()).not.toBe(
      BUILD_PLAYER_LAND_ONLY_REFUSE_CUE,
    );
    expect(
      shouldFlashBuildPlayerLandOnlyRefuseCue(ACTION_ERROR.claimWarNeedGuild),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent soft-war rules (failure)", () => {
    expect(shouldFlashClaimWarNeedGuildRefuseCue(null)).toBe(false);
    expect(shouldFlashClaimWarNeedGuildRefuseCue(undefined)).toBe(false);
    expect(shouldFlashClaimWarNeedGuildRefuseCue("")).toBe(false);
    expect(
      shouldFlashClaimWarNeedGuildRefuseCue(ACTION_ERROR.claimNeedGuild),
    ).toBe(false);
    expect(claimWarNeedGuildRefuseCueText()).not.toMatch(/\d/);
    expect(claimWarNeedGuildRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.claimWarNeedGuild.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.claimWarNeedGuild)).toBe(false);
    expect(claimWarNeedGuildRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
