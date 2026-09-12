import { describe, expect, it } from "vitest";
import {
  commerceBuyAffordMode,
  marketBuyShortFundsHint,
} from "../../apps/web/lib/hud/commerce-afford";
import { MARKET } from "@game/shared";

/**
 * PL32.2 — Market list afford clarity (soft short-funds hint when coins short).
 * Choice: compact `Need Nc` + muted/disabled Buy on others' rows; own cancel
 * and listing fee/TTL unchanged; mute ok (no new SFX).
 */
describe("CityLands PL32.2 market list afford clarity", () => {
  it("hides short hint when wallet covers listing price (happy)", () => {
    expect(marketBuyShortFundsHint(25, 25)).toBeNull();
    expect(marketBuyShortFundsHint(40, 25)).toBeNull();
    expect(commerceBuyAffordMode(25, 25)).toBe("affordable");
  });

  it("shows Need Nc when short; exact boundary and free listing edge", () => {
    expect(marketBuyShortFundsHint(24, 25)).toBe("Need 25c");
    expect(marketBuyShortFundsHint(0, 10)).toBe("Need 10c");
    expect(marketBuyShortFundsHint(5, 0)).toBeNull();
    expect(commerceBuyAffordMode(24, 25)).toBe("short");
  });

  it("keeps MARKET fee/TTL unchanged and refuses inventing free listings (failure)", () => {
    expect(MARKET.listFeeCoins).toBeGreaterThan(0);
    expect(MARKET.listingTtlMs).toBeGreaterThan(0);
    // Short funds never clears fee — afford helper does not touch list fee.
    expect(marketBuyShortFundsHint(0, MARKET.listFeeCoins)).toBe(
      `Need ${MARKET.listFeeCoins}c`,
    );
    expect(marketBuyShortFundsHint(MARKET.listFeeCoins, 9999)).toBe(
      "Need 9999c",
    );
  });
});
