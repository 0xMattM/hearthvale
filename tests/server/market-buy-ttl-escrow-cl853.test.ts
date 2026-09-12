import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, MARKET } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl853-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/**
 * CL85.3 — Market buy + TTL escrow still green.
 * Choice: assert-only cross-buy + TTL restore + own-list refuse (parity with CL76.3 / CL65.1; no market invent).
 */
describe("CityLands CL85.3 market buy + TTL escrow still green", () => {
  let sellerId = "";
  let buyerId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const s = registerUser(`cl853s_${stamp}`, "password123");
    const b = registerUser(`cl853b_${stamp}`, "password123");
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

  it("seller lists plank then buyer purchases (happy buy)", () => {
    expect(travelToLandKind(sellerId, "city").ok).toBe(true);
    const seller = getPlayerState(sellerId)!;
    addItem(seller.playerId, "plank", 2);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.userId, sellerId))
      .run();

    const listed = createMarketListing(sellerId, "plank", 1, 7);
    expect(listed.ok).toBe(true);
    const listingId = listed.listingId!;

    expect(travelToLandKind(buyerId, "city").ok).toBe(true);
    db.update(players)
      .set({ softCurrency: 50 })
      .where(eq(players.userId, buyerId))
      .run();

    const board = listMarket(buyerId);
    expect(board.some((l) => l.id === listingId && !l.mine)).toBe(true);

    const buyerBefore = getPlayerState(buyerId)!;
    const sellerBefore = getPlayerState(sellerId)!;
    expect(buyMarketListing(buyerId, listingId).ok).toBe(true);

    const buyerAfter = getPlayerState(buyerId)!;
    const sellerAfter = getPlayerState(sellerId)!;
    expect(buyerAfter.softCurrency).toBe(buyerBefore.softCurrency - 7);
    expect(sellerAfter.softCurrency).toBe(sellerBefore.softCurrency + 7);
    expect(
      buyerAfter.inventory.some((s) => s.itemId === "plank" && s.qty >= 1),
    ).toBe(true);
    expect(listMarket(buyerId).some((l) => l.id === listingId)).toBe(false);
  });

  it("lists goods then TTL elapse returns escrow to seller (happy TTL)", () => {
    // Reason: prior happy-buy may already leave seller on city hub.
    const toCity = travelToLandKind(sellerId, "city");
    if (!toCity.ok) {
      expect(toCity.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const seller = getPlayerState(sellerId)!;
    expect(seller.buildings.some((b) => b.type === "market_board")).toBe(true);
    addItem(seller.playerId, "plank", 2);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.userId, sellerId))
      .run();

    const before =
      getPlayerState(sellerId)!.inventory.find((i) => i.itemId === "plank")
        ?.qty ?? 0;
    expect(before).toBeGreaterThanOrEqual(1);

    const t0 = Date.now();
    const created = createMarketListing(sellerId, "plank", 1, 5, t0);
    expect(created.ok).toBe(true);
    const listingId = created.listingId!;

    const mid =
      getPlayerState(sellerId)!.inventory.find((i) => i.itemId === "plank")
        ?.qty ?? 0;
    expect(mid).toBe(before - 1);
    expect(
      listMarket(sellerId, t0 + 1).some((l) => l.id === listingId && l.mine),
    ).toBe(true);
    expect(
      listMarket(sellerId, t0 + 1).find((l) => l.id === listingId)?.expiresAt,
    ).toBe(t0 + MARKET.listingTtlMs);

    const afterTtl = t0 + MARKET.listingTtlMs + 1;
    expect(listMarket(buyerId, afterTtl).some((l) => l.id === listingId)).toBe(
      false,
    );
    const after =
      getPlayerState(sellerId)!.inventory.find((i) => i.itemId === "plank")
        ?.qty ?? 0;
    expect(after).toBe(before);
  });

  it("rejects buying your own listing (failure)", () => {
    const pid = getPlayerState(sellerId)!.playerId;
    addItem(pid, "plank", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 10 })
      .where(eq(players.userId, sellerId))
      .run();

    const listed = createMarketListing(sellerId, "plank", 1, 5);
    expect(listed.ok).toBe(true);
    const listingId = listed.listingId!;

    const own = buyMarketListing(sellerId, listingId);
    expect(own.ok).toBe(false);
    if (!own.ok) expect(own.error).toBe(ACTION_ERROR.marketOwnListing);
    expect(
      listMarket(sellerId).some((l) => l.id === listingId && l.mine),
    ).toBe(true);
  });
});
