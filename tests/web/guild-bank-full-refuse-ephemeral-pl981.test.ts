import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_BANK_EMPTY_REFUSE_CUE,
  GUILD_BANK_FULL_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGuildBankEmptyRefuseCue,
  shouldFlashGuildBankFullRefuseCue,
  guildBankFullRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL98.1 — Guild-bank-full refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Full` instead of sticky long guild-bank prose.
 * Guild bank slots unchanged; mute ok.
 */
describe("CityLands PL98.1 guild-bank-full refuse ephemeral", () => {
  it("flashes Full for guildBankFull (happy)", () => {
    expect(guildBankFullRefuseCueText()).toBe(GUILD_BANK_FULL_REFUSE_CUE);
    expect(guildBankFullRefuseCueText()).toBe("Full");
    expect(shouldFlashGuildBankFullRefuseCue(ACTION_ERROR.guildBankFull)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.guildBankFull)).toBe(true);
    expect(isCoreSuccessCueText("Full")).toBe(true);
    expect(ACTION_ERROR.guildBankFull.toLowerCase()).toMatch(/guild bank|slots/);
  });

  it("stays quiet for unrelated guild-bank-empty refuse (edge)", () => {
    expect(shouldFlashGuildBankFullRefuseCue(ACTION_ERROR.guildBankEmpty)).toBe(
      false,
    );
    expect(guildBankFullRefuseCueText()).not.toBe(GUILD_BANK_EMPTY_REFUSE_CUE);
    expect(shouldFlashGuildBankEmptyRefuseCue(ACTION_ERROR.guildBankFull)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent bank rules (failure)", () => {
    expect(shouldFlashGuildBankFullRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildBankFullRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildBankFullRefuseCue("")).toBe(false);
    expect(
      shouldFlashGuildBankFullRefuseCue(ACTION_ERROR.mailInboxFull),
    ).toBe(false);
    expect(guildBankFullRefuseCueText()).not.toMatch(/\d/);
    expect(guildBankFullRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildBankFull.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildBankFull)).toBe(false);
    expect(guildBankFullRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
