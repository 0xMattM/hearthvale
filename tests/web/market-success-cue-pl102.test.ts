import { describe, expect, it } from "vitest";
import {
  SUCCESS_CUE_MS,
  isCoreSuccessCueText,
  marketSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL10.2 — Market list/buy/cancel brief success cue (PL6.2-style ephemeral).
 */
describe("CityLands PL10.2 market list/buy brief success cue", () => {
  it("uses short copy for list/buy/cancel (happy)", () => {
    expect(marketSuccessCueText("list")).toBe("Listed");
    expect(marketSuccessCueText("buy")).toBe("Bought");
    expect(marketSuccessCueText("cancel")).toBe("Cancelled");
    expect(isCoreSuccessCueText("Listed")).toBe(true);
    expect(isCoreSuccessCueText("Bought")).toBe(true);
    expect(isCoreSuccessCueText("Cancelled")).toBe(true);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat permanent market prose as ephemeral cues (failure)", () => {
    expect(isCoreSuccessCueText("Listed on the market.")).toBe(false);
    expect(isCoreSuccessCueText("Purchase complete.")).toBe(false);
    expect(isCoreSuccessCueText("Listing cancelled — goods returned.")).toBe(
      false,
    );
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(isCoreSuccessCueText("Could not list item")).toBe(false);
  });
});
