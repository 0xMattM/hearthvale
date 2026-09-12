import { ACTION_ERROR, ITEMS, type ItemId } from "@game/shared";
import { and, eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import { inventory, players, trades, users } from "../../db/schema.js";
import {
  addItem,
  addItemWithDurability,
  takeItemInstances,
} from "../player.js";
import type { ActionResult } from "./farming.js";
import { withTransaction } from "../../db/transaction.js";

export interface TradeLeg {
  itemId: ItemId;
  qty: number;
  /** Present when a non-stackable tool was escrowed. */
  durability?: number | null;
}

export interface TradeDto {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  fromUsername: string;
  toUsername: string;
  status: string;
  give: TradeLeg[];
  want: TradeLeg[];
  giveCoins: number;
  wantCoins: number;
  createdAt: number;
  direction: "incoming" | "outgoing";
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

function normalizeLegs(legs: TradeLeg[] | undefined): TradeLeg[] {
  if (!legs?.length) return [];
  return legs
    .filter((l) => l.qty > 0 && ITEMS[l.itemId])
    .map((l) => ({
      itemId: l.itemId,
      qty: Math.floor(l.qty),
    }));
}

function countItem(playerId: string, itemId: ItemId): number {
  return db
    .select()
    .from(inventory)
    .where(eq(inventory.playerId, playerId))
    .all()
    .filter((r) => r.itemId === itemId)
    .reduce((sum, r) => sum + r.qty, 0);
}

function expandEscrowLegs(legs: TradeLeg[]): TradeLeg[] {
  const out: TradeLeg[] = [];
  for (const leg of legs) {
    const def = ITEMS[leg.itemId];
    if (!def.stackable) {
      for (let i = 0; i < leg.qty; i += 1) {
        out.push({
          itemId: leg.itemId,
          qty: 1,
          durability: leg.durability ?? null,
        });
      }
    } else {
      out.push({ itemId: leg.itemId, qty: leg.qty });
    }
  }
  return out;
}

function restoreGiveEscrow(playerId: string, give: TradeLeg[], giveCoins: number): void {
  for (const leg of give) {
    const def = ITEMS[leg.itemId];
    if (!def.stackable) {
      for (let i = 0; i < leg.qty; i += 1) {
        addItemWithDurability(playerId, leg.itemId, leg.durability);
      }
    } else {
      addItem(playerId, leg.itemId, leg.qty);
    }
  }
  if (giveCoins > 0) {
    const p = db.select().from(players).where(eq(players.id, playerId)).get();
    if (p) {
      db.update(players)
        .set({ softCurrency: p.softCurrency + giveCoins })
        .where(eq(players.id, playerId))
        .run();
    }
  }
}

/**
 * Creates a pending trade; offered goods/coins are escrowed immediately.
 */
export function createTradeOffer(
  userId: string,
  toUsername: string,
  give: TradeLeg[],
  want: TradeLeg[],
  giveCoins: number,
  wantCoins: number,
): ActionResult & { tradeId?: string; toUserId?: string } {
  const from = playerByUserId(userId);
  if (!from) return { ok: false, error: ACTION_ERROR.playerMissing };

  const cleanedTo = toUsername.trim().toLowerCase();
  const toUser = db.select().from(users).where(eq(users.username, cleanedTo)).get();
  if (!toUser) return { ok: false, error: ACTION_ERROR.tradePlayerMissing };
  const to = db.select().from(players).where(eq(players.userId, toUser.id)).get();
  if (!to) return { ok: false, error: ACTION_ERROR.tradePlayerMissing };
  if (to.id === from.id) return { ok: false, error: ACTION_ERROR.tradeSelf };

  const giveLegs = normalizeLegs(give);
  const wantLegs = normalizeLegs(want);
  const gCoins = Math.max(0, Math.floor(giveCoins || 0));
  const wCoins = Math.max(0, Math.floor(wantCoins || 0));

  if (giveLegs.length === 0 && wantLegs.length === 0 && gCoins === 0 && wCoins === 0) {
    return { ok: false, error: ACTION_ERROR.tradeEmpty };
  }

  if (from.softCurrency < gCoins) return { ok: false, error: ACTION_ERROR.notEnoughCoins };
  for (const leg of giveLegs) {
    if (countItem(from.id, leg.itemId) < leg.qty) {
      return { ok: false, error: ACTION_ERROR.notEnoughItems };
    }
  }

  const escrowed: TradeLeg[] = [];
  for (const leg of giveLegs) {
    const taken = takeItemInstances(from.id, leg.itemId, leg.qty);
    if (!taken) {
      restoreGiveEscrow(from.id, escrowed, 0);
      return { ok: false, error: ACTION_ERROR.notEnoughItems };
    }
    for (const unit of taken) {
      if (ITEMS[leg.itemId].stackable) {
        escrowed.push({ itemId: leg.itemId, qty: 1 });
      } else {
        escrowed.push({
          itemId: leg.itemId,
          qty: 1,
          durability: unit.durability,
        });
      }
    }
  }

  // Collapse stackable escrow legs for compact storage.
  const collapsed: TradeLeg[] = [];
  for (const leg of escrowed) {
    if (ITEMS[leg.itemId].stackable) {
      const existing = collapsed.find(
        (c) => c.itemId === leg.itemId && c.durability == null,
      );
      if (existing) existing.qty += leg.qty;
      else collapsed.push({ itemId: leg.itemId, qty: leg.qty });
    } else {
      collapsed.push(leg);
    }
  }

  if (gCoins > 0) {
    db.update(players)
      .set({ softCurrency: from.softCurrency - gCoins })
      .where(eq(players.id, from.id))
      .run();
  }

  const id = nanoid();
  db.insert(trades)
    .values({
      id,
      fromPlayerId: from.id,
      toPlayerId: to.id,
      status: "pending",
      giveJson: JSON.stringify(collapsed),
      wantJson: JSON.stringify(wantLegs),
      giveCoins: gCoins,
      wantCoins: wCoins,
      createdAt: Date.now(),
    })
    .run();

  return { ok: true, tradeId: id, toUserId: toUser.id };
}

/**
 * Lists pending trades for the authenticated player.
 */
export function listPendingTrades(userId: string): TradeDto[] {
  const me = playerByUserId(userId);
  if (!me) return [];

  const rows = db
    .select()
    .from(trades)
    .where(
      and(
        eq(trades.status, "pending"),
        or(eq(trades.fromPlayerId, me.id), eq(trades.toPlayerId, me.id)),
      ),
    )
    .all();

  return rows.map((row) => ({
    id: row.id,
    fromPlayerId: row.fromPlayerId,
    toPlayerId: row.toPlayerId,
    fromUsername: usernameForPlayerId(row.fromPlayerId),
    toUsername: usernameForPlayerId(row.toPlayerId),
    status: row.status,
    give: JSON.parse(row.giveJson) as TradeLeg[],
    want: JSON.parse(row.wantJson) as TradeLeg[],
    giveCoins: row.giveCoins,
    wantCoins: row.wantCoins,
    createdAt: row.createdAt,
    direction: row.toPlayerId === me.id ? ("incoming" as const) : ("outgoing" as const),
  }));
}

/**
 * Rejects or cancels a pending trade; returns escrowed give goods/coins.
 */
export function rejectTrade(userId: string, tradeId: string): ActionResult {
  const me = playerByUserId(userId);
  if (!me) return { ok: false, error: ACTION_ERROR.playerMissing };
  const trade = db.select().from(trades).where(eq(trades.id, tradeId)).get();
  if (!trade || trade.status !== "pending") {
    return { ok: false, error: ACTION_ERROR.tradeNotFound };
  }
  if (trade.fromPlayerId !== me.id && trade.toPlayerId !== me.id) {
    return { ok: false, error: ACTION_ERROR.tradeNotYours };
  }

  const give = JSON.parse(trade.giveJson) as TradeLeg[];
  restoreGiveEscrow(trade.fromPlayerId, give, trade.giveCoins);
  db.update(trades).set({ status: "rejected" }).where(eq(trades.id, tradeId)).run();
  return { ok: true };
}

/**
 * Accepts a pending trade: deliver escrowed give, pull want from recipient.
 */
export function acceptTrade(userId: string, tradeId: string): ActionResult {
  return withTransaction(() => {
    const me = playerByUserId(userId);
    if (!me) return { ok: false, error: ACTION_ERROR.playerMissing };
    const trade = db.select().from(trades).where(eq(trades.id, tradeId)).get();
    if (!trade || trade.status !== "pending") {
      return { ok: false, error: ACTION_ERROR.tradeNotFound };
    }
    if (trade.toPlayerId !== me.id) {
      return { ok: false, error: ACTION_ERROR.tradeOnlyRecipient };
    }

    const from = db.select().from(players).where(eq(players.id, trade.fromPlayerId)).get();
    const to = db.select().from(players).where(eq(players.id, trade.toPlayerId)).get();
    if (!from || !to) return { ok: false, error: ACTION_ERROR.playerMissing };

    const give = JSON.parse(trade.giveJson) as TradeLeg[];
    const want = JSON.parse(trade.wantJson) as TradeLeg[];

    if (to.softCurrency < trade.wantCoins) {
      return { ok: false, error: ACTION_ERROR.tradeYouBroke };
    }
    for (const leg of want) {
      if (countItem(to.id, leg.itemId) < leg.qty) {
        return { ok: false, error: ACTION_ERROR.tradeYouMissingItems };
      }
    }

    const wantTaken: TradeLeg[] = [];
    for (const leg of want) {
      const taken = takeItemInstances(to.id, leg.itemId, leg.qty);
      if (!taken) {
        restoreGiveEscrow(to.id, wantTaken, 0);
        return { ok: false, error: ACTION_ERROR.tradeYouMissingItems };
      }
      for (const unit of taken) {
        if (ITEMS[leg.itemId].stackable) {
          wantTaken.push({ itemId: leg.itemId, qty: 1 });
        } else {
          wantTaken.push({
            itemId: leg.itemId,
            qty: 1,
            durability: unit.durability,
          });
        }
      }
    }

    for (const leg of expandEscrowLegs(give)) {
      if (ITEMS[leg.itemId].stackable) addItem(to.id, leg.itemId, leg.qty);
      else addItemWithDurability(to.id, leg.itemId, leg.durability);
    }
    for (const leg of wantTaken) {
      if (ITEMS[leg.itemId].stackable) addItem(from.id, leg.itemId, leg.qty);
      else addItemWithDurability(from.id, leg.itemId, leg.durability);
    }

    const fromFresh = db.select().from(players).where(eq(players.id, from.id)).get()!;
    const toFresh = db.select().from(players).where(eq(players.id, to.id)).get()!;
    db.update(players)
      .set({ softCurrency: fromFresh.softCurrency + trade.wantCoins })
      .where(eq(players.id, from.id))
      .run();
    db.update(players)
      .set({
        softCurrency: toFresh.softCurrency - trade.wantCoins + trade.giveCoins,
      })
      .where(eq(players.id, to.id))
      .run();

    db.update(trades).set({ status: "accepted" }).where(eq(trades.id, tradeId)).run();
    return { ok: true };
  });
}
