/**
 * SQLite transaction helper (RF2.1).
 * better-sqlite3 wraps the callback so nested `db` ops on this connection are atomic.
 */
import { db } from "./client.js";

/**
 * Runs `fn` inside a single SQLite transaction.
 *
 * @param fn - Sync work that uses the shared `db` handle.
 * @returns Whatever `fn` returns.
 */
export function withTransaction<T>(fn: () => T): T {
  return db.transaction(fn);
}
