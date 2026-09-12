import { describe, expect, it } from "vitest";
import {
  MARKET_LIST_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/market-list-feedback";
import {
  CHAT_SEND_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/chat-send-feedback";
import {
  TRADE_ACCEPT_WORLD_REINFORCE,
  tradeAcceptWorldReinforceBackground,
  shouldFlashTradeAcceptWorldReinforce,
} from "../../apps/web/lib/hud/trade-accept-feedback";
import {
  TRADE_ACCEPT_SUCCESS_CUE,
  tradeAcceptSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL143.1 — Trade-accept soft world reinforce.
 * Brief soft rim when a trade completes ok (complements Trade open PL29.1 +
 * Trade accepted PL18.2). Escrow / rules unchanged; mute ok; fail silent.
 * Choice: one-shot handshake sage rim (not another Trade accepted toast) so
 * accept stays world-readable beside the existing ephemeral + open accent.
 */
describe("CityLands PL143.1 trade-accept soft world reinforce", () => {
  it("flashes soft handshake rim when accept succeeds (happy)", () => {
    expect(shouldFlashTradeAcceptWorldReinforce(true)).toBe(true);
    expect(TRADE_ACCEPT_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(TRADE_ACCEPT_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = tradeAcceptWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(TRADE_ACCEPT_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Trade accepted ephemeral.
    expect(tradeAcceptSuccessCueText()).toBe(TRADE_ACCEPT_SUCCESS_CUE);
    expect(tradeAcceptSuccessCueText()).toBe("Trade accepted");
  });

  it("stays quiet on fail; rim ≠ market teal / chat seafoam (edge)", () => {
    expect(shouldFlashTradeAcceptWorldReinforce(false)).toBe(false);

    expect(TRADE_ACCEPT_WORLD_REINFORCE.outerRgba).not.toBe(
      MARKET_LIST_WORLD_REINFORCE.outerRgba,
    );
    expect(TRADE_ACCEPT_WORLD_REINFORCE.outerRgba).not.toBe(
      CHAT_SEND_WORLD_REINFORCE.outerRgba,
    );
    expect(TRADE_ACCEPT_WORLD_REINFORCE.clearPct).toBeLessThan(
      TRADE_ACCEPT_WORLD_REINFORCE.midPct,
    );
    expect(TRADE_ACCEPT_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent trade columns / escrow; keeps ok gate (failure)", () => {
    expect(tradeAcceptWorldReinforceBackground()).not.toMatch(
      /escrow|trade\s*column|always.?on/i,
    );
    expect(String(TRADE_ACCEPT_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(TRADE_ACCEPT_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashTradeAcceptWorldReinforce(true)).not.toBe(
      shouldFlashTradeAcceptWorldReinforce(false),
    );
  });
});
