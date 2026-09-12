import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/client.js";
import { sessions, users } from "../db/schema.js";
import { bootstrapPlayer } from "../game/player.js";

export interface AuthResult {
  ok: boolean;
  token?: string;
  error?: string;
}

/** Default session lifetime: 7 days (RF1.1). Override with GAME_SESSION_TTL_MS. */
export const DEFAULT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Reject absurdly short TTLs in production env (tests may set ≥ 1s). */
const MIN_SESSION_TTL_MS = 1_000;

/** Minimum password length for new registrations / policy checks (RF1.4). */
export const MIN_PASSWORD_LENGTH = 8;

/** bcrypt cost for newly hashed passwords (RF1.4). Existing hashes keep their cost. */
export const BCRYPT_COST_NEW = 10;

/**
 * Resolves bcrypt cost for new hashes.
 * Override with GAME_BCRYPT_COST (4–15) for fast tests.
 *
 * @param env - Process env.
 */
export function resolveBcryptCost(
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw = (env.GAME_BCRYPT_COST ?? "").trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 4 && n <= 15) return Math.floor(n);
  }
  return BCRYPT_COST_NEW;
}

/**
 * Resolves session TTL from env.
 *
 * @param env - Process env (injectable for tests).
 * @returns TTL in milliseconds (≥ 1s when override is valid).
 */
export function resolveSessionTtlMs(
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw = (env.GAME_SESSION_TTL_MS ?? "").trim();
  if (!raw) return DEFAULT_SESSION_TTL_MS;
  const n = Number(raw);
  // Reason: invalid / too-small overrides fall back so misconfig cannot lock everyone out.
  if (!Number.isFinite(n) || n < MIN_SESSION_TTL_MS) return DEFAULT_SESSION_TTL_MS;
  return Math.floor(n);
}

/**
 * Absolute expiry timestamp for a session created at `createdAt`.
 *
 * @param createdAt - Session creation ms.
 * @param ttlMs - Lifetime (defaults to env/default TTL).
 */
export function sessionExpiresAt(
  createdAt: number,
  ttlMs: number = resolveSessionTtlMs(),
): number {
  return createdAt + ttlMs;
}

/**
 * Whether a session created at `createdAt` is expired at `nowMs`.
 *
 * @param createdAt - Session creation ms.
 * @param nowMs - Clock (injectable for tests).
 * @param ttlMs - Lifetime override.
 */
export function isSessionExpired(
  createdAt: number,
  nowMs: number = Date.now(),
  ttlMs: number = resolveSessionTtlMs(),
): boolean {
  return nowMs >= sessionExpiresAt(createdAt, ttlMs);
}

/**
 * Registers a user and bootstraps their starter land.
 */
export function registerUser(username: string, password: string): AuthResult {
  const cleaned = username.trim().toLowerCase();
  if (cleaned.length < 3) return { ok: false, error: "Username too short" };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: "Password too short" };
  }

  const existing = db.select().from(users).where(eq(users.username, cleaned)).get();
  if (existing) return { ok: false, error: "Username taken" };

  const userId = nanoid();
  const now = Date.now();
  db.insert(users)
    .values({
      id: userId,
      username: cleaned,
      passwordHash: bcrypt.hashSync(password, resolveBcryptCost()),
      createdAt: now,
    })
    .run();

  bootstrapPlayer(userId);

  const token = nanoid(32);
  db.insert(sessions)
    .values({ token, userId, createdAt: now })
    .run();

  return { ok: true, token };
}

/**
 * Logs in an existing user.
 */
export function loginUser(username: string, password: string): AuthResult {
  const cleaned = username.trim().toLowerCase();
  const user = db.select().from(users).where(eq(users.username, cleaned)).get();
  if (!user) return { ok: false, error: "Invalid credentials" };
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    return { ok: false, error: "Invalid credentials" };
  }

  const token = nanoid(32);
  db.insert(sessions)
    .values({ token, userId: user.id, createdAt: Date.now() })
    .run();

  return { ok: true, token };
}

/**
 * Resolves a session token to a user id.
 * Expired sessions (createdAt + TTL) are deleted and treated as missing (RF1.1).
 *
 * @param token - Bearer session token.
 * @param nowMs - Clock override for tests.
 */
export function userIdFromToken(
  token: string | undefined,
  nowMs: number = Date.now(),
): string | null {
  if (!token) return null;
  const session = db.select().from(sessions).where(eq(sessions.token, token)).get();
  if (!session) return null;
  if (isSessionExpired(session.createdAt, nowMs)) {
    // Reason: drop dead rows so leaked tokens cannot linger forever after TTL.
    db.delete(sessions).where(eq(sessions.token, token)).run();
    return null;
  }
  return session.userId;
}

/**
 * Deletes a session by token (RF1.2 logout / revoke).
 *
 * @param token - Bearer session token.
 * @returns true if a row was removed.
 */
export function revokeSession(token: string | undefined): boolean {
  if (!token) return false;
  const session = db.select().from(sessions).where(eq(sessions.token, token)).get();
  if (!session) return false;
  db.delete(sessions).where(eq(sessions.token, token)).run();
  return true;
}
