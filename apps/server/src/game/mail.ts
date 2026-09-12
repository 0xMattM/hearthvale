import { ACTION_ERROR, ITEMS, MAIL, type ItemId } from "@game/shared";
import { and, eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/client.js";
import { inventory, mail, players, users } from "../db/schema.js";
import { addItem, removeItem } from "./player.js";
import type { ActionResult } from "./actions/farming.js";
import { withTransaction } from "../db/transaction.js";

export interface MailItemLeg {
  itemId: ItemId;
  qty: number;
}

export interface MailDto {
  id: string;
  fromUsername: string;
  toUsername: string;
  subject: string;
  items: MailItemLeg[];
  coins: number;
  status: string;
  createdAt: number;
  direction: "inbox" | "sent";
}

function playerByUserId(userId: string) {
  return db.select().from(players).where(eq(players.userId, userId)).get();
}

function usernameForPlayerId(playerId: string): string {
  const player = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!player) return "?";
  return (
    db.select().from(users).where(eq(users.id, player.userId)).get()?.username ??
    "?"
  );
}

function normalizeItems(items: MailItemLeg[] | undefined): MailItemLeg[] {
  if (!items?.length) return [];
  const out: MailItemLeg[] = [];
  for (const leg of items) {
    if (!ITEMS[leg.itemId] || leg.qty < 1) continue;
    if (!ITEMS[leg.itemId].stackable) continue;
    const qty = Math.floor(leg.qty);
    const existing = out.find((o) => o.itemId === leg.itemId);
    if (existing) existing.qty += qty;
    else out.push({ itemId: leg.itemId, qty });
  }
  return out;
}

/**
 * Sends an offline parcel (stackables + coins). Recipient claims when online.
 */
export function sendMail(
  userId: string,
  toUsername: string,
  items: MailItemLeg[],
  coins: number,
  subject?: string,
): ActionResult & { mailId?: string } {
  return withTransaction(() => {
    const from = playerByUserId(userId);
    if (!from) return { ok: false, error: ACTION_ERROR.playerMissing };

    const cleanedTo = toUsername.trim().toLowerCase();
    const toUser = db.select().from(users).where(eq(users.username, cleanedTo)).get();
    if (!toUser) return { ok: false, error: ACTION_ERROR.mailPlayerMissing };
    const to = db.select().from(players).where(eq(players.userId, toUser.id)).get();
    if (!to) return { ok: false, error: ACTION_ERROR.mailPlayerMissing };
    if (to.id === from.id) return { ok: false, error: ACTION_ERROR.mailSelf };

    if (items?.some((i) => ITEMS[i.itemId] && !ITEMS[i.itemId].stackable && i.qty > 0)) {
      return { ok: false, error: ACTION_ERROR.mailNotStackable };
    }

    const legs = normalizeItems(items);
    const coinAmt = Math.max(0, Math.floor(coins || 0));
    if (legs.length === 0 && coinAmt === 0) {
      return { ok: false, error: ACTION_ERROR.mailEmpty };
    }

    const openCount = db
      .select()
      .from(mail)
      .where(and(eq(mail.toPlayerId, to.id), eq(mail.status, "pending")))
      .all().length;
    if (openCount >= MAIL.maxOpenInbox) {
      return { ok: false, error: ACTION_ERROR.mailInboxFull };
    }

    if (from.softCurrency < coinAmt) {
      return { ok: false, error: ACTION_ERROR.notEnoughCoins };
    }
    for (const leg of legs) {
      const have = db
        .select()
        .from(inventory)
        .where(eq(inventory.playerId, from.id))
        .all()
        .filter((r) => r.itemId === leg.itemId)
        .reduce((s, r) => s + r.qty, 0);
      if (have < leg.qty) return { ok: false, error: ACTION_ERROR.notEnoughItems };
    }

    for (const leg of legs) {
      if (!removeItem(from.id, leg.itemId, leg.qty)) {
        return { ok: false, error: ACTION_ERROR.notEnoughItems };
      }
    }
    if (coinAmt > 0) {
      db.update(players)
        .set({ softCurrency: from.softCurrency - coinAmt })
        .where(eq(players.id, from.id))
        .run();
    }

    const subj = (subject ?? "Parcel")
      .trim()
      .slice(0, MAIL.maxSubjectLen) || "Parcel";
    const id = nanoid();
    db.insert(mail)
      .values({
        id,
        fromPlayerId: from.id,
        toPlayerId: to.id,
        subject: subj,
        itemsJson: JSON.stringify(legs),
        coins: coinAmt,
        status: "pending",
        createdAt: Date.now(),
      })
      .run();

    return { ok: true, mailId: id };
  });
}

