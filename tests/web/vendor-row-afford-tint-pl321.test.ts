import { describe, expect, it } from "vitest";
import {
  commerceBuyAffordMode,
  marketBuyShortFundsHint,
} from "../../apps/web/lib/hud/commerce-afford";
import { getVendorPrices } from "@game/shared";

/**
 * PL32.1 — Vendor buy-row afford tint SoT (affordable vs short coins).
 * Choice: shared commerceBuyAffordMode for vendor + market; quiet CSS tint only —
 * prices unchanged, sell rows stay neutral, no always-on economy column.
 */
describe("CityLands PL32.1 vendor row afford tint", () => {
  const cityBuy = getVendorPrices("city").buy;
  const samplePrice = Object.values(cityBuy)[0] ?? 10;

  it("marks buy affordable when soft coins cover price (happy)", () => {
    expect(commerceBuyAffordMode(samplePrice, samplePrice)).toBe("affordable");
    expect(commerceBuyAffordMode(samplePrice + 5, samplePrice)).toBe(
      "affordable",
    );
    expect(Object.keys(cityBuy).length).toBeGreaterThan(0);
  });

  it("marks buy short when coins are below price; zero-price stays affordable (edge)", () => {
    expect(commerceBuyAffordMode(samplePrice - 1, samplePrice)).toBe("short");
    expect(commerceBuyAffordMode(0, samplePrice)).toBe("short");
    expect(commerceBuyAffordMode(0, 0)).toBe("affordable");
  });

  it("keeps vendor buy prices unchanged and refuses inventing free buys (failure)", () => {
    for (const price of Object.values(cityBuy)) {
      expect(price).toBeGreaterThan(0);
      expect(commerceBuyAffordMode(0, price)).toBe("short");
      expect(commerceBuyAffordMode(price, price)).toBe("affordable");
    }
    // Sell book stays out of afford tint — helper is buy-price only.
    const sell = getVendorPrices("city").sell;
    expect(Object.keys(sell).length).toBeGreaterThan(0);
    expect(commerceBuyAffordMode(999, samplePrice)).toBe("affordable");
  });
});
