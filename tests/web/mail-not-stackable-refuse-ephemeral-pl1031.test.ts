import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_BANK_NOT_STACKABLE_REFUSE_CUE,
  MAIL_NOT_STACKABLE_REFUSE_CUE,
  MARKET_NOT_STACKABLE_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGuildBankNotStackableRefuseCue,
  shouldFlashMailNotStackableRefuseCue,
  shouldFlashMarketNotStackableRefuseCue,
  mailNotStackableRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL103.1 — Mail-not-stackable refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Stack` instead of sticky long mail prose.
 * Mail stack rules unchanged; mute ok.
 */
describe("CityLands PL103.1 mail-not-stackable refuse ephemeral", () => {
  it("flashes Stack for mailNotStackable (happy)", () => {
    expect(mailNotStackableRefuseCueText()).toBe(MAIL_NOT_STACKABLE_REFUSE_CUE);
    expect(mailNotStackableRefuseCueText()).toBe("Stack");
    expect(
      shouldFlashMailNotStackableRefuseCue(ACTION_ERROR.mailNotStackable),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailNotStackable)).toBe(true);
    expect(isCoreSuccessCueText("Stack")).toBe(true);
    expect(ACTION_ERROR.mailNotStackable.toLowerCase()).toMatch(
      /stackable|mail/,
    );
  });

  it("stays quiet for market / guild-bank not-stackable refuse (edge)", () => {
    expect(
      shouldFlashMailNotStackableRefuseCue(ACTION_ERROR.marketNotStackable),
    ).toBe(false);
    expect(
      shouldFlashMailNotStackableRefuseCue(ACTION_ERROR.guildBankNotStackable),
    ).toBe(false);
    expect(mailNotStackableRefuseCueText()).toBe(
      MARKET_NOT_STACKABLE_REFUSE_CUE,
    );
    expect(mailNotStackableRefuseCueText()).toBe(
      GUILD_BANK_NOT_STACKABLE_REFUSE_CUE,
    );
    expect(
      shouldFlashMarketNotStackableRefuseCue(ACTION_ERROR.mailNotStackable),
    ).toBe(false);
    expect(
      shouldFlashGuildBankNotStackableRefuseCue(ACTION_ERROR.mailNotStackable),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent stack rules (failure)", () => {
    expect(shouldFlashMailNotStackableRefuseCue(null)).toBe(false);
    expect(shouldFlashMailNotStackableRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMailNotStackableRefuseCue("")).toBe(false);
    expect(
      shouldFlashMailNotStackableRefuseCue(ACTION_ERROR.marketInvalid),
    ).toBe(false);
    expect(mailNotStackableRefuseCueText()).not.toMatch(/\d/);
    expect(mailNotStackableRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.mailNotStackable.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.mailNotStackable)).toBe(false);
    expect(mailNotStackableRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
