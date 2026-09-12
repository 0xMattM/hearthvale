import {
  ACTION_ERROR,
  ITEMS,
  MARKET,
  MARKET_ANALYTICS_SOLD_LIMIT,
  buildMarketItemAnalytics,
  isMarketListingExpired,
  marketListingExpiresAt,
  vendorNpcBuybackCoins,
  type ItemId,
  type MarketItemAnalytics,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import { marketListings, players, users } from "../../db/schema.js";
import { addItem, removeItem } from "../player.js";
import type { ActionResult } from "./farming.js";
import { withTransaction } from "../../db/transaction.js";

export interface MarketListingDto {
  id: string;
  sellerUsername: string;
  itemId: string;
  qty: number;
  priceCoins: number;
  mine: boolean;
  createdAt: number;
  expiresAt: number;
}

function playerByUserId(userId: string) {
  return db.select().from(players).where(eq(players.userId, userId)).get();
}

function usernameForPlayerId(playerId: string): string {
  const player = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!player) return "?";
  const user = db.select().from(users).where(eq(users.id, player.userId)).get();
  return user?.username ?? "?";
}

/**
 * Expires open listings past TTL and returns escrowed goods to sellers.
 */
export function expireStaleMarketListings(now = Date.now()): number {
  const open = db
    .select()
    .from(marketListings)
    .where(eq(marketListings.status, "open"))
    .all();
  let expired = 0;
  for (const row of open) {
    if (!isMarketListingExpired(row.createdAt, now)) continue;
    addItem(row.sellerPlayerId, row.itemId as ItemId, row.qty);
    db.update(marketListings)
      .set({ status: "expired" })
      .where(eq(marketListings.id, row.id))
      .run();
    expired += 1;
  }
  return expired;
}

/**
 * Open market board (stackable goods for coins).
 */
export function listMarket(userId: string, now = Date.now()): MarketListingDto[] {
  expireStaleMarketListings(now);
  const me = playerByUserId(userId);
  const rows = db
    .select()
    .from(marketListings)
    .where(eq(marketListings.status, "open"))
    .all()
    .sort((a, b) => b.createdAt - a.createdAt);

  return rows.map((row) => ({
    id: row.id,
    sellerUsername: usernameForPlayerId(row.sellerPlayerId),
    itemId: row.itemId,
    qty: row.qty,
    priceCoins: row.priceCoins,
    mine: me ? row.sellerPlayerId === me.id : false,
    createdAt: row.createdAt,
    expiresAt: marketListingExpiresAt(row.createdAt),
  }));
}

/**
 * Lists stackable goods; escrow removes them; charges a flat listing fee (F11.4).
 */
export function createMarketListing(
  userId: string,
  itemId: ItemId,
  qty: number,
  priceCoins: number,
  now = Date.now(),
): ActionResult & { listingId?: string } {
  return withTransaction(() => {
    expireStaleMarketListings(now);
    const amount = Math.floor(qty);
    const price = Math.floor(priceCoins);
    if (amount < 1 || price < 1) {
      return { ok: false, error: ACTION_ERROR.marketInvalid };
    }
    const def = ITEMS[itemId];
    if (!def?.stackable) {
      return { ok: false, error: ACTION_ERROR.marketNotStackable };
    }

    const seller = playerByUserId(userId);
    if (!seller) return { ok: false, error: ACTION_ERROR.playerMissing };
    if (seller.softCurrency < MARKET.listFeeCoins) {
      return { ok: false, error: ACTION_ERROR.marketNeedFee(MARKET.listFeeCoins) };
    }
    if (!removeItem(seller.id, itemId, amount)) {
      return { ok: false, error: ACTION_ERROR.notEnoughItems };
    }

    const fresh = playerByUserId(userId);
    if (!fresh || fresh.softCurrency < MARKET.listFeeCoins) {
      addItem(seller.id, itemId, amount);
      return { ok: false, error: ACTION_ERROR.marketNeedFee(MARKET.listFeeCoins) };
    }

    db.update(players)
      .set({ softCurrency: fresh.softCurrency - MARKET.listFeeCoins })
      .where(eq(players.id, seller.id))
      .run();

    const id = nanoid();
    db.insert(marketListings)
      .values({
        id,
        sellerPlayerId: seller.id,
        itemId,
        qty: amount,
        priceCoins: price,
        status: "open",
        createdAt: now,
      })
      .run();

    return { ok: true, listingId: id };
  });
}

