/**
 * Simple fixed-window rate limiter (RF1.3 / RF1.5).
 * In-memory per process — enough for single-node MVP.
 */

export interface RateBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateBucket>();

/**
 * Tries to consume one slot in a fixed window.
 *
 * @param key - Bucket key (e.g. `login:ip:1.2.3.4` or `chat:userId`).
 * @param limit - Max events per window.
 * @param windowMs - Window length.
 * @param nowMs - Clock (tests).
 * @returns true if allowed; false if limited.
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  nowMs: number = Date.now(),
): boolean {
  let bucket = buckets.get(key);
  if (!bucket || nowMs >= bucket.resetAt) {
    bucket = { count: 0, resetAt: nowMs + windowMs };
    buckets.set(key, bucket);
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * Clears all buckets (tests only).
 */
export function resetRateLimitBuckets(): void {
  buckets.clear();
}

/** Auth endpoints: 10 attempts / 60s per IP (and per username when known). */
export const AUTH_RATE_LIMIT = 10;
export const AUTH_RATE_WINDOW_MS = 60_000;

/** Chat / WS chat: 5 messages / 10s per user. */
export const CHAT_RATE_LIMIT = 5;
export const CHAT_RATE_WINDOW_MS = 10_000;

/** Presence WS: 20 updates / 5s per user (blunt flood). */
export const PRESENCE_RATE_LIMIT = 20;
export const PRESENCE_RATE_WINDOW_MS = 5_000;
