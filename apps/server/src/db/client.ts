/**
 * DB entrypoint: SQLite + Drizzle (default).
 * Postgres opt-in is disabled until RF3.3 async AppDb (RF3.1 honesty).
 */
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import {
  DbConfigError,
  resolveDbDriver,
  resolvePostgresUrl,
  type DbDriver,
} from "./driver.js";
import * as sqliteSchema from "./schema.sqlite.js";
import * as sqliteClient from "./sqlite-client.js";

export type { DbDriver };
export { DbConfigError, resolveDbDriver, resolvePostgresUrl };

/**
 * Refuses Postgres until RF3.3 async AppDb exists (RF3.1).
 *
 * @param driver - Resolved driver.
 */
export function assertSupportedDbDriver(driver: DbDriver): void {
  if (driver === "postgres") {
    throw new DbConfigError(
      "Postgres is not supported yet (RF3). Use SQLite (default) until the async data layer ships (RF3.3). Unset GAME_DB_DRIVER / DATABASE_URL.",
    );
  }
}

export const dbDriver: DbDriver = resolveDbDriver();
assertSupportedDbDriver(dbDriver);

type AppDb = BetterSQLite3Database<typeof sqliteSchema>;

/**
 * Active Drizzle database (SQLite only until RF3.3).
 */
export const db: AppDb = sqliteClient.db;

/**
 * Applies schema for the active driver (SQLite).
 */
export async function migrateDatabase(): Promise<void> {
  assertSupportedDbDriver(dbDriver);
  sqliteClient.migrateSqlite();
}

/**
 * Sync migrate for SQLite (tests + legacy callers).
 */
export function migrateSqlite(): void {
  assertSupportedDbDriver(dbDriver);
  sqliteClient.migrateSqlite();
}
