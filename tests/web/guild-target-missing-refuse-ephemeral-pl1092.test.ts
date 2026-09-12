import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_ALREADY_IN_REFUSE_CUE,
  GUILD_NOT_FOUND_REFUSE_CUE,
  GUILD_TARGET_MISSING_REFUSE_CUE,
  isCoreSuccessCueText,
  guildTargetMissingRefuseCueText,
  shouldFlashGuildAlreadyInRefuseCue,
  shouldFlashGuildNotFoundRefuseCue,
  shouldFlashGuildTargetMissingRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL109.2 — Guild-target-missing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Member` instead of sticky long guild prose.
 * Guild membership rules unchanged; mute ok.
 */
describe("CityLands PL109.2 guild-target-missing refuse ephemeral", () => {
  it("flashes Member for guildTargetMissing (happy)", () => {
    expect(guildTargetMissingRefuseCueText()).toBe(
      GUILD_TARGET_MISSING_REFUSE_CUE,
    );
    expect(guildTargetMissingRefuseCueText()).toBe("Member");
    expect(
      shouldFlashGuildTargetMissingRefuseCue(ACTION_ERROR.guildTargetMissing),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildTargetMissing)).toBe(true);
    expect(isCoreSuccessCueText("Member")).toBe(true);
    expect(ACTION_ERROR.guildTargetMissing.toLowerCase()).toMatch(
      /guild|player/,
    );
  });

  it("stays quiet for already-in and not-found refuses (edge)", () => {
    expect(
      shouldFlashGuildTargetMissingRefuseCue(ACTION_ERROR.guildAlreadyIn),
    ).toBe(false);
    expect(
      shouldFlashGuildTargetMissingRefuseCue(ACTION_ERROR.guildNotFound),
    ).toBe(false);
    expect(guildTargetMissingRefuseCueText()).toBe(GUILD_ALREADY_IN_REFUSE_CUE);
    expect(guildTargetMissingRefuseCueText()).not.toBe(
      GUILD_NOT_FOUND_REFUSE_CUE,
    );
    expect(
      shouldFlashGuildAlreadyInRefuseCue(ACTION_ERROR.guildTargetMissing),
    ).toBe(false);
    expect(
      shouldFlashGuildNotFoundRefuseCue(ACTION_ERROR.guildTargetMissing),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent membership rules (failure)", () => {
    expect(shouldFlashGuildTargetMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildTargetMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildTargetMissingRefuseCue("")).toBe(false);
    expect(
      shouldFlashGuildTargetMissingRefuseCue(ACTION_ERROR.guildRankInvalid),
    ).toBe(false);
    expect(guildTargetMissingRefuseCueText()).not.toMatch(/\d/);
    expect(guildTargetMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildTargetMissing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildTargetMissing)).toBe(false);
    expect(guildTargetMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
