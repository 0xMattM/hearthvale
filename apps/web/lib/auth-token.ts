/**
 * Client auth token persistence (RF7.1).
 * Key matches historical GameApp localStorage id.
 */

export const AUTH_TOKEN_KEY = "game_mvp_token";

type AuthExpiredHandler = () => void;
let authExpiredHandler: AuthExpiredHandler | null = null;

/**
 * Registers a callback when the API sees HTTP 401 (session gone).
 *
 * Args:
 *   next: Handler, or null to clear.
 */
export function setAuthExpiredHandler(next: AuthExpiredHandler | null): void {
  authExpiredHandler = next;
}

/**
 * Invokes the 401 handler if one is registered.
 */
export function notifyAuthExpired(): void {
  authExpiredHandler?.();
}

/**
 * Reads the persisted session token from localStorage.
 *
 * @returns Token string, or null when missing / unreadable.
 */
export function readStoredAuthToken(): string | null {
  try {
    return globalThis.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Persists a session token after login/register.
 *
 * @param token - Bearer token from the auth API.
 */
export function writeStoredAuthToken(token: string): void {
  try {
    globalThis.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    /* private mode / quota — session still works in memory */
  }
}

/**
 * Removes the persisted session token (logout / revoke).
 */
export function clearStoredAuthToken(): void {
  try {
    globalThis.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
