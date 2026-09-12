import { describe, expect, it } from "vitest";
import {
  SUCCESS_CUE_MS,
  TRADE_ACCEPT_SUCCESS_CUE,
  TRADE_CANCEL_SUCCESS_CUE,
  isCoreSuccessCueText,
  shouldFlashTradeCancelCue,
  tradeCancelSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL62.1 — Trade cancel brief cue.
 * Ephemeral `Cancelled` when you cancel your outgoing offer;
 * incoming reject stays silent; escrow / nearby rules unchanged; mute ok.
 */
describe("CityLands PL62.1 trade cancel brief cue", () => {
  it("flashes Cancelled for outgoing cancel (happy)", () => {
    expect(tradeCancelSuccessCueText()).toBe(TRADE_CANCEL_SUCCESS_CUE);
    expect(tradeCancelSuccessCueText()).toBe("Cancelled");
    expect(isCoreSuccessCueText("Cancelled")).toBe(true);
    expect(shouldFlashTradeCancelCue("outgoing")).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays quiet on incoming reject and missing direction (edge)", () => {
    expect(shouldFlashTradeCancelCue("incoming")).toBe(false);
    expect(shouldFlashTradeCancelCue(null)).toBe(false);
    expect(shouldFlashTradeCancelCue(undefined)).toBe(false);
    expect(tradeCancelSuccessCueText()).not.toBe(TRADE_ACCEPT_SUCCESS_CUE);
  });

  it("does not invent escrow rules or sticky cancel prose (failure)", () => {
    expect(tradeCancelSuccessCueText()).not.toMatch(/\d/);
    expect(tradeCancelSuccessCueText().toLowerCase()).not.toMatch(
      /escrow|nearby|nft|combat/,
    );
    expect(
      isCoreSuccessCueText("Trade offer cancelled and items returned from escrow."),
    ).toBe(false);
    expect(isCoreSuccessCueText("Reject")).toBe(false);
    expect(shouldFlashTradeCancelCue("outgoing")).toBe(true);
    expect(shouldFlashTradeCancelCue("incoming")).toBe(false);
  });
});
