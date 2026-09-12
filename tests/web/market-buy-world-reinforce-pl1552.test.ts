import { describe, expect, it } from "vitest";

import {

  COINS_GAIN_WORLD_REINFORCE,

} from "../../apps/web/lib/hud/coins-gain-feedback";

import {

  MARKET_LIST_WORLD_REINFORCE,

} from "../../apps/web/lib/hud/market-list-feedback";

import {

  MARKET_BUY_WORLD_REINFORCE,

  marketBuyWorldReinforceBackground,

  shouldFlashMarketBuyWorldReinforce,

} from "../../apps/web/lib/hud/market-buy-feedback";

import {

  VENDOR_BUY_WORLD_REINFORCE,

} from "../../apps/web/lib/hud/vendor-buy-feedback";

import { marketSuccessCueText } from "../../apps/web/lib/hud/success-cue";



/**

 * PL155.2 — Market-buy soft world reinforce.

 * Brief soft rim after market buy ok (complements Bought + list rim PL138.1).

 * Escrow / fees unchanged; mute ok; fail silent.

 * Choice: one-shot parchment-gold rim (not another Bought toast / list teal)

 * so buy stays world-readable beside listing post + vendor stall copper.

 */

describe("CityLands PL155.2 market-buy soft world reinforce", () => {

  it("flashes quiet warm parchment-gold rim when buy succeeds (happy)", () => {

    expect(shouldFlashMarketBuyWorldReinforce(true)).toBe(true);

    expect(MARKET_BUY_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);

    expect(MARKET_BUY_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);



    const bg = marketBuyWorldReinforceBackground();

    expect(bg).toMatch(/^radial-gradient/);

    expect(bg).toContain(MARKET_BUY_WORLD_REINFORCE.outerRgba);

    expect(bg).toContain("transparent");



    // Complements — does not replace — Bought ephemeral.

    expect(marketSuccessCueText("buy")).toBe("Bought");

  });



  it("stays quiet on fail; rim ≠ list teal / vendor copper / coins gold (edge)", () => {

    expect(shouldFlashMarketBuyWorldReinforce(false)).toBe(false);



    expect(MARKET_BUY_WORLD_REINFORCE.outerRgba).not.toBe(

      MARKET_LIST_WORLD_REINFORCE.outerRgba,

    );

    expect(MARKET_BUY_WORLD_REINFORCE.midRgba).not.toBe(

      MARKET_LIST_WORLD_REINFORCE.midRgba,

    );

    expect(MARKET_BUY_WORLD_REINFORCE.outerRgba).not.toBe(

      VENDOR_BUY_WORLD_REINFORCE.outerRgba,

    );

    expect(MARKET_BUY_WORLD_REINFORCE.outerRgba).not.toBe(

      COINS_GAIN_WORLD_REINFORCE.outerRgba,

    );

    expect(MARKET_BUY_WORLD_REINFORCE.clearPct).toBeLessThan(

      MARKET_BUY_WORLD_REINFORCE.midPct,

    );

    expect(MARKET_BUY_WORLD_REINFORCE.durationMs).toBeLessThan(2000);

  });



  it("does not invent escrow / NFT combat; keeps ok gate (failure)", () => {

    expect(marketBuyWorldReinforceBackground()).not.toMatch(

      /escrow\s*change|always.?on|nft/i,

    );

    expect(String(MARKET_BUY_WORLD_REINFORCE.durationMs)).not.toMatch(

      /combat|fare/i,

    );

    expect(MARKET_BUY_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);

    expect(shouldFlashMarketBuyWorldReinforce(true)).not.toBe(

      shouldFlashMarketBuyWorldReinforce(false),

    );

  });

});


