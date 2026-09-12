import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_ALREADY_IN_REFUSE_CUE,
  GUILD_NOT_IN_REFUSE_CUE,
  guildAlreadyInRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashGuildAlreadyInRefuseCue,
  shouldFlashGuildNotInRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL87.1 — Guild-already-in refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Member` instead of sticky long guild prose.
 * Guild rules unchanged; mute ok.
 */
describe("CityLands PL87.1 guild-already-in refuse ephemeral", () => {
  it("flashes Member for guildAlreadyIn (happy)", () => {
    expect(guildAlreadyInRefuseCueText()).toBe(GUILD_ALREADY_IN_REFUSE_CUE);
    expect(guildAlreadyInRefuseCueText()).toBe("Member");
    expect(shouldFlashGuildAlreadyInRefuseCue(ACTION_ERROR.guildAlreadyIn)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.guildAlreadyIn)).toBe(true);
    expect(isCoreSuccessCueText("Member")).toBe(true);
    expect(ACTION_ERROR.guildAlreadyIn.toLowerCase()).toMatch(
      /already|guild/,
    );
  });

  it("stays quiet for unrelated guild not-in refuse (edge)", () => {
    expect(shouldFlashGuildAlreadyInRefuseCue(ACTION_ERROR.guildNotIn)).toBe(
      false,
    );
    expect(guildAlreadyInRefuseCueText()).not.toBe(GUILD_NOT_IN_REFUSE_CUE);
    expect(shouldFlashGuildNotInRefuseCue(ACTION_ERROR.guildAlreadyIn)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent guild rules (failure)", () => {
    expect(shouldFlashGuildAlreadyInRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildAlreadyInRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildAlreadyInRefuseCue("")).toBe(false);
    expect(shouldFlashGuildAlreadyInRefuseCue(ACTION_ERROR.guildExists)).toBe(
      false,
    );
    expect(guildAlreadyInRefuseCueText()).not.toMatch(/\d/);
    expect(guildAlreadyInRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildAlreadyIn.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildAlreadyIn)).toBe(false);
    expect(guildAlreadyInRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
