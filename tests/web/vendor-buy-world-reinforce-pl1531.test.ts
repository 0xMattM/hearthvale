import { describe, expect, it } from "vitest";
import {
  COINS_GAIN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/coins-gain-feedback";
import {
  MARKET_LIST_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/market-list-feedback";
import {
  VENDOR_BUY_WORLD_REINFORCE,
  shouldFlashVendorBuyWorldReinforce,
  vendorBuyWorldReinforceBackground,
} from "../../apps/web/lib/hud/vendor-buy-feedback";
import {
  VENDOR_BUY_SUCCESS_CUE,
  vendorBuySuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL153.1 — Vendor-buy soft world reinforce.
 * Brief soft rim after vendor buy ok (complements Bought PL43.3 +
 * coins-gain sell rim PL126.2). Prices unchanged; mute ok; fail silent.
 * Choice: one-shot warm stall honey-copper rim (not another Bought toast /
 * coins gold) so buy stays world-readable beside sell inflow.
 */
describe("CityLands PL153.1 vendor-buy soft world reinforce", () => {
  it("flashes quiet warm stall honey-copper rim when buy succeeds (happy)", () => {
    expect(shouldFlashVendorBuyWorldReinforce(true)).toBe(true);
    expect(VENDOR_BUY_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(VENDOR_BUY_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = vendorBuyWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(VENDOR_BUY_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Bought ephemeral.
    expect(vendorBuySuccessCueText()).toBe(VENDOR_BUY_SUCCESS_CUE);
    expect(vendorBuySuccessCueText()).toBe("Bought");
  });

  it("stays quiet on fail; rim ≠ coins gold / market teal (edge)", () => {
    expect(shouldFlashVendorBuyWorldReinforce(false)).toBe(false);

    expect(VENDOR_BUY_WORLD_REINFORCE.outerRgba).not.toBe(
      COINS_GAIN_WORLD_REINFORCE.outerRgba,
    );
    expect(VENDOR_BUY_WORLD_REINFORCE.midRgba).not.toBe(
      COINS_GAIN_WORLD_REINFORCE.midRgba,
    );
    expect(VENDOR_BUY_WORLD_REINFORCE.outerRgba).not.toBe(
      MARKET_LIST_WORLD_REINFORCE.outerRgba,
    );
    expect(VENDOR_BUY_WORLD_REINFORCE.clearPct).toBeLessThan(
      VENDOR_BUY_WORLD_REINFORCE.midPct,
    );
    expect(VENDOR_BUY_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent prices / NFT combat; keeps ok gate (failure)", () => {
    expect(vendorBuyWorldReinforceBackground()).not.toMatch(
      /price\s*change|always.?on|nft/i,
    );
    expect(String(VENDOR_BUY_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(VENDOR_BUY_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashVendorBuyWorldReinforce(true)).not.toBe(
      shouldFlashVendorBuyWorldReinforce(false),
    );
  });
});
