import {
  ACTION_ERROR,
  CREDITCOIN_TESTNET,
  normalizeEvmAddress,
  walletLinkMessage,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { verifyMessage } from "ethers";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import { users } from "../../db/schema.js";
import type { ActionResult } from "../actions/farming.js";

interface Challenge {
  nonce: string;
  issuedAt: string;
  expiresAt: number;
}

const challenges = new Map<string, Challenge>();
const CHALLENGE_TTL_MS = 10 * 60 * 1000;

/**
 * Issues a one-time wallet-link challenge for the signed message.
 */
export function createWalletLinkChallenge(userId: string): {
  ok: true;
  message: string;
  nonce: string;
  issuedAt: string;
  chainId: number;
} | { ok: false; error: string } {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return { ok: false, error: ACTION_ERROR.playerMissing };
  const nonce = nanoid();
  const issuedAt = new Date().toISOString();
  challenges.set(userId, {
    nonce,
    issuedAt,
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  });
  return {
    ok: true,
    nonce,
    issuedAt,
    chainId: CREDITCOIN_TESTNET.chainId,
    message: walletLinkMessage({
      username: user.username,
      userId,
      chainId: CREDITCOIN_TESTNET.chainId,
      nonce,
      issuedAt,
    }),
  };
}

/**
 * Verifies an EIP-191 personal_sign and stores the Creditcoin address.
 */
export function linkWalletWithSignature(
  userId: string,
  address: string,
  signature: string,
  message: string,
): ActionResult & { walletAddress?: string } {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (user.walletAddress) {
    return { ok: false, error: ACTION_ERROR.walletAlreadyLinked };
  }
  const normalized = normalizeEvmAddress(address);
  if (!normalized) return { ok: false, error: ACTION_ERROR.walletBadAddress };

  const challenge = challenges.get(userId);
  if (!challenge || challenge.expiresAt < Date.now()) {
    return { ok: false, error: ACTION_ERROR.walletBadSignature };
  }
  const expected = walletLinkMessage({
    username: user.username,
    userId,
    chainId: CREDITCOIN_TESTNET.chainId,
    nonce: challenge.nonce,
    issuedAt: challenge.issuedAt,
  });
  if (message !== expected) {
    return { ok: false, error: ACTION_ERROR.walletBadSignature };
  }

  let recovered: string;
  try {
    recovered = verifyMessage(message, signature);
  } catch {
    return { ok: false, error: ACTION_ERROR.walletBadSignature };
  }
  if (normalizeEvmAddress(recovered) !== normalized) {
    return { ok: false, error: ACTION_ERROR.walletBadSignature };
  }

  const taken = db
    .select()
    .from(users)
    .where(eq(users.walletAddress, normalized))
    .get();
  if (taken && taken.id !== userId) {
    return { ok: false, error: ACTION_ERROR.walletInUse };
  }

  db.update(users)
    .set({ walletAddress: normalized })
    .where(eq(users.id, userId))
    .run();
  challenges.delete(userId);
  return { ok: true, walletAddress: normalized };
}

/**
 * True when `value` is a 0x-prefixed 65-byte ECDSA signature.
 */
export function looksLikeSignature(value: string): boolean {
  return /^0x[a-fA-F0-9]{130}$/.test(value);
}
