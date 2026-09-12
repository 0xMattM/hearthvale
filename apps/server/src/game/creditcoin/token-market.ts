import {
  ACTION_ERROR,
  ITEMS,
  isValidTokenListPrice,
  realmToWei,
  type ItemId,
  type TokenListingDto,
  type TokenListingStatus,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import { players, tokenItemListings, users } from "../../db/schema.js";
import { addItem, removeItem } from "../player.js";
import type { ActionResult } from "../actions/farming.js";
import { withTransaction } from "../../db/transaction.js";
import { creditcoinConfig } from "./config.js";
import { creditRealmWei, debitRealmWei } from "./coin-swap.js";
import {
  verifyOnchainItemAttach,
  verifyOnchainItemPurchase,
} from "./onchain.js";
import { reconcileEscrowedTokenListings } from "./listing-reconcile.js";

function usernameForPlayerId(playerId: string): string {
  const player = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!player) return "?";
  return (
    db.select().from(users).where(eq(users.id, player.userId)).get()?.username ??
    "?"
  );
}

function toDto(
  row: typeof tokenItemListings.$inferSelect,
  myPlayerId: string | null,
): TokenListingDto {
  return {
    id: row.id,
    sellerUsername: usernameForPlayerId(row.sellerPlayerId),
    itemId: row.itemId,
    qty: row.qty,
    priceRealm: row.priceRealm,
    onchainListingId: row.onchainListingId ?? null,
    status: row.status as TokenListingStatus,
    mine: myPlayerId ? row.sellerPlayerId === myPlayerId : false,
    createdAt: row.createdAt,
  };
}

function playerByUserId(userId: string) {
  return db.select().from(players).where(eq(players.userId, userId)).get();
}

/**
 * Open + escrowed REALM item listings.
 */
export function listTokenItemMarket(userId: string): TokenListingDto[] {
  const me = playerByUserId(userId);
  return db
    .select()
    .from(tokenItemListings)
    .all()
    .filter((row) => row.status === "escrowed" || row.status === "listed")
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((row) => toDto(row, me?.id ?? null));
}

/**
 * Escrows stackable goods for a REALM-priced listing.
 */
export function createTokenItemListing(
  userId: string,
  itemId: ItemId,
  qty: number,
  priceRealmWhole: number,
): ActionResult & { listing?: TokenListingDto } {
  return withTransaction(() => {
    const amount = Math.floor(qty);
    if (amount < 1) return { ok: false, error: ACTION_ERROR.invalidQty };
    if (!isValidTokenListPrice(priceRealmWhole)) {
      return { ok: false, error: ACTION_ERROR.tokenListBadPrice };
    }
    const def = ITEMS[itemId];
    if (!def?.stackable) {
      return { ok: false, error: ACTION_ERROR.marketNotStackable };
    }
    const seller = playerByUserId(userId);
    if (!seller) return { ok: false, error: ACTION_ERROR.playerMissing };
    const user = db.select().from(users).where(eq(users.id, userId)).get();
    if (!user?.walletAddress) {
      return { ok: false, error: ACTION_ERROR.tokenListNeedWallet };
    }
    if (!removeItem(seller.id, itemId, amount)) {
      return { ok: false, error: ACTION_ERROR.notEnoughItems };
    }
    const id = nanoid();
    const cfg = creditcoinConfig();
    const listedLocal = cfg.mode === "local_dev" && !cfg.contractsConfigured;
    db.insert(tokenItemListings)
      .values({
        id,
        sellerPlayerId: seller.id,
        itemId,
        qty: amount,
        priceRealm: realmToWei(priceRealmWhole),
        onchainListingId: listedLocal ? id : null,
        status: listedLocal ? "listed" : "escrowed",
        createdAt: Date.now(),
      })
      .run();
    const row = db
      .select()
      .from(tokenItemListings)
      .where(eq(tokenItemListings.id, id))
      .get()!;
    return { ok: true, listing: toDto(row, seller.id) };
  });
}

/**
 * Records the on-chain listing id after the seller's Creditcoin tx.
 */
