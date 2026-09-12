import { describe, expect, it } from "vitest";
import {
  TRADE_PENDING_CLOSED_GLANCE,
  countPendingIncomingTrades,
  hasPendingIncomingTrade,
  shouldShowTradePendingClosedGlance,
  tradePendingClosedGlanceLabel,
  type TradePendingGlanceRow,
} from "../../apps/web/lib/hud/trade-pending-closed-glance";

/**
 * PL195.1 — Trade-pending closed glance leftover.
 * Choice: quiet TopBar T · Trade chip while an unanswered incoming trade
 * invite/offer is pending and Trade panel closed (complements receive cue +
 * accept rim; no trade column). Escrow SoT unchanged.
 */
describe("CityLands PL195.1 trade-pending closed glance leftover", () => {
  const one: TradePendingGlanceRow[] = [{ direction: "incoming" }];
  const two: TradePendingGlanceRow[] = [
    { direction: "incoming" },
    { direction: "incoming" },
  ];
  const outgoingOnly: TradePendingGlanceRow[] = [{ direction: "outgoing" }];

  it("shows quiet T · Trade chip while incoming pending and Trade closed (happy)", () => {
    expect(hasPendingIncomingTrade(one)).toBe(true);
    expect(shouldShowTradePendingClosedGlance(one, false)).toBe(true);
    expect(tradePendingClosedGlanceLabel(one)).toBe("T · Trade");
    expect(tradePendingClosedGlanceLabel(two)).toBe("T · Trade · 2");
    expect(countPendingIncomingTrades(two)).toBe(2);

    expect(TRADE_PENDING_CLOSED_GLANCE.hotkey).toBe("T");
    expect(TRADE_PENDING_CLOSED_GLANCE.word).toBe("Trade");
    expect(TRADE_PENDING_CLOSED_GLANCE.borderColor).toBe("#78a890");
    expect(TRADE_PENDING_CLOSED_GLANCE.textColor).toBe("#a8d4bc");
    expect(TRADE_PENDING_CLOSED_GLANCE.className).toBe("topbar-trade-glance");
  });

  it("clears when none incoming or Trade panel open (edge)", () => {
    expect(shouldShowTradePendingClosedGlance([], false)).toBe(false);
    expect(shouldShowTradePendingClosedGlance(outgoingOnly, false)).toBe(false);
    expect(shouldShowTradePendingClosedGlance(one, true)).toBe(false);
    expect(tradePendingClosedGlanceLabel([])).toBe("");
    expect(tradePendingClosedGlanceLabel(outgoingOnly)).toBe("");
    expect(hasPendingIncomingTrade(outgoingOnly)).toBe(false);
  });

  it("does not invent trade column or change escrow rules (failure)", () => {
    expect(TRADE_PENDING_CLOSED_GLANCE.className).not.toMatch(
      /column|hud-trade-column|always-on/i,
    );
    expect(tradePendingClosedGlanceLabel(one)).not.toMatch(/nft|combat/i);
    expect(shouldShowTradePendingClosedGlance(one, false)).not.toBe(
      shouldShowTradePendingClosedGlance(one, true),
    );
    expect(countPendingIncomingTrades([{ direction: "outgoing" }])).toBe(0);
    expect(String(TRADE_PENDING_CLOSED_GLANCE.word)).not.toMatch(
      /toast|stack|fare/i,
    );
  });
});
