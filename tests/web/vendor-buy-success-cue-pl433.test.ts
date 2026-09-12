import { describe, expect, it } from "vitest";
import { SFX_PRESETS, shouldPlaySfx } from "../../apps/web/lib/game-audio";
import {
  SUCCESS_CUE_MS,
  VENDOR_BUY_SUCCESS_CUE,
  isCoreSuccessCueText,
  vendorBuySuccessCueText,
  vendorSellSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL43.3 — Vendor buy success cue.
 * Ephemeral TopBar after successful Vendor Stall buy; SFX already plays; prices unchanged.
 */
describe("CityLands PL43.3 vendor buy success cue", () => {
  it("uses short Bought confirm copy (happy)", () => {
    expect(vendorBuySuccessCueText()).toBe(VENDOR_BUY_SUCCESS_CUE);
    expect(vendorBuySuccessCueText()).toBe("Bought");
    expect(isCoreSuccessCueText("Bought")).toBe(true);
    expect(SFX_PRESETS.vendor_buy.length).toBeGreaterThan(0);
    expect(vendorBuySuccessCueText()).not.toBe(vendorSellSuccessCueText());
  });

  it("clears quickly and stays mute-safe (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
    expect(shouldPlaySfx(true, "vendor_buy")).toBe(false);
    expect(vendorBuySuccessCueText().length).toBeLessThan(16);
  });

  it("does not invent prices or sticky prose (failure)", () => {
    expect(vendorBuySuccessCueText()).not.toMatch(/\d/);
    expect(vendorBuySuccessCueText().toLowerCase()).not.toContain("price");
    expect(isCoreSuccessCueText("Bought · −8c sticky")).toBe(false);
    expect(isCoreSuccessCueText("Purchase complete from vendor.")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
  });
});