export async function attachOnchainListing(
  userId: string,
  listingId: string,
  onchainListingId: string,
): Promise<ActionResult> {
  const seller = playerByUserId(userId);
  if (!seller) return { ok: false, error: ACTION_ERROR.playerMissing };
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user?.walletAddress) {
    return { ok: false, error: ACTION_ERROR.tokenListNeedWallet };
  }
  const row = db
    .select()
    .from(tokenItemListings)
    .where(eq(tokenItemListings.id, listingId))
    .get();
  if (!row) return { ok: false, error: ACTION_ERROR.tokenListNotFound };
  if (row.sellerPlayerId !== seller.id) {
    return { ok: false, error: ACTION_ERROR.tokenListNotYours };
  }
  if (row.status !== "escrowed") {
    return { ok: false, error: ACTION_ERROR.tokenListNotFound };
  }
  if (!onchainListingId.trim()) {
    return { ok: false, error: ACTION_ERROR.chainListingMismatch };
  }
  const cfg = creditcoinConfig();
  if (cfg.contractsConfigured) {
    let matches = await verifyOnchainItemAttach(
      onchainListingId,
      listingId,
      user.walletAddress,
    );
    for (let attempt = 0; !matches && attempt < 4; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      matches = await verifyOnchainItemAttach(
        onchainListingId,
        listingId,
        user.walletAddress,
      );
    }
    if (!matches) return { ok: false, error: ACTION_ERROR.chainListingMismatch };
  }
  db.update(tokenItemListings)
    .set({ status: "listed", onchainListingId })
    .where(eq(tokenItemListings.id, listingId))
    .run();
    return { ok: true };
}

/**
 * Buys a listed item. On-chain payment is the source of truth in attestcoin mode;
 * local_dev debits the SQLite REALM ledger.
 */
export async function buyTokenItemListing(
  userId: string,
  listingId: string,
): Promise<ActionResult> {
  await reconcileEscrowedTokenListings();
  const buyer = playerByUserId(userId);
  if (!buyer) return { ok: false, error: ACTION_ERROR.playerMissing };
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user?.walletAddress) {
    return { ok: false, error: ACTION_ERROR.walletNeedLink };
  }
  const row = db
    .select()
    .from(tokenItemListings)
    .where(eq(tokenItemListings.id, listingId))
    .get();
  if (!row || (row.status !== "listed" && row.status !== "escrowed")) {
    return { ok: false, error: ACTION_ERROR.tokenListNotFound };
  }
  if (row.sellerPlayerId === buyer.id) {
    return { ok: false, error: ACTION_ERROR.tokenListOwn };
  }
  const cfg = creditcoinConfig();
  if (cfg.contractsConfigured) {
    if (row.status !== "listed" || !row.onchainListingId) {
      return { ok: false, error: ACTION_ERROR.chainPayFirst };
    }
    const paid = await verifyOnchainItemPurchase(
      row.onchainListingId,
      row.id,
      user.walletAddress,
    );
    if (!paid) return { ok: false, error: ACTION_ERROR.chainPayFirst };
  }
  return withTransaction(() => {
    const fresh = db
      .select()
      .from(tokenItemListings)
      .where(eq(tokenItemListings.id, listingId))
      .get();
    if (!fresh || fresh.status === "sold") {
      return { ok: false, error: ACTION_ERROR.tokenListNotFound };
    }
    if (!cfg.contractsConfigured && cfg.mode === "local_dev") {
      if (!debitRealmWei(buyer.id, fresh.priceRealm)) {
        return { ok: false, error: ACTION_ERROR.notEnoughRealm };
      }
      creditRealmWei(fresh.sellerPlayerId, fresh.priceRealm);
    }
    addItem(buyer.id, fresh.itemId as ItemId, fresh.qty);
    db.update(tokenItemListings)
      .set({ status: "sold" })
      .where(eq(tokenItemListings.id, listingId))
      .run();
    return { ok: true };
  });
}

/**
 * Cancels an unsold listing and returns escrowed goods.
 */
export function cancelTokenItemListing(
  userId: string,
  listingId: string,
): ActionResult {
  return withTransaction(() => {
    const seller = playerByUserId(userId);
    if (!seller) return { ok: false, error: ACTION_ERROR.playerMissing };
    const row = db
      .select()
      .from(tokenItemListings)
      .where(eq(tokenItemListings.id, listingId))
      .get();
    if (!row) return { ok: false, error: ACTION_ERROR.tokenListNotFound };
    if (row.sellerPlayerId !== seller.id) {
      return { ok: false, error: ACTION_ERROR.tokenListNotYours };
    }
    if (row.status === "sold") {
      return { ok: false, error: ACTION_ERROR.tokenListNotFound };
    }
    addItem(seller.id, row.itemId as ItemId, row.qty);
    db.update(tokenItemListings)
      .set({ status: "cancelled" })
      .where(eq(tokenItemListings.id, listingId))
      .run();
    return { ok: true };
  });
}
