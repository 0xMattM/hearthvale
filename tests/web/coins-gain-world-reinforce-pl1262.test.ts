import { describe, expect, it } from "vitest";

import { SOFT_CURRENCY } from "@game/shared";

import {

  COINS_GAIN_WORLD_REINFORCE,

  coinsGainWorldReinforceBackground,

  shouldFlashCoinsGainWorldReinforce,

} from "../../apps/web/lib/hud/coins-gain-feedback";

import {

  EAT_SUCCESS_WORLD_REINFORCE,

  ENERGY_LOW_WORLD_VIGNETTE,

} from "../../apps/web/lib/hud/energy-food-feedback";

import {

  vendorBuySuccessCueText,

  vendorSellSuccessCueText,

} from "../../apps/web/lib/hud/success-cue";



/**

 * PL126.2 — Coins-gain soft reinforce.

 * Brief gold world rim when soft currency rises from vendor/market/quest

 * (complements Sold/Bought cues). Prices / sinks unchanged; mute ok.

 * Choice: one-shot warm gold rim (not another Coins toast) so inflow stays

 * world-readable beside existing Sold/Bought ephemerals.

 */

describe("CityLands PL126.2 coins-gain soft world reinforce", () => {

  it("flashes soft gold rim only when soft currency rises (happy)", () => {

    expect(shouldFlashCoinsGainWorldReinforce(true, 40, 55)).toBe(true);

    expect(COINS_GAIN_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);

    expect(COINS_GAIN_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);



    const bg = coinsGainWorldReinforceBackground();

    expect(bg).toMatch(/^radial-gradient/);

    expect(bg).toContain(COINS_GAIN_WORLD_REINFORCE.outerRgba);

    expect(bg).toContain("transparent");



    // Complements — does not replace — Sold/Bought commerce cues.

    expect(vendorSellSuccessCueText()).toBe("Sold");

    expect(vendorBuySuccessCueText()).toBe("Bought");

  });



  it("stays quiet on spend / flat / fail; rim ≠ eat or energy (edge)", () => {

    expect(shouldFlashCoinsGainWorldReinforce(true, 55, 40)).toBe(false);

    expect(shouldFlashCoinsGainWorldReinforce(true, 40, 40)).toBe(false);

    expect(shouldFlashCoinsGainWorldReinforce(false, 40, 99)).toBe(false);

    expect(shouldFlashCoinsGainWorldReinforce(true, Number.NaN, 50)).toBe(

      false,

    );



    expect(COINS_GAIN_WORLD_REINFORCE.outerRgba).not.toBe(

      EAT_SUCCESS_WORLD_REINFORCE.outerRgba,

    );

    expect(COINS_GAIN_WORLD_REINFORCE.outerRgba).not.toBe(

      ENERGY_LOW_WORLD_VIGNETTE.outerRgba,

    );

    expect(COINS_GAIN_WORLD_REINFORCE.clearPct).toBeLessThan(

      COINS_GAIN_WORLD_REINFORCE.midPct,

    );

    expect(COINS_GAIN_WORLD_REINFORCE.durationMs).toBeLessThan(2000);

  });



  it("does not invent prices or sinks; keeps soft-currency id (failure)", () => {

    expect(SOFT_CURRENCY.id).toBe("coins");

    expect(SOFT_CURRENCY.name).toBe("Coins");

    expect(coinsGainWorldReinforceBackground()).not.toMatch(/\d+\s*coins/i);

    expect(String(COINS_GAIN_WORLD_REINFORCE.durationMs)).not.toMatch(

      /nft|combat/i,

    );

    expect(COINS_GAIN_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);

    expect(shouldFlashCoinsGainWorldReinforce(true, 10, 20)).not.toBe(

      shouldFlashCoinsGainWorldReinforce(true, 20, 10),

    );

  });

});


