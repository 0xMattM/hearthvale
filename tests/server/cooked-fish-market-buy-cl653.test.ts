import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, MARKET, getVendorPrices } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl653-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const {
  createMarketListing,
  buyMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock — cooked_fish NPC rate holds while market cross-buy is the assert. */
const COOKED_FISH_SELL = 4;

/**
 * CL65.3 — Cooked_fish market cross-player buy smoke.
 * Choice: assert-only buy path (list already CL57.3); own-list refuse like CL61.1.
 */
describe("CityLands CL65.3 cooked_fish market cross-player buy smoke", () => {
  let sellerId = "";
  let buyerId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const s = registerUser(`cl653s_${stamp}`, "password123");
    const b = registerUser(`cl653b_${stamp}`, "password123");
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

  it("seller lists cooked_fish then buyer purchases (happy)", () => {
    expect(getVendorPrices("city").sell.cooked_fish).toBe(COOKED_FISH_SELL);

    expect(travelToLandKind(sellerId, "city").ok).toBe(true);
    const seller = getPlayerState(sellerId)!;
    addItem(seller.playerId, "cooked_fish", 2);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.userId, sellerId))
      .run();

    const listed = createMarketListing(sellerId, "cooked_fish", 1, 7);
    expect(listed.ok).toBe(true);
    const listingId = listed.listingId!;

    expect(travelToLandKind(buyerId, "city").ok).toBe(true);
    db.update(players)
      .set({ softCurrency: 50 })
      .where(eq(players.userId, buyerId))
      .run();

    const board = listMarket(buyerId);
    expect(
      board.some(
        (l) => l.id === listingId && l.itemId === "cooked_fish" && !l.mine,
      ),
    ).toBe(true);

    const buyerBefore = getPlayerState(buyerId)!;
    const sellerBefore = getPlayerState(sellerId)!;
    expect(buyMarketListing(buyerId, listingId).ok).toBe(true);

    const buyerAfter = getPlayerState(buyerId)!;
    const sellerAfter = getPlayerState(sellerId)!;
    expect(buyerAfter.softCurrency).toBe(buyerBefore.softCurrency - 7);
    expect(sellerAfter.softCurrency).toBe(sellerBefore.softCurrency + 7);
    expect(
      buyerAfter.inventory.some(
        (s) => s.itemId === "cooked_fish" && s.qty >= 1,
      ),
    ).toBe(true);
    expect(listMarket(buyerId).some((l) => l.id === listingId)).toBe(false);
  });

  it("rejects buying your own cooked_fish listing (failure)", () => {
    const pid = getPlayerState(sellerId)!.playerId;
    addItem(pid, "cooked_fish", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 10 })
      .where(eq(players.userId, sellerId))
      .run();

    const listed = createMarketListing(sellerId, "cooked_fish", 1, 5);
    expect(listed.ok).toBe(true);
    const listingId = listed.listingId!;

    const own = buyMarketListing(sellerId, listingId);
    expect(own.ok).toBe(false);
    if (!own.ok) expect(own.error).toBe(ACTION_ERROR.marketOwnListing);
    expect(
      listMarket(sellerId).some(
        (l) => l.id === listingId && l.itemId === "cooked_fish" && l.mine,
      ),
    ).toBe(true);
  });
});
