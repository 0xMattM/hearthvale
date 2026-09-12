import { describe, expect, it } from "vitest";
import { SFX_PRESETS, shouldPlaySfx } from "../../apps/web/lib/game-audio";
import {
  SUCCESS_CUE_MS,
  VENDOR_SELL_SUCCESS_CUE,
  isCoreSuccessCueText,
  vendorSellSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL43.2 — Vendor sell success cue.
 * Ephemeral TopBar after successful Vendor Stall sell; SFX already plays; prices unchanged.
 */
describe("CityLands PL43.2 vendor sell success cue", () => {
  it("uses short Sold confirm copy (happy)", () => {
    expect(vendorSellSuccessCueText()).toBe(VENDOR_SELL_SUCCESS_CUE);
    expect(vendorSellSuccessCueText()).toBe("Sold");
    expect(isCoreSuccessCueText("Sold")).toBe(true);
    expect(SFX_PRESETS.vendor_sell.length).toBeGreaterThan(0);
  });

  it("clears quickly and stays mute-safe (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
    expect(shouldPlaySfx(true, "vendor_sell")).toBe(false);
    expect(vendorSellSuccessCueText().length).toBeLessThan(16);
  });

  it("does not invent prices or sticky prose (failure)", () => {
    expect(vendorSellSuccessCueText()).not.toMatch(/\d/);
    expect(vendorSellSuccessCueText().toLowerCase()).not.toContain("coin");
    expect(isCoreSuccessCueText("Sold · +12c sticky")).toBe(false);
    expect(isCoreSuccessCueText("The vendor bought your goods.")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
  });
});
