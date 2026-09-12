import { ACTION_ERROR, stubWalletAddress } from "@game/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { getPlayerState } from "./player.js";
import type { ActionResult } from "./actions/farming.js";
import { creditcoinConfig } from "./creditcoin/config.js";

/**
 * Stub `/api/wallet/connect` is offline play only — never attestcoin.
 *
 * Args:
 *   mode: Current Creditcoin mode.
 *
 * Returns:
 *   True when a deterministic stub address may be linked.
 */
export function isStubWalletMode(mode: string): boolean {
  return mode === "local_dev";
}

/**
 * Links a deterministic stub wallet to the account (F15.1). Optional — never gates play.
 */
export function connectWalletStub(
  userId: string,
): ActionResult & { walletAddress?: string } {
  if (!isStubWalletMode(creditcoinConfig().mode)) {
    return { ok: false, error: ACTION_ERROR.walletStubLocalOnly };
  }
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (user.walletAddress) {
    return { ok: false, error: ACTION_ERROR.walletAlreadyLinked };
  }
  const address = stubWalletAddress(userId);
  db.update(users)
    .set({ walletAddress: address })
    .where(eq(users.id, userId))
    .run();
  return { ok: true, walletAddress: address };
}

/**
 * Clears the linked stub wallet.
 */
export function disconnectWalletStub(userId: string): ActionResult {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!user.walletAddress) {
    return { ok: false, error: ACTION_ERROR.walletNotLinked };
  }
  db.update(users)
    .set({ walletAddress: null })
    .where(eq(users.id, userId))
    .run();
  return { ok: true };
}

/**
 * Current linked address or null.
 */
export function linkedWalletAddress(userId: string): string | null {
  return (
    db.select().from(users).where(eq(users.id, userId)).get()?.walletAddress ??
    null
  );
}

/**
 * Player state after wallet mutation (for API responses).
 */
export function walletLinkResult(userId: string) {
  return {
    state: getPlayerState(userId),
    walletAddress: linkedWalletAddress(userId),
  };
}
