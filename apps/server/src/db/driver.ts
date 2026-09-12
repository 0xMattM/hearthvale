/**
 * DB driver selection (F16.1). SQLite remains the default; Postgres is opt-in.
 */

export type DbDriver = "sqlite" | "postgres";

export class DbConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DbConfigError";
  }
}

/**
 * Resolves the active DB driver from env.
 *
 * - Default: `sqlite`
 * - `GAME_DB_DRIVER=postgres|postgresql` → postgres
 * - Bare `DATABASE_URL` starting with `postgres` also selects postgres
 */
export function resolveDbDriver(
  env: NodeJS.ProcessEnv = process.env,
): DbDriver {
  const raw = (env.GAME_DB_DRIVER ?? "").trim().toLowerCase();
  if (raw === "postgres" || raw === "postgresql" || raw === "pg") {
    return "postgres";
  }
  if (raw === "sqlite" || raw === "better-sqlite3" || raw === "") {
    const url = (env.GAME_DATABASE_URL ?? env.DATABASE_URL ?? "").trim();
    if (!raw && /^postgres(ql)?:\/\//i.test(url)) {
      return "postgres";
    }
    return "sqlite";
  }
  throw new DbConfigError(
    `Unknown GAME_DB_DRIVER "${env.GAME_DB_DRIVER}". Use sqlite or postgres.`,
  );
}

/**
 * Connection string for Postgres. Prefers GAME_DATABASE_URL, then DATABASE_URL.
 */
export function resolvePostgresUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const url = (env.GAME_DATABASE_URL ?? env.DATABASE_URL ?? "").trim();
  if (!url) {
    throw new DbConfigError(
      "Postgres driver selected but GAME_DATABASE_URL / DATABASE_URL is missing.",
    );
  }
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    throw new DbConfigError(
      "Postgres URL must start with postgres:// or postgresql://",
    );
  }
  return url;
}
