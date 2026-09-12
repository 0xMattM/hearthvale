import { describe, expect, it } from "vitest";

import {
  MARKET_LIST_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/market-list-feedback";
import {
  TRADE_ACCEPT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/trade-accept-feedback";
import {
  TRADE_CANCEL_WORLD_REINFORCE,
  shouldFlashTradeCancelWorldReinforce,
  tradeCancelWorldReinforceBackground,
} from "../../apps/web/lib/hud/trade-cancel-feedback";
import {
  TRADE_CANCEL_SUCCESS_CUE,
  tradeCancelSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL157.1 — Trade-cancel soft world reinforce.
 * Brief soft rim after trade cancel ok (complements Cancelled PL62.1 +
 * accept rim PL143.1). Escrow unchanged; mute ok; fail silent.
 * Choice: one-shot cool release mist (not another Cancelled toast /
 * accept sage) so outgoing cancel stays world-readable; incoming quiet.
 */
describe("CityLands PL157.1 trade-cancel soft world reinforce", () => {
  it("flashes quiet cool release mist on outgoing cancel ok (happy)", () => {
    expect(shouldFlashTradeCancelWorldReinforce(true, "outgoing")).toBe(true);
    expect(TRADE_CANCEL_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(TRADE_CANCEL_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = tradeCancelWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(TRADE_CANCEL_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Cancelled ephemeral.
    expect(tradeCancelSuccessCueText()).toBe(TRADE_CANCEL_SUCCESS_CUE);
    expect(tradeCancelSuccessCueText()).toBe("Cancelled");
  });

  it("stays quiet on fail / incoming; rim ≠ accept sage / list teal (edge)", () => {
    expect(shouldFlashTradeCancelWorldReinforce(false, "outgoing")).toBe(false);
    expect(shouldFlashTradeCancelWorldReinforce(true, "incoming")).toBe(false);
    expect(shouldFlashTradeCancelWorldReinforce(true, null)).toBe(false);

    expect(TRADE_CANCEL_WORLD_REINFORCE.outerRgba).not.toBe(
      TRADE_ACCEPT_WORLD_REINFORCE.outerRgba,
    );
    expect(TRADE_CANCEL_WORLD_REINFORCE.midRgba).not.toBe(
      TRADE_ACCEPT_WORLD_REINFORCE.midRgba,
    );
    expect(TRADE_CANCEL_WORLD_REINFORCE.outerRgba).not.toBe(
      MARKET_LIST_WORLD_REINFORCE.outerRgba,
    );
    expect(TRADE_CANCEL_WORLD_REINFORCE.clearPct).toBeLessThan(
      TRADE_CANCEL_WORLD_REINFORCE.midPct,
    );
    expect(TRADE_CANCEL_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent escrow / NFT combat; keeps outgoing-ok gate (failure)", () => {
    expect(tradeCancelWorldReinforceBackground()).not.toMatch(
      /escrow\s*change|always.?on|nft/i,
    );
    expect(String(TRADE_CANCEL_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(TRADE_CANCEL_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashTradeCancelWorldReinforce(true, "outgoing")).not.toBe(
      shouldFlashTradeCancelWorldReinforce(true, "incoming"),
    );
  });
});
