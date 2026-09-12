import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, MARKET, VENDOR } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-market-analytics-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const {
  createMarketListing,
  buyMarketListing,
  getMarketItemAnalytics,
} = await import("../../apps/server/src/game/actions/market.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

/**
 * Market item analytics — board asks, sold history, vendor NPC, suggested list.
 */
describe("market item analytics", () => {
  let sellerId = "";
  let buyerId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const s = registerUser(`manas_${stamp}`, "password123");
    const b = registerUser(`manab_${stamp}`, "password123");
    expect(s.ok && b.ok).toBe(true);
    if (!s.ok || !b.ok) throw new Error("register failed");
    sellerId = userIdFromToken(s.token)!;
    buyerId = userIdFromToken(b.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("returns board, sold, vendor, and undercut suggestion after a sale (happy)", () => {
    const seller = getPlayerState(sellerId)!;
    addItem(seller.playerId, "wheat", 3);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins * 3 + 20 })
      .where(eq(players.userId, sellerId))
      .run();
    db.update(players)
      .set({ softCurrency: 80 })
      .where(eq(players.userId, buyerId))
      .run();

    const cheap = createMarketListing(sellerId, "wheat", 1, 6);
    const dear = createMarketListing(sellerId, "wheat", 1, 8);
    expect(cheap.ok && dear.ok).toBe(true);
    expect(buyMarketListing(buyerId, cheap.listingId!).ok).toBe(true);

    const result = getMarketItemAnalytics("wheat");
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("analytics failed");
    expect(result.analytics.itemId).toBe("wheat");
    expect(result.analytics.board.lowestUnit).toBe(8);
    expect(result.analytics.board.listingCount).toBe(1);
    expect(result.analytics.sold.lastUnit).toBe(6);
    expect(result.analytics.sold.saleCount).toBeGreaterThanOrEqual(1);
    expect(result.analytics.vendorNpcCoins).toBe(VENDOR.sell.wheat);
    expect(result.analytics.suggestedUnitCoins).toBe(7);
    expect(result.analytics.suggestedReason).toBe("undercut_ask");
  });

  it("suggests above vendor when the board and sales are empty (edge)", () => {
    const result = getMarketItemAnalytics("flour");
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("analytics failed");
    expect(result.analytics.board.listingCount).toBe(0);
    expect(result.analytics.sold.saleCount).toBe(0);
    expect(result.analytics.vendorNpcCoins).toBe(VENDOR.sell.flour);
    expect(result.analytics.suggestedReason).toBe("above_vendor");
    expect(result.analytics.suggestedUnitCoins).toBe(
      (VENDOR.sell.flour ?? 0) + 1,
    );
  });

  it("rejects unknown and non-stackable items (failure)", () => {
    const unknown = getMarketItemAnalytics("not_a_real_item");
    expect(unknown.ok).toBe(false);
    if (unknown.ok) throw new Error("expected unknown item to fail");
    expect(unknown.error).toBe(ACTION_ERROR.marketInvalid);

    const tool = getMarketItemAnalytics("wooden_hoe");
    expect(tool.ok).toBe(false);
    if (tool.ok) throw new Error("expected tool to fail");
    expect(tool.error).toBe(ACTION_ERROR.marketNotStackable);
  });
});
