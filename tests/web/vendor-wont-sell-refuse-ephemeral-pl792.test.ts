import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  VENDOR_SELL_SUCCESS_CUE,
  VENDOR_WONT_BUY_REFUSE_CUE,
  VENDOR_WONT_SELL_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashVendorWontBuyRefuseCue,
  shouldFlashVendorWontSellRefuseCue,
  vendorWontSellRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL79.2 — Vendor-won't-sell refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Stock` instead of sticky long vendor prose.
 * Vendor prices unchanged; mute ok.
 */
describe("CityLands PL79.2 vendor-won't-sell refuse ephemeral", () => {
  it("flashes Stock for vendorWontSell (happy)", () => {
    expect(vendorWontSellRefuseCueText()).toBe(VENDOR_WONT_SELL_REFUSE_CUE);
    expect(vendorWontSellRefuseCueText()).toBe("Stock");
    expect(
      shouldFlashVendorWontSellRefuseCue(ACTION_ERROR.vendorWontSell),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.vendorWontSell)).toBe(true);
    expect(isCoreSuccessCueText("Stock")).toBe(true);
    expect(ACTION_ERROR.vendorWontSell.toLowerCase()).toMatch(
      /does not sell/,
    );
  });

  it("stays quiet for other vendor refuses and sell success (edge)", () => {
    expect(
      shouldFlashVendorWontSellRefuseCue(ACTION_ERROR.vendorWontBuy),
    ).toBe(false);
    expect(vendorWontSellRefuseCueText()).not.toBe(VENDOR_WONT_BUY_REFUSE_CUE);
    expect(vendorWontSellRefuseCueText()).not.toBe(VENDOR_SELL_SUCCESS_CUE);
    expect(
      shouldFlashVendorWontBuyRefuseCue(ACTION_ERROR.vendorWontSell),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent prices (failure)", () => {
    expect(shouldFlashVendorWontSellRefuseCue(null)).toBe(false);
    expect(shouldFlashVendorWontSellRefuseCue(undefined)).toBe(false);
    expect(shouldFlashVendorWontSellRefuseCue("")).toBe(false);
    expect(
      shouldFlashVendorWontSellRefuseCue(ACTION_ERROR.notEnoughItems),
    ).toBe(false);
    expect(vendorWontSellRefuseCueText()).not.toMatch(/\d/);
    expect(vendorWontSellRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.vendorWontSell.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.vendorWontSell)).toBe(false);
    expect(vendorWontSellRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|price|coin/,
    );
  });
});
