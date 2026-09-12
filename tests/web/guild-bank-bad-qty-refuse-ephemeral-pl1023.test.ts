import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_BANK_BAD_QTY_REFUSE_CUE,
  GUILD_BANK_UNKNOWN_ITEM_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGuildBankBadQtyRefuseCue,
  shouldFlashGuildBankUnknownItemRefuseCue,
  guildBankBadQtyRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL102.3 — Guild-bank-bad-qty refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Qty` instead of sticky long guild-bank prose.
 * Guild bank qty rules unchanged; mute ok.
 */
describe("CityLands PL102.3 guild-bank-bad-qty refuse ephemeral", () => {
  it("flashes Qty for guildBankBadQty (happy)", () => {
    expect(guildBankBadQtyRefuseCueText()).toBe(GUILD_BANK_BAD_QTY_REFUSE_CUE);
    expect(guildBankBadQtyRefuseCueText()).toBe("Qty");
    expect(
      shouldFlashGuildBankBadQtyRefuseCue(ACTION_ERROR.guildBankBadQty),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildBankBadQty)).toBe(true);
    expect(isCoreSuccessCueText("Qty")).toBe(true);
    expect(ACTION_ERROR.guildBankBadQty.toLowerCase()).toMatch(
      /quantity|qty|valid/,
    );
  });

  it("stays quiet for guild-bank-unknown-item refuse (edge)", () => {
    expect(
      shouldFlashGuildBankBadQtyRefuseCue(ACTION_ERROR.guildBankUnknownItem),
    ).toBe(false);
    expect(guildBankBadQtyRefuseCueText()).not.toBe(
      GUILD_BANK_UNKNOWN_ITEM_REFUSE_CUE,
    );
    expect(
      shouldFlashGuildBankUnknownItemRefuseCue(ACTION_ERROR.guildBankBadQty),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent qty rules (failure)", () => {
    expect(shouldFlashGuildBankBadQtyRefuseCue(null)).toBe(false);
    expect(shouldFlashGuildBankBadQtyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGuildBankBadQtyRefuseCue("")).toBe(false);
    expect(
      shouldFlashGuildBankBadQtyRefuseCue(ACTION_ERROR.guildBankNotStackable),
    ).toBe(false);
    expect(guildBankBadQtyRefuseCueText()).not.toMatch(/\d/);
    expect(guildBankBadQtyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.guildBankBadQty.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.guildBankBadQty)).toBe(false);
    expect(guildBankBadQtyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
