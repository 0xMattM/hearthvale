import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_BANK_NOT_STACKABLE_REFUSE_CUE,
  MARKET_NOT_STACKABLE_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGuildBankNotStackableRefuseCue,
  shouldFlashMarketNotStackableRefuseCue,
  guildBankNotStackableRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL102.1 — Guild-bank-not-stackable refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Stack` instead of sticky long guild-bank prose.
 * Guild bank stack rules unchanged; mute ok.
 */
describe("CityLands PL102.1 guild-bank-not-stackable refuse ephemeral", () => {
  it("flashes Stack for guildBankNotStackable (happy)", () => {
    expect(guildBankNotStackableRefuseCueText()).toBe(
      GUILD_BANK_NOT_STACKABLE_REFUSE_CUE,
    );
    expect(guildBankNotStackableRefuseCueText()).toBe("Stack");
    expect(
      shouldFlashGuildBankNotStackableRefuseCue(
        ACTION_ERROR.guildBankNotStackable,
      ),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildBankNotStackable)).toBe(true);
    expect(isCoreSuccessCueText("Stack")).toBe(true);
    expect(ACTION_ERROR.guildBankNotStackable.toLowerCase()).toMatch(
      /stackable|guild/,
    );
  });

  it("stays quiet for market-not-stackable refuse (edge)", () => {
    expect(
      shouldFlashGuildBankNotStackableRefuseCue(
        ACTION_ERROR.marketNotStackable,
      ),
    ).toBe(false);
    expect(guildBankNotStackableRefuseCueText()).toBe(
      MARKET_NOT_STACKABLE_REFUSE_CUE,
    );
    expect(
      shouldFlashMarketNotStackableRefuseCue(
        ACTION_ERROR.guildBankNotStackable,
      ),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent stack rules (failure)", () => {
    expect(shouldFlashGuildBankNotStackableRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildBankNotStackableRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildBankNotStackableRefuseCue("")).toBe(false);
    expect(
      shouldFlashGuildBankNotStackableRefuseCue(
        ACTION_ERROR.guildBankUnknownItem,
      ),
    ).toBe(false);
    expect(guildBankNotStackableRefuseCueText()).not.toMatch(/\d/);
    expect(guildBankNotStackableRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildBankNotStackable.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildBankNotStackable)).toBe(
      false,
    );
    expect(guildBankNotStackableRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
