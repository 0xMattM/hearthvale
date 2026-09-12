import {
  ACTION_ERROR,
  isValidCoinSwapAmount,
  realmWeiForCoins,
  type CoinSwapDto,
  type CoinSwapStatus,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import { coinSwaps, players, realmBalances, users } from "../../db/schema.js";
import type { ActionResult } from "../actions/farming.js";
import { withTransaction } from "../../db/transaction.js";
import { creditcoinConfig } from "./config.js";
import { hasDirectRealmMinter } from "./onchain.js";

function toDto(row: typeof coinSwaps.$inferSelect): CoinSwapDto {
  return {
    id: row.id,
    coinsBurned: row.coinsBurned,
    realmAmount: row.realmAmount,
    nonce: row.nonce,
    status: row.status as CoinSwapStatus,
    sepoliaTxHash: row.sepoliaTxHash ?? null,
    creditcoinTxHash: row.creditcoinTxHash ?? null,
    createdAt: row.createdAt,
  };
}

/**
 * Lists coin→REALM swaps for the player (newest first).
 */
export function listCoinSwaps(playerId: string): CoinSwapDto[] {
  return db
    .select()
    .from(coinSwaps)
    .where(eq(coinSwaps.playerId, playerId))
    .all()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(toDto);
}

/**
 * Credits off-chain REALM wei (local_dev ledger / pending overlay).
 */
export function creditRealmWei(playerId: string, wei: string): void {
  const row = db
    .select()
    .from(realmBalances)
    .where(eq(realmBalances.playerId, playerId))
    .get();
  const next = (BigInt(row?.amountWei ?? "0") + BigInt(wei)).toString();
  if (row) {
    db.update(realmBalances)
      .set({ amountWei: next })
      .where(eq(realmBalances.playerId, playerId))
      .run();
    return;
  }
  db.insert(realmBalances)
    .values({ playerId, amountWei: next })
    .run();
}

/**
 * Debits off-chain REALM wei. Returns false when the ledger cannot cover it.
 */
export function debitRealmWei(playerId: string, wei: string): boolean {
  const row = db
    .select()
    .from(realmBalances)
    .where(eq(realmBalances.playerId, playerId))
    .get();
  const have = BigInt(row?.amountWei ?? "0");
  const need = BigInt(wei);
  if (have < need) return false;
  const next = (have - need).toString();
  if (row) {
    db.update(realmBalances)
      .set({ amountWei: next })
      .where(eq(realmBalances.playerId, playerId))
      .run();
  }
  return true;
}

/**
 * Local-dev REALM wei held for a player.
 */
export function localRealmWei(playerId: string): string {
  return (
    db
      .select()
      .from(realmBalances)
      .where(eq(realmBalances.playerId, playerId))
      .get()?.amountWei ?? "0"
  );
}

/**
 * Burns soft coins and queues an Attestcoin (or local_dev) REALM mint.
 */
export function requestCoinSwap(
  userId: string,
  coins: number,
): ActionResult & { swap?: CoinSwapDto } {
  return withTransaction(() => {
    if (!isValidCoinSwapAmount(coins)) {
      return { ok: false, error: ACTION_ERROR.coinSwapBadAmount };
    }
    const player = db.select().from(players).where(eq(players.userId, userId)).get();
    if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
    const user = db.select().from(users).where(eq(users.id, userId)).get();
    if (!user?.walletAddress) {
      return { ok: false, error: ACTION_ERROR.walletNeedLink };
    }
    const open = db
      .select()
      .from(coinSwaps)
      .where(
        and(eq(coinSwaps.playerId, player.id), eq(coinSwaps.status, "pending")),
      )
      .get();
    if (open) {
      if (Date.now() - open.createdAt > 60_000) refundCoinSwap(open.id);
      else return { ok: false, error: ACTION_ERROR.coinSwapPending };
    }
    if (player.softCurrency < coins) {
      return { ok: false, error: ACTION_ERROR.notEnoughCoins };
    }

    const realmAmount = realmWeiForCoins(coins);
    db.update(players)
      .set({ softCurrency: player.softCurrency - coins })
      .where(eq(players.id, player.id))
      .run();

    const id = nanoid();
    const nonce = `0x${Buffer.from(id).toString("hex").padEnd(64, "0").slice(0, 64)}`;
    const cfg = creditcoinConfig();
    const mintedLocal = cfg.mode === "local_dev" && !hasDirectRealmMinter();
    db.insert(coinSwaps)
      .values({
        id,
        playerId: player.id,
        walletAddress: user.walletAddress,
        coinsBurned: coins,
        realmAmount,
        nonce,
        status: mintedLocal ? "minted" : "pending",
        sepoliaTxHash: null,
        creditcoinTxHash: mintedLocal ? "local_dev" : null,
        createdAt: Date.now(),
      })
      .run();
    if (mintedLocal) creditRealmWei(player.id, realmAmount);
    const row = db.select().from(coinSwaps).where(eq(coinSwaps.id, id)).get()!;
    return { ok: true, swap: toDto(row) };
  });
}

/**
 * Loads one swap row as a DTO.
 */
export function getCoinSwap(swapId: string): CoinSwapDto | null {
  const row = db.select().from(coinSwaps).where(eq(coinSwaps.id, swapId)).get();
  return row ? toDto(row) : null;
}

/**
 * Marks a swap notarized on Sepolia (worker).
 */
export function markSwapNotarized(swapId: string, sepoliaTxHash: string): void {
  db.update(coinSwaps)
    .set({ status: "notarized", sepoliaTxHash })
    .where(eq(coinSwaps.id, swapId))
    .run();
}

/**
 * Marks a swap minted on Creditcoin (worker).
 */
export function markSwapMinted(swapId: string, creditcoinTxHash: string): void {
  db.update(coinSwaps)
    .set({ status: "minted", creditcoinTxHash })
    .where(eq(coinSwaps.id, swapId))
    .run();
}

/**
 * Marks a swap failed (worker).
 */
export function markSwapFailed(swapId: string): void {
  db.update(coinSwaps)
    .set({ status: "failed" })
    .where(eq(coinSwaps.id, swapId))
    .run();
}

/**
 * Returns burned coins after a failed on-chain mint. No-op if already minted/failed.
 *
 * @param swapId - Coin swap row id.
 * @returns True when coins were restored.
 */
export function refundCoinSwap(swapId: string): boolean {
  const row = db.select().from(coinSwaps).where(eq(coinSwaps.id, swapId)).get();
  if (!row) return false;
  if (row.status === "minted" || row.status === "failed") return false;
  const player = db
    .select()
    .from(players)
    .where(eq(players.id, row.playerId))
    .get();
  if (player) {
    db.update(players)
      .set({ softCurrency: player.softCurrency + row.coinsBurned })
      .where(eq(players.id, player.id))
      .run();
  }
  markSwapFailed(swapId);
  return true;
}

/**
 * Pending swaps the Attestcoin worker should notarize.
 */
export function listPendingSwaps(): Array<typeof coinSwaps.$inferSelect> {
  return db
    .select()
    .from(coinSwaps)
    .where(eq(coinSwaps.status, "pending"))
    .all();
}

/**
 * Notarized swaps waiting for proof + ASC mint.
 */
export function listNotarizedSwaps(): Array<typeof coinSwaps.$inferSelect> {
  return db
    .select()
    .from(coinSwaps)
    .where(eq(coinSwaps.status, "notarized"))
    .all();
}
