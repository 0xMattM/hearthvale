import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_BANK_NOT_STACKABLE_REFUSE_CUE,
  GUILD_BANK_UNKNOWN_ITEM_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGuildBankNotStackableRefuseCue,
  shouldFlashGuildBankUnknownItemRefuseCue,
  guildBankUnknownItemRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL102.2 — Guild-bank-unknown-item refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Item` instead of sticky long guild-bank prose.
 * Guild bank item rules unchanged; mute ok.
 */
describe("CityLands PL102.2 guild-bank-unknown-item refuse ephemeral", () => {
  it("flashes Item for guildBankUnknownItem (happy)", () => {
    expect(guildBankUnknownItemRefuseCueText()).toBe(
      GUILD_BANK_UNKNOWN_ITEM_REFUSE_CUE,
    );
    expect(guildBankUnknownItemRefuseCueText()).toBe("Item");
    expect(
      shouldFlashGuildBankUnknownItemRefuseCue(
        ACTION_ERROR.guildBankUnknownItem,
      ),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildBankUnknownItem)).toBe(true);
    expect(isCoreSuccessCueText("Item")).toBe(true);
    expect(ACTION_ERROR.guildBankUnknownItem.toLowerCase()).toMatch(
      /item|guild/,
    );
  });

  it("stays quiet for guild-bank-not-stackable refuse (edge)", () => {
    expect(
      shouldFlashGuildBankUnknownItemRefuseCue(
        ACTION_ERROR.guildBankNotStackable,
      ),
    ).toBe(false);
    expect(guildBankUnknownItemRefuseCueText()).not.toBe(
      GUILD_BANK_NOT_STACKABLE_REFUSE_CUE,
    );
    expect(
      shouldFlashGuildBankNotStackableRefuseCue(
        ACTION_ERROR.guildBankUnknownItem,
      ),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent item rules (failure)", () => {
    expect(shouldFlashGuildBankUnknownItemRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildBankUnknownItemRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildBankUnknownItemRefuseCue("")).toBe(false);
    expect(
      shouldFlashGuildBankUnknownItemRefuseCue(ACTION_ERROR.guildBankBadQty),
    ).toBe(false);
    expect(guildBankUnknownItemRefuseCueText()).not.toMatch(/\d/);
    expect(guildBankUnknownItemRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildBankUnknownItem.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildBankUnknownItem)).toBe(
      false,
    );
    expect(guildBankUnknownItemRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
