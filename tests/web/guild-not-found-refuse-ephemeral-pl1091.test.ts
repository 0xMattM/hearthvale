import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_NOT_FOUND_REFUSE_CUE,
  GUILD_TARGET_MISSING_REFUSE_CUE,
  TRADE_NOT_FOUND_REFUSE_CUE,
  isCoreSuccessCueText,
  guildNotFoundRefuseCueText,
  shouldFlashGuildNotFoundRefuseCue,
  shouldFlashGuildTargetMissingRefuseCue,
  shouldFlashTradeNotFoundRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL109.1 — Guild-not-found refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` instead of sticky long guild prose.
 * Guild lookup unchanged; mute ok.
 */
describe("CityLands PL109.1 guild-not-found refuse ephemeral", () => {
  it("flashes Gone for guildNotFound (happy)", () => {
    expect(guildNotFoundRefuseCueText()).toBe(GUILD_NOT_FOUND_REFUSE_CUE);
    expect(guildNotFoundRefuseCueText()).toBe("Gone");
    expect(
      shouldFlashGuildNotFoundRefuseCue(ACTION_ERROR.guildNotFound),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildNotFound)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.guildNotFound.toLowerCase()).toMatch(/guild|find/);
  });

  it("stays quiet for guild-target and trade-not-found refuses (edge)", () => {
    expect(
      shouldFlashGuildNotFoundRefuseCue(ACTION_ERROR.guildTargetMissing),
    ).toBe(false);
    expect(
      shouldFlashGuildNotFoundRefuseCue(ACTION_ERROR.tradeNotFound),
    ).toBe(false);
    expect(guildNotFoundRefuseCueText()).toBe(TRADE_NOT_FOUND_REFUSE_CUE);
    expect(guildNotFoundRefuseCueText()).not.toBe(
      GUILD_TARGET_MISSING_REFUSE_CUE,
    );
    expect(
      shouldFlashGuildTargetMissingRefuseCue(ACTION_ERROR.guildNotFound),
    ).toBe(false);
    expect(
      shouldFlashTradeNotFoundRefuseCue(ACTION_ERROR.guildNotFound),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent guild rules (failure)", () => {
    expect(shouldFlashGuildNotFoundRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildNotFoundRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildNotFoundRefuseCue("")).toBe(false);
    expect(
      shouldFlashGuildNotFoundRefuseCue(ACTION_ERROR.guildNotIn),
    ).toBe(false);
    expect(guildNotFoundRefuseCueText()).not.toMatch(/\d/);
    expect(guildNotFoundRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildNotFound.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildNotFound)).toBe(false);
    expect(guildNotFoundRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
