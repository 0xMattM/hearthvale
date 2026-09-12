import {
  ACTION_ERROR,
  GUILD_BANK,
  ITEMS,
  type ItemId,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/client.js";
import { guildBank, players } from "../db/schema.js";
import type { ActionResult } from "./actions/farming.js";
import { addItem, removeItem } from "./player.js";

function playerByUserId(userId: string) {
  return db.select().from(players).where(eq(players.userId, userId)).get();
}

function isKnownStackable(itemId: string): itemId is ItemId {
  const def = ITEMS[itemId as ItemId];
  return Boolean(def?.stackable);
}

/**
 * Deletes all vault rows for a dissolving guild.
 */
export function clearGuildBank(guildId: string): void {
  db.delete(guildBank).where(eq(guildBank.guildId, guildId)).run();
}

/**
 * Lists stackable contents of the caller's guild vault.
 */
export function listGuildBank(
  userId: string,
): Array<{ itemId: ItemId; qty: number }> {
  const player = playerByUserId(userId);
  if (!player?.guildId) return [];
  return db
    .select()
    .from(guildBank)
    .where(eq(guildBank.guildId, player.guildId))
    .all()
    .filter((row) => row.qty > 0)
    .map((row) => ({ itemId: row.itemId as ItemId, qty: row.qty }));
}

/**
 * Moves stackables from personal inventory into the guild vault.
 */
export function depositGuildBank(
  userId: string,
  itemId: string,
  qty: number,
): ActionResult {
  const player = playerByUserId(userId);
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!player.guildId) return { ok: false, error: ACTION_ERROR.guildNotIn };
  if (!Number.isFinite(qty) || qty < 1 || !Number.isInteger(qty)) {
    return { ok: false, error: ACTION_ERROR.guildBankBadQty };
  }
  if (!isKnownStackable(itemId)) {
    const def = ITEMS[itemId as ItemId];
    if (!def) return { ok: false, error: ACTION_ERROR.guildBankUnknownItem };
    return { ok: false, error: ACTION_ERROR.guildBankNotStackable };
  }
  if (qty > GUILD_BANK.maxStackQty) {
    return { ok: false, error: ACTION_ERROR.guildBankBadQty };
  }

  const existing = db
    .select()
    .from(guildBank)
    .where(
      and(
        eq(guildBank.guildId, player.guildId),
        eq(guildBank.itemId, itemId),
      ),
    )
    .get();

  if (!existing) {
    const slots = db
      .select()
      .from(guildBank)
      .where(eq(guildBank.guildId, player.guildId))
      .all().length;
    if (slots >= GUILD_BANK.maxSlots) {
      return { ok: false, error: ACTION_ERROR.guildBankFull };
    }
  } else if (existing.qty + qty > GUILD_BANK.maxStackQty) {
    return { ok: false, error: ACTION_ERROR.guildBankBadQty };
  }

  if (!removeItem(player.id, itemId, qty)) {
    return { ok: false, error: ACTION_ERROR.notEnoughItems };
  }

  if (existing) {
    db.update(guildBank)
      .set({ qty: existing.qty + qty })
      .where(eq(guildBank.id, existing.id))
      .run();
  } else {
    db.insert(guildBank)
      .values({
        id: nanoid(),
        guildId: player.guildId,
        itemId,
        qty,
      })
      .run();
  }
  return { ok: true };
}

/**
 * Moves stackables from the guild vault into personal inventory.
 */
export function withdrawGuildBank(
  userId: string,
  itemId: string,
  qty: number,
): ActionResult {
  const player = playerByUserId(userId);
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!player.guildId) return { ok: false, error: ACTION_ERROR.guildNotIn };
  if (player.guildRank !== "owner" && player.guildRank !== "officer") {
    return { ok: false, error: ACTION_ERROR.guildBankWithdrawForbidden };
  }
  if (!Number.isFinite(qty) || qty < 1 || !Number.isInteger(qty)) {
    return { ok: false, error: ACTION_ERROR.guildBankBadQty };
  }
  if (!isKnownStackable(itemId)) {
    const def = ITEMS[itemId as ItemId];
    if (!def) return { ok: false, error: ACTION_ERROR.guildBankUnknownItem };
    return { ok: false, error: ACTION_ERROR.guildBankNotStackable };
  }

  const existing = db
    .select()
    .from(guildBank)
    .where(
      and(
        eq(guildBank.guildId, player.guildId),
        eq(guildBank.itemId, itemId),
      ),
    )
    .get();
  if (!existing || existing.qty < qty) {
    return { ok: false, error: ACTION_ERROR.guildBankEmpty };
  }

  const nextQty = existing.qty - qty;
  if (nextQty <= 0) {
    db.delete(guildBank).where(eq(guildBank.id, existing.id)).run();
  } else {
    db.update(guildBank)
      .set({ qty: nextQty })
      .where(eq(guildBank.id, existing.id))
      .run();
  }
  addItem(player.id, itemId, qty);
  return { ok: true };
}
