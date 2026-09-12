/**
 * Client IP for auth rate limits (SEC-5).
 * X-Forwarded-For is only honored behind a trusted reverse proxy.
 */

export interface HeaderReader {
  header: (name: string) => string | undefined;
}

/**
 * Bucket key for login/register rate limits.
 *
 * Args:
 *   c: Hono-like request with header().
 *
 * Returns:
 *   Forwarded IP when GAME_TRUST_PROXY=1, otherwise a shared "local" bucket.
 */
export function authClientIp(c: { req: HeaderReader }): string {
  if (process.env.GAME_TRUST_PROXY === "1") {
    const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwarded) return forwarded;
  }
  return "local";
}
