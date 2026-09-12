import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_ALREADY_IN_REFUSE_CUE,
  GUILD_EXISTS_REFUSE_CUE,
  guildExistsRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashGuildAlreadyInRefuseCue,
  shouldFlashGuildExistsRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL87.3 — Guild-exists refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Taken` instead of sticky long guild prose.
 * Guild naming unchanged; mute ok.
 */
describe("CityLands PL87.3 guild-exists refuse ephemeral", () => {
  it("flashes Taken for guildExists (happy)", () => {
    expect(guildExistsRefuseCueText()).toBe(GUILD_EXISTS_REFUSE_CUE);
    expect(guildExistsRefuseCueText()).toBe("Taken");
    expect(shouldFlashGuildExistsRefuseCue(ACTION_ERROR.guildExists)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.guildExists)).toBe(true);
    expect(isCoreSuccessCueText("Taken")).toBe(true);
    expect(ACTION_ERROR.guildExists.toLowerCase()).toMatch(/taken|name/);
  });

  it("stays quiet for unrelated guild already-in refuse (edge)", () => {
    expect(shouldFlashGuildExistsRefuseCue(ACTION_ERROR.guildAlreadyIn)).toBe(
      false,
    );
    expect(guildExistsRefuseCueText()).not.toBe(GUILD_ALREADY_IN_REFUSE_CUE);
    expect(shouldFlashGuildAlreadyInRefuseCue(ACTION_ERROR.guildExists)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent guild rules (failure)", () => {
    expect(shouldFlashGuildExistsRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildExistsRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildExistsRefuseCue("")).toBe(false);
    expect(shouldFlashGuildExistsRefuseCue(ACTION_ERROR.guildNotIn)).toBe(
      false,
    );
    expect(guildExistsRefuseCueText()).not.toMatch(/\d/);
    expect(guildExistsRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildExists.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildExists)).toBe(false);
    expect(guildExistsRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
