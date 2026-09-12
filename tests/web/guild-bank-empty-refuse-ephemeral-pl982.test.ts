import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_BANK_EMPTY_REFUSE_CUE,
  GUILD_BANK_FULL_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGuildBankEmptyRefuseCue,
  shouldFlashGuildBankFullRefuseCue,
  guildBankEmptyRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL98.2 — Guild-bank-empty refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Empty` instead of sticky long guild-bank prose.
 * Guild bank withdraw rules unchanged; mute ok.
 */
describe("CityLands PL98.2 guild-bank-empty refuse ephemeral", () => {
  it("flashes Empty for guildBankEmpty (happy)", () => {
    expect(guildBankEmptyRefuseCueText()).toBe(GUILD_BANK_EMPTY_REFUSE_CUE);
    expect(guildBankEmptyRefuseCueText()).toBe("Empty");
    expect(
      shouldFlashGuildBankEmptyRefuseCue(ACTION_ERROR.guildBankEmpty),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildBankEmpty)).toBe(true);
    expect(isCoreSuccessCueText("Empty")).toBe(true);
    expect(ACTION_ERROR.guildBankEmpty.toLowerCase()).toMatch(
      /guild bank|enough/,
    );
  });

  it("stays quiet for unrelated guild-bank-full refuse (edge)", () => {
    expect(shouldFlashGuildBankEmptyRefuseCue(ACTION_ERROR.guildBankFull)).toBe(
      false,
    );
    expect(guildBankEmptyRefuseCueText()).not.toBe(GUILD_BANK_FULL_REFUSE_CUE);
    expect(
      shouldFlashGuildBankFullRefuseCue(ACTION_ERROR.guildBankEmpty),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent withdraw rules (failure)", () => {
    expect(shouldFlashGuildBankEmptyRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildBankEmptyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildBankEmptyRefuseCue("")).toBe(false);
    expect(shouldFlashGuildBankEmptyRefuseCue(ACTION_ERROR.mailEmpty)).toBe(
      false,
    );
    expect(guildBankEmptyRefuseCueText()).not.toMatch(/\d/);
    expect(guildBankEmptyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildBankEmpty.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildBankEmpty)).toBe(false);
    expect(guildBankEmptyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
