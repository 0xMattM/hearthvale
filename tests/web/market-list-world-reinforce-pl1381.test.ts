import { describe, expect, it } from "vitest";
import {
  COINS_GAIN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/coins-gain-feedback";
import {
  MARKET_LIST_WORLD_REINFORCE,
  marketListWorldReinforceBackground,
  shouldFlashMarketListWorldReinforce,
} from "../../apps/web/lib/hud/market-list-feedback";
import {
  QUEST_CLAIM_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/quest-claim-feedback";
import { marketSuccessCueText } from "../../apps/web/lib/hud/success-cue";

/**
 * PL138.1 — Market-list soft world reinforce.
 * Brief soft market rim when a listing posts (complements Listed PL10.2).
 * Escrow / fees unchanged; mute ok; fail silent.
 * Choice: one-shot teal rim (not another Listed toast) so list stays world-readable
 * even when fee spend keeps coins rim quiet.
 */
describe("CityLands PL138.1 market-list soft world reinforce", () => {
  it("flashes soft market rim when list succeeds (happy)", () => {
    expect(shouldFlashMarketListWorldReinforce(true)).toBe(true);
    expect(MARKET_LIST_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(MARKET_LIST_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = marketListWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(MARKET_LIST_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Listed ephemeral.
    expect(marketSuccessCueText("list")).toBe("Listed");
  });

  it("stays quiet on fail; rim ≠ coins gold / quest verdant (edge)", () => {
    expect(shouldFlashMarketListWorldReinforce(false)).toBe(false);

    expect(MARKET_LIST_WORLD_REINFORCE.outerRgba).not.toBe(
      COINS_GAIN_WORLD_REINFORCE.outerRgba,
    );
    expect(MARKET_LIST_WORLD_REINFORCE.outerRgba).not.toBe(
      QUEST_CLAIM_WORLD_REINFORCE.outerRgba,
    );
    expect(MARKET_LIST_WORLD_REINFORCE.clearPct).toBeLessThan(
      MARKET_LIST_WORLD_REINFORCE.midPct,
    );
    expect(MARKET_LIST_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent fees / escrow; keeps ok gate (failure)", () => {
    expect(marketListWorldReinforceBackground()).not.toMatch(/fee|escrow/i);
    expect(String(MARKET_LIST_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(MARKET_LIST_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashMarketListWorldReinforce(true)).not.toBe(
      shouldFlashMarketListWorldReinforce(false),
    );
    expect(marketSuccessCueText("buy")).toBe("Bought");
  });
});
