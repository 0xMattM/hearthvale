import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_BANK_BAD_QTY_REFUSE_CUE,
  INVALID_QTY_REFUSE_CUE,
  MARKET_INVALID_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGuildBankBadQtyRefuseCue,
  shouldFlashInvalidQtyRefuseCue,
  shouldFlashMarketInvalidRefuseCue,
  invalidQtyRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL103.3 — Invalid-qty refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Qty` instead of sticky long qty prose.
 * Qty validation unchanged; mute ok.
 */
describe("CityLands PL103.3 invalid-qty refuse ephemeral", () => {
  it("flashes Qty for invalidQty (happy)", () => {
    expect(invalidQtyRefuseCueText()).toBe(INVALID_QTY_REFUSE_CUE);
    expect(invalidQtyRefuseCueText()).toBe("Qty");
    expect(shouldFlashInvalidQtyRefuseCue(ACTION_ERROR.invalidQty)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.invalidQty)).toBe(true);
    expect(isCoreSuccessCueText("Qty")).toBe(true);
    expect(ACTION_ERROR.invalidQty.toLowerCase()).toMatch(/valid|amount/);
  });

  it("stays quiet for guild-bank-bad-qty / market-invalid refuse (edge)", () => {
    expect(
      shouldFlashInvalidQtyRefuseCue(ACTION_ERROR.guildBankBadQty),
    ).toBe(false);
    expect(invalidQtyRefuseCueText()).toBe(GUILD_BANK_BAD_QTY_REFUSE_CUE);
    expect(invalidQtyRefuseCueText()).not.toBe(MARKET_INVALID_REFUSE_CUE);
    expect(
      shouldFlashGuildBankBadQtyRefuseCue(ACTION_ERROR.invalidQty),
    ).toBe(false);
    expect(shouldFlashMarketInvalidRefuseCue(ACTION_ERROR.invalidQty)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent qty rules (failure)", () => {
    expect(shouldFlashInvalidQtyRefuseCue(null)).toBe(false);
    expect(shouldFlashInvalidQtyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashInvalidQtyRefuseCue("")).toBe(false);
    expect(
      shouldFlashInvalidQtyRefuseCue(ACTION_ERROR.mailNotStackable),
    ).toBe(false);
    expect(invalidQtyRefuseCueText()).not.toMatch(/\d/);
    expect(invalidQtyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.invalidQty.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.invalidQty)).toBe(false);
    expect(invalidQtyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
