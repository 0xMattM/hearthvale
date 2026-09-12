import {
  ACTION_ERROR,
  getVendorPrices,
  isExploreLandKind,
  normalizeLandKind,
  type ItemId,
  type LandKind,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { buildings, players } from "../../db/schema.js";
import { getActiveLand } from "../land.js";
import { addItem, removeItem } from "../player.js";
import { requireNearGrid, type Pos } from "../proximity.js";
import type { ActionResult } from "./farming.js";

/** Max stack a single vendor buy/sell call may move (blocks Infinity / hangs). */
export const VENDOR_QTY_MAX = 99;

/**
 * True when qty is a safe positive integer for vendor buy/sell.
 *
 * Args:
 *   qty: Requested amount from the HTTP body.
 *
 * Returns:
 *   True for 1..VENDOR_QTY_MAX inclusive.
 */
export function isValidVendorQty(qty: number): boolean {
  return Number.isInteger(qty) && qty >= 1 && qty <= VENDOR_QTY_MAX;
}

function vendorContext(playerId: string) {
  const land = getActiveLand(playerId);
  if (!land) return null;
  const stall = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.landId, land.id), eq(buildings.type, "vendor_stall")))
    .get();
  if (!stall) return null;
  const landKind: LandKind =
    normalizeLandKind(land.kind) ??
    (isExploreLandKind(land.kind) ? "explore" : "player_land");
  return { land, stall, landKind };
}

/**
 * Tutorial / regional vendor: buys mats / sells seeds at the stall on the active land.
 */
export function vendorSell(
  userId: string,
  itemId: ItemId,
  qty: number,
  pos?: Pos,
): ActionResult {
  if (!isValidVendorQty(qty)) return { ok: false, error: ACTION_ERROR.invalidQty };

  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const ctx = vendorContext(player.id);
  if (!ctx) return { ok: false, error: ACTION_ERROR.needsStation("vendor stall") };

  const price = getVendorPrices(ctx.landKind).sell[itemId];
  if (price == null) return { ok: false, error: ACTION_ERROR.vendorWontBuy };

  const near = requireNearGrid(pos, ctx.stall.x, ctx.stall.z);
  if (!near.ok) return near;

  if (!removeItem(player.id, itemId, qty)) {
    return { ok: false, error: ACTION_ERROR.notEnoughItems };
  }

  db.update(players)
    .set({ softCurrency: player.softCurrency + price * qty })
    .where(eq(players.id, player.id))
    .run();
  return { ok: true };
}

/**
 * Buys seeds from the regional vendor on the active land.
 */
export function vendorBuy(
  userId: string,
  itemId: ItemId,
  qty: number,
  pos?: Pos,
): ActionResult {
  if (!isValidVendorQty(qty)) return { ok: false, error: ACTION_ERROR.invalidQty };

  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const ctx = vendorContext(player.id);
  if (!ctx) return { ok: false, error: ACTION_ERROR.needsStation("vendor stall") };

  const price = getVendorPrices(ctx.landKind).buy[itemId];
  if (price == null) return { ok: false, error: ACTION_ERROR.vendorWontSell };

  const near = requireNearGrid(pos, ctx.stall.x, ctx.stall.z);
  if (!near.ok) return near;

  const total = price * qty;
  if (player.softCurrency < total) {
    return { ok: false, error: ACTION_ERROR.notEnoughCoins };
  }

  db.update(players)
    .set({ softCurrency: player.softCurrency - total })
    .where(eq(players.id, player.id))
    .run();
  addItem(player.id, itemId, qty);
  return { ok: true };
}