/**
 * Lists pending + recent claimed mail for the player (inbox + sent pending).
 */
export function listMail(userId: string): MailDto[] {
  const me = playerByUserId(userId);
  if (!me) return [];

  const rows = db
    .select()
    .from(mail)
    .where(
      or(
        and(eq(mail.toPlayerId, me.id), eq(mail.status, "pending")),
        and(eq(mail.fromPlayerId, me.id), eq(mail.status, "pending")),
        and(eq(mail.toPlayerId, me.id), eq(mail.status, "claimed")),
      ),
    )
    .all()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 40);

  return rows.map((row) => ({
    id: row.id,
    fromUsername: usernameForPlayerId(row.fromPlayerId),
    toUsername: usernameForPlayerId(row.toPlayerId),
    subject: row.subject,
    items: JSON.parse(row.itemsJson) as MailItemLeg[],
    coins: row.coins,
    status: row.status,
    createdAt: row.createdAt,
    direction: row.toPlayerId === me.id ? ("inbox" as const) : ("sent" as const),
  }));
}

/**
 * Recipient claims a pending parcel into inventory/coins.
 */
export function claimMail(userId: string, mailId: string): ActionResult {
  return withTransaction(() => {
    const me = playerByUserId(userId);
    if (!me) return { ok: false, error: ACTION_ERROR.playerMissing };
    const row = db.select().from(mail).where(eq(mail.id, mailId)).get();
    if (!row) return { ok: false, error: ACTION_ERROR.mailNotFound };
    if (row.status !== "pending") {
      return { ok: false, error: ACTION_ERROR.mailAlreadyClaimed };
    }
    if (row.toPlayerId !== me.id) {
      return { ok: false, error: ACTION_ERROR.mailOnlyRecipient };
    }

    const items = JSON.parse(row.itemsJson) as MailItemLeg[];
    for (const leg of items) {
      addItem(me.id, leg.itemId, leg.qty);
    }
    if (row.coins > 0) {
      const fresh = db.select().from(players).where(eq(players.id, me.id)).get()!;
      db.update(players)
        .set({ softCurrency: fresh.softCurrency + row.coins })
        .where(eq(players.id, me.id))
        .run();
    }
    db.update(mail).set({ status: "claimed" }).where(eq(mail.id, mailId)).run();
    return { ok: true };
  });
}

/**
 * Sender cancels unclaimed mail; goods return to sender.
 */
export function cancelMail(userId: string, mailId: string): ActionResult {
  return withTransaction(() => {
    const me = playerByUserId(userId);
    if (!me) return { ok: false, error: ACTION_ERROR.playerMissing };
    const row = db.select().from(mail).where(eq(mail.id, mailId)).get();
    if (!row || row.status !== "pending") {
      return { ok: false, error: ACTION_ERROR.mailNotFound };
    }
    if (row.fromPlayerId !== me.id) {
      return { ok: false, error: ACTION_ERROR.mailOnlySender };
    }

    const items = JSON.parse(row.itemsJson) as MailItemLeg[];
    for (const leg of items) {
      addItem(me.id, leg.itemId, leg.qty);
    }
    if (row.coins > 0) {
      const fresh = db.select().from(players).where(eq(players.id, me.id)).get()!;
      db.update(players)
        .set({ softCurrency: fresh.softCurrency + row.coins })
        .where(eq(players.id, me.id))
        .run();
    }
    db.update(mail).set({ status: "cancelled" }).where(eq(mail.id, mailId)).run();
    return { ok: true };
  });
}
