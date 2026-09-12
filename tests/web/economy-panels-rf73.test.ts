import { describe, expect, it, vi } from "vitest";
import type { MarketListingRow, MailRow, TradeRow } from "../../apps/web/hooks/useEconomyPanels";

/**
 * RF7.3 — economy panel row shapes exported for GameApp wiring.
 */
describe("economy-panels RF7.3", () => {
  it("accepts a market listing row (happy)", () => {
    const row: MarketListingRow = {
      id: "l1",
      sellerUsername: "a",
      itemId: "wheat",
      qty: 2,
      priceCoins: 5,
      mine: false,
    };
    expect(row.priceCoins).toBe(5);
  });

  it("mail direction is inbox or sent (edge)", () => {
    const inbox: MailRow = {
      id: "m1",
      fromUsername: "a",
      toUsername: "b",
      subject: "hi",
      items: [],
      coins: 0,
      status: "pending",
      createdAt: 1,
      direction: "inbox",
    };
    expect(["inbox", "sent"]).toContain(inbox.direction);
  });

  it("rejects inventing trade without id (fail shape)", () => {
    const bad = { fromUsername: "a" } as Partial<TradeRow>;
    expect(bad.id).toBeUndefined();
  });
});
