import { describe, expect, it } from "vitest";
import {
  TRADE_PREFERRED_PARTNER_NAMEPLATE,
  VISIT_HOST_NAMEPLATE,
  shouldShowTradePreferredPartnerNameplate,
  tradePreferredPartnerNameplateBorder,
  tradePreferredPartnerNameplateLabel,
  tradePreferredPartnerNameplateText,
} from "@game/shared";

/**
 * PL123.2 — Trade preferred-partner nameplate (Host · chip while visiting).
 * Complements visit host world nameplate (PL119.2); trade rules / T unchanged.
 * Choice: panel Host · chip (same teal kinship) over inventing a second world
 * plaque so visit trade stays glanceable without HUD column growth.
 */
describe("CityLands PL123.2 trade preferred-partner nameplate", () => {
  it("shows Host · name when preferred visit partner is set (happy)", () => {
    expect(shouldShowTradePreferredPartnerNameplate("alice")).toBe(true);
    expect(tradePreferredPartnerNameplateLabel("alice")).toBe("alice");
    expect(tradePreferredPartnerNameplateText("alice")).toBe("Host · alice");
    expect(tradePreferredPartnerNameplateText("  bob  ")).toBe("Host · bob");
    expect(TRADE_PREFERRED_PARTNER_NAMEPLATE.prefix).toMatch(/Host/);
    expect(tradePreferredPartnerNameplateBorder(true)).toBe(
      TRADE_PREFERRED_PARTNER_NAMEPLATE.borderReinforce,
    );
  });

  it("stays quiet without partner; reinforce border only when open (edge)", () => {
    expect(shouldShowTradePreferredPartnerNameplate(null)).toBe(false);
    expect(shouldShowTradePreferredPartnerNameplate("")).toBe(false);
    expect(shouldShowTradePreferredPartnerNameplate("   ")).toBe(false);
    expect(tradePreferredPartnerNameplateText(undefined)).toBeNull();
    expect(tradePreferredPartnerNameplateBorder(false)).toBe(
      TRADE_PREFERRED_PARTNER_NAMEPLATE.border,
    );
    expect(TRADE_PREFERRED_PARTNER_NAMEPLATE.border).toBe(
      VISIT_HOST_NAMEPLATE.nameBorder,
    );
  });

  it("does not invent trade fares or rename Host prefix (failure)", () => {
    expect(tradePreferredPartnerNameplateText("alice")!.toLowerCase()).not.toMatch(
      /fare|coins|escrow fee/,
    );
    expect(TRADE_PREFERRED_PARTNER_NAMEPLATE.prefix).toBe("Host ·");
    expect(shouldShowTradePreferredPartnerNameplate(null)).toBe(false);
    expect(tradePreferredPartnerNameplateLabel("")).toBeNull();
  });
});
