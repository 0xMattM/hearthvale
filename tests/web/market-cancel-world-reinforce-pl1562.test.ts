import { describe, expect, it } from "vitest";

import { COINS_GAIN_WORLD_REINFORCE } from "../../apps/web/lib/hud/coins-gain-feedback";
import {
  MARKET_BUY_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/market-buy-feedback";
import {
  MARKET_CANCEL_WORLD_REINFORCE,
  marketCancelWorldReinforceBackground,
  shouldFlashMarketCancelWorldReinforce,
} from "../../apps/web/lib/hud/market-cancel-feedback";
import {
  MARKET_LIST_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/market-list-feedback";
import { marketSuccessCueText } from "../../apps/web/lib/hud/success-cue";

/**
 * PL156.2 — Market-cancel soft world reinforce.
 * Brief soft rim after market cancel ok (complements Cancelled listing cue +
 * list rim PL138.1). Escrow / fees unchanged; mute ok; fail silent.
 * Choice: one-shot cool dusty board-ash rim (not another Cancelled toast /
 * list teal / buy parchment) so cancel stays world-readable.
 */
describe("CityLands PL156.2 market-cancel soft world reinforce", () => {
  it("flashes quiet cool dusty board-ash rim when cancel succeeds (happy)", () => {
    expect(shouldFlashMarketCancelWorldReinforce(true)).toBe(true);
    expect(MARKET_CANCEL_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(MARKET_CANCEL_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = marketCancelWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(MARKET_CANCEL_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Cancelled ephemeral.
    expect(marketSuccessCueText("cancel")).toBe("Cancelled");
  });

  it("stays quiet on fail; rim ≠ list teal / buy parchment / coins gold (edge)", () => {
    expect(shouldFlashMarketCancelWorldReinforce(false)).toBe(false);

    expect(MARKET_CANCEL_WORLD_REINFORCE.outerRgba).not.toBe(
      MARKET_LIST_WORLD_REINFORCE.outerRgba,
    );
    expect(MARKET_CANCEL_WORLD_REINFORCE.midRgba).not.toBe(
      MARKET_LIST_WORLD_REINFORCE.midRgba,
    );
    expect(MARKET_CANCEL_WORLD_REINFORCE.outerRgba).not.toBe(
      MARKET_BUY_WORLD_REINFORCE.outerRgba,
    );
    expect(MARKET_CANCEL_WORLD_REINFORCE.outerRgba).not.toBe(
      COINS_GAIN_WORLD_REINFORCE.outerRgba,
    );
    expect(MARKET_CANCEL_WORLD_REINFORCE.clearPct).toBeLessThan(
      MARKET_CANCEL_WORLD_REINFORCE.midPct,
    );
    expect(MARKET_CANCEL_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent escrow / NFT combat; keeps ok gate (failure)", () => {
    expect(marketCancelWorldReinforceBackground()).not.toMatch(
      /escrow\s*change|always.?on|nft/i,
    );
    expect(String(MARKET_CANCEL_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(MARKET_CANCEL_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashMarketCancelWorldReinforce(true)).not.toBe(
      shouldFlashMarketCancelWorldReinforce(false),
    );
  });
});
