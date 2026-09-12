import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  VENDOR_BUY_SUCCESS_CUE,
  VENDOR_WONT_BUY_REFUSE_CUE,
  VENDOR_WONT_SELL_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashVendorWontBuyRefuseCue,
  shouldFlashVendorWontSellRefuseCue,
  vendorWontBuyRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL79.1 — Vendor-won't-buy refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Unwanted` instead of sticky long vendor prose.
 * Vendor prices unchanged; mute ok.
 */
describe("CityLands PL79.1 vendor-won't-buy refuse ephemeral", () => {
  it("flashes Unwanted for vendorWontBuy (happy)", () => {
    expect(vendorWontBuyRefuseCueText()).toBe(VENDOR_WONT_BUY_REFUSE_CUE);
    expect(vendorWontBuyRefuseCueText()).toBe("Unwanted");
    expect(shouldFlashVendorWontBuyRefuseCue(ACTION_ERROR.vendorWontBuy)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.vendorWontBuy)).toBe(true);
    expect(isCoreSuccessCueText("Unwanted")).toBe(true);
    expect(ACTION_ERROR.vendorWontBuy.toLowerCase()).toMatch(/will not buy/);
  });

  it("stays quiet for other vendor refuses and buy success (edge)", () => {
    expect(
      shouldFlashVendorWontBuyRefuseCue(ACTION_ERROR.vendorWontSell),
    ).toBe(false);
    expect(vendorWontBuyRefuseCueText()).not.toBe(VENDOR_WONT_SELL_REFUSE_CUE);
    expect(vendorWontBuyRefuseCueText()).not.toBe(VENDOR_BUY_SUCCESS_CUE);
    expect(
      shouldFlashVendorWontSellRefuseCue(ACTION_ERROR.vendorWontBuy),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent prices (failure)", () => {
    expect(shouldFlashVendorWontBuyRefuseCue(null)).toBe(false);
    expect(shouldFlashVendorWontBuyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashVendorWontBuyRefuseCue("")).toBe(false);
    expect(
      shouldFlashVendorWontBuyRefuseCue(ACTION_ERROR.notEnoughCoins),
    ).toBe(false);
    expect(vendorWontBuyRefuseCueText()).not.toMatch(/\d/);
    expect(vendorWontBuyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.vendorWontBuy.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.vendorWontBuy)).toBe(false);
    expect(vendorWontBuyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|price|coin/,
    );
  });
});