/**
 * Buys an open listing with coins.
 */
export function buyMarketListing(
  userId: string,
  listingId: string,
  now = Date.now(),
): ActionResult {
  return withTransaction(() => {
    expireStaleMarketListings(now);
    const buyer = playerByUserId(userId);
    if (!buyer) return { ok: false, error: ACTION_ERROR.playerMissing };

    const listing = db
      .select()
      .from(marketListings)
      .where(and(eq(marketListings.id, listingId), eq(marketListings.status, "open")))
      .get();
    if (!listing) {
      const any = db
        .select()
        .from(marketListings)
        .where(eq(marketListings.id, listingId))
        .get();
      if (any?.status === "expired") {
        return { ok: false, error: ACTION_ERROR.marketExpired };
      }
      return { ok: false, error: ACTION_ERROR.marketNotFound };
    }
    if (listing.sellerPlayerId === buyer.id) {
      return { ok: false, error: ACTION_ERROR.marketOwnListing };
    }
    if (buyer.softCurrency < listing.priceCoins) {
      return { ok: false, error: ACTION_ERROR.notEnoughCoins };
    }

    const seller = db
      .select()
      .from(players)
      .where(eq(players.id, listing.sellerPlayerId))
      .get();
    if (!seller) return { ok: false, error: ACTION_ERROR.playerMissing };

    db.update(players)
      .set({ softCurrency: buyer.softCurrency - listing.priceCoins })
      .where(eq(players.id, buyer.id))
      .run();
    db.update(players)
      .set({ softCurrency: seller.softCurrency + listing.priceCoins })
      .where(eq(players.id, seller.id))
      .run();
    addItem(buyer.id, listing.itemId as ItemId, listing.qty);
    db.update(marketListings)
      .set({ status: "sold" })
      .where(eq(marketListings.id, listing.id))
      .run();

    return { ok: true };
  });
}

/**
 * Cancels own listing and returns escrowed goods.
 */
export function cancelMarketListing(
  userId: string,
  listingId: string,
  now = Date.now(),
): ActionResult {
  return withTransaction(() => {
    expireStaleMarketListings(now);
    const seller = playerByUserId(userId);
    if (!seller) return { ok: false, error: ACTION_ERROR.playerMissing };

    const listing = db
      .select()
      .from(marketListings)
      .where(and(eq(marketListings.id, listingId), eq(marketListings.status, "open")))
      .get();
    if (!listing) return { ok: false, error: ACTION_ERROR.marketNotFound };
    if (listing.sellerPlayerId !== seller.id) {
      return { ok: false, error: ACTION_ERROR.marketNotYours };
    }

    addItem(seller.id, listing.itemId as ItemId, listing.qty);
    db.update(marketListings)
      .set({ status: "cancelled" })
      .where(eq(marketListings.id, listing.id))
      .run();

    return { ok: true };
  });
}

/**
 * Price-discovery snapshot for one stackable: open board, recent sales, city NPC.
 *
 * @param itemId - Catalog item to look up.
 * @param now - Clock used to expire stale listings first.
 * @returns Analytics DTO, or a market validation error.
 */
export function getMarketItemAnalytics(
  itemId: string,
  now = Date.now(),
): { ok: true; analytics: MarketItemAnalytics } | { ok: false; error: string } {
  expireStaleMarketListings(now);
  const def = ITEMS[itemId as ItemId];
  if (!def) return { ok: false, error: ACTION_ERROR.marketInvalid };
  if (!def.stackable) {
    return { ok: false, error: ACTION_ERROR.marketNotStackable };
  }

  const rows = db
    .select()
    .from(marketListings)
    .where(eq(marketListings.itemId, itemId))
    .all();
  const openRows = rows
    .filter((row) => row.status === "open")
    .map((row) => ({
      qty: row.qty,
      priceCoins: row.priceCoins,
      createdAt: row.createdAt,
    }));
  const soldRows = rows
    .filter((row) => row.status === "sold")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MARKET_ANALYTICS_SOLD_LIMIT)
    .map((row) => ({
      qty: row.qty,
      priceCoins: row.priceCoins,
      createdAt: row.createdAt,
    }));

  return {
    ok: true,
    analytics: buildMarketItemAnalytics({
      itemId: itemId as ItemId,
      openRows,
      soldRows,
      vendorNpcCoins: vendorNpcBuybackCoins(itemId as ItemId),
    }),
  };
}
