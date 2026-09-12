import { describe, expect, it } from "vitest";

import {

  COINS_GAIN_WORLD_REINFORCE,

} from "../../apps/web/lib/hud/coins-gain-feedback";

import {

  MARKET_BUY_WORLD_REINFORCE,

} from "../../apps/web/lib/hud/market-buy-feedback";

import {

  VENDOR_BUY_WORLD_REINFORCE,

} from "../../apps/web/lib/hud/vendor-buy-feedback";

import {

  VENDOR_SELL_WORLD_REINFORCE,

  shouldFlashVendorSellWorldReinforce,

  vendorSellWorldReinforceBackground,

} from "../../apps/web/lib/hud/vendor-sell-feedback";

import {

  VENDOR_SELL_SUCCESS_CUE,

  vendorSellSuccessCueText,

} from "../../apps/web/lib/hud/success-cue";



/**

 * PL156.1 — Vendor-sell soft world reinforce leftover.

 * Brief soft rim after vendor sell ok (complements Sold PL43.2 +

 * coins-gain rim PL126.2). Prices unchanged; mute ok; fail silent.

 * Choice: one-shot warm stall amber-copper rim (not another Sold toast /

 * coins gold) so sell stays world-readable beside buy honey-copper.

 */

describe("CityLands PL156.1 vendor-sell soft world reinforce leftover", () => {

  it("flashes quiet warm stall amber-copper rim when sell succeeds (happy)", () => {

    expect(shouldFlashVendorSellWorldReinforce(true)).toBe(true);

    expect(VENDOR_SELL_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);

    expect(VENDOR_SELL_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);



    const bg = vendorSellWorldReinforceBackground();

    expect(bg).toMatch(/^radial-gradient/);

    expect(bg).toContain(VENDOR_SELL_WORLD_REINFORCE.outerRgba);

    expect(bg).toContain("transparent");



    // Complements — does not replace — Sold ephemeral.

    expect(vendorSellSuccessCueText()).toBe(VENDOR_SELL_SUCCESS_CUE);

    expect(vendorSellSuccessCueText()).toBe("Sold");

  });



  it("stays quiet on fail; rim ≠ coins gold / buy honey / market parchment (edge)", () => {

    expect(shouldFlashVendorSellWorldReinforce(false)).toBe(false);



    expect(VENDOR_SELL_WORLD_REINFORCE.outerRgba).not.toBe(

      COINS_GAIN_WORLD_REINFORCE.outerRgba,

    );

    expect(VENDOR_SELL_WORLD_REINFORCE.midRgba).not.toBe(

      COINS_GAIN_WORLD_REINFORCE.midRgba,

    );

    expect(VENDOR_SELL_WORLD_REINFORCE.outerRgba).not.toBe(

      VENDOR_BUY_WORLD_REINFORCE.outerRgba,

    );

    expect(VENDOR_SELL_WORLD_REINFORCE.outerRgba).not.toBe(

      MARKET_BUY_WORLD_REINFORCE.outerRgba,

    );

    expect(VENDOR_SELL_WORLD_REINFORCE.clearPct).toBeLessThan(

      VENDOR_SELL_WORLD_REINFORCE.midPct,

    );

    expect(VENDOR_SELL_WORLD_REINFORCE.durationMs).toBeLessThan(2000);

  });



  it("does not invent prices / NFT combat; keeps ok gate (failure)", () => {

    expect(vendorSellWorldReinforceBackground()).not.toMatch(

      /price\s*change|always.?on|nft/i,

    );

    expect(String(VENDOR_SELL_WORLD_REINFORCE.durationMs)).not.toMatch(

      /combat|fare/i,

    );

    expect(VENDOR_SELL_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);

    expect(shouldFlashVendorSellWorldReinforce(true)).not.toBe(

      shouldFlashVendorSellWorldReinforce(false),

    );

  });

});


