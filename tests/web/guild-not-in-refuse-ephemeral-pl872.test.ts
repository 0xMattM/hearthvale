import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_ALREADY_IN_REFUSE_CUE,
  GUILD_NOT_IN_REFUSE_CUE,
  guildNotInRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashGuildAlreadyInRefuseCue,
  shouldFlashGuildNotInRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL87.2 — Guild-not-in refuse ephemeral.
 * Soft refuse SFX + brief TopBar `No guild` instead of sticky long guild prose.
 * Guild rules unchanged; mute ok.
 */
describe("CityLands PL87.2 guild-not-in refuse ephemeral", () => {
  it("flashes No guild for guildNotIn (happy)", () => {
    expect(guildNotInRefuseCueText()).toBe(GUILD_NOT_IN_REFUSE_CUE);
    expect(guildNotInRefuseCueText()).toBe("No guild");
    expect(shouldFlashGuildNotInRefuseCue(ACTION_ERROR.guildNotIn)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildNotIn)).toBe(true);
    expect(isCoreSuccessCueText("No guild")).toBe(true);
    expect(ACTION_ERROR.guildNotIn.toLowerCase()).toMatch(/not in a guild/);
  });

  it("stays quiet for unrelated guild already-in refuse (edge)", () => {
    expect(shouldFlashGuildNotInRefuseCue(ACTION_ERROR.guildAlreadyIn)).toBe(
      false,
    );
    expect(guildNotInRefuseCueText()).not.toBe(GUILD_ALREADY_IN_REFUSE_CUE);
    expect(shouldFlashGuildAlreadyInRefuseCue(ACTION_ERROR.guildNotIn)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent guild rules (failure)", () => {
    expect(shouldFlashGuildNotInRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildNotInRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildNotInRefuseCue("")).toBe(false);
    expect(shouldFlashGuildNotInRefuseCue(ACTION_ERROR.guildExists)).toBe(
      false,
    );
    expect(guildNotInRefuseCueText()).not.toMatch(/\d/);
    expect(guildNotInRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildNotIn.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildNotIn)).toBe(false);
    expect(guildNotInRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
