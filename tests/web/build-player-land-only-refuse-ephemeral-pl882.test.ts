import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  BUILD_PLAYER_LAND_ONLY_REFUSE_CUE,
  CLAIM_WAR_NEED_GUILD_REFUSE_CUE,
  buildPlayerLandOnlyRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashBuildPlayerLandOnlyRefuseCue,
  shouldFlashClaimWarNeedGuildRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL88.2 — Build-player-land-only refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Land` instead of sticky long place prose.
 * Place rules unchanged; mute ok.
 */
describe("CityLands PL88.2 build-player-land-only refuse ephemeral", () => {
  it("flashes Land for buildPlayerLandOnly (happy)", () => {
    expect(buildPlayerLandOnlyRefuseCueText()).toBe(
      BUILD_PLAYER_LAND_ONLY_REFUSE_CUE,
    );
    expect(buildPlayerLandOnlyRefuseCueText()).toBe("Land");
    expect(
      shouldFlashBuildPlayerLandOnlyRefuseCue(ACTION_ERROR.buildPlayerLandOnly),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.buildPlayerLandOnly)).toBe(true);
    expect(isCoreSuccessCueText("Land")).toBe(true);
    expect(ACTION_ERROR.buildPlayerLandOnly.toLowerCase()).toMatch(
      /own land|place/,
    );
  });

  it("stays quiet for unrelated contest-guild refuse (edge)", () => {
    expect(
      shouldFlashBuildPlayerLandOnlyRefuseCue(ACTION_ERROR.claimWarNeedGuild),
    ).toBe(false);
    expect(buildPlayerLandOnlyRefuseCueText()).not.toBe(
      CLAIM_WAR_NEED_GUILD_REFUSE_CUE,
    );
    expect(
      shouldFlashClaimWarNeedGuildRefuseCue(ACTION_ERROR.buildPlayerLandOnly),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent place rules (failure)", () => {
    expect(shouldFlashBuildPlayerLandOnlyRefuseCue(null)).toBe(false);
    expect(shouldFlashBuildPlayerLandOnlyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashBuildPlayerLandOnlyRefuseCue("")).toBe(false);
    expect(
      shouldFlashBuildPlayerLandOnlyRefuseCue(ACTION_ERROR.buildCellOccupied),
    ).toBe(false);
    expect(buildPlayerLandOnlyRefuseCueText()).not.toMatch(/\d/);
    expect(buildPlayerLandOnlyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.buildPlayerLandOnly.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.buildPlayerLandOnly)).toBe(false);
    expect(buildPlayerLandOnlyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
