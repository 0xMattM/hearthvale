import { describe, expect, it } from "vitest";
import {
  DbConfigError,
  resolveDbDriver,
  resolvePostgresUrl,
} from "../../apps/server/src/db/driver.ts";

describe("postgres adapter driver F16.1", () => {
  it("defaults to sqlite (happy)", () => {
    expect(resolveDbDriver({})).toBe("sqlite");
    expect(resolveDbDriver({ GAME_DB_DRIVER: "sqlite" })).toBe("sqlite");
    expect(resolveDbDriver({ GAME_DB_PATH: ":memory:" })).toBe("sqlite");
  });

  it("selects postgres from GAME_DB_DRIVER (happy)", () => {
    expect(resolveDbDriver({ GAME_DB_DRIVER: "postgres" })).toBe("postgres");
    expect(resolveDbDriver({ GAME_DB_DRIVER: "postgresql" })).toBe("postgres");
    expect(resolveDbDriver({ GAME_DB_DRIVER: "PG" })).toBe("postgres");
  });

  it("selects postgres from DATABASE_URL when driver unset (happy)", () => {
    expect(
      resolveDbDriver({
        DATABASE_URL: "postgres://localhost:5432/game",
      }),
    ).toBe("postgres");
    expect(
      resolveDbDriver({
        GAME_DATABASE_URL: "postgresql://user:pass@db:5432/game",
      }),
    ).toBe("postgres");
  });

  it("resolves postgres URL preferring GAME_DATABASE_URL (happy)", () => {
    expect(
      resolvePostgresUrl({
        GAME_DATABASE_URL: "postgres://a/game",
        DATABASE_URL: "postgres://b/game",
      }),
    ).toBe("postgres://a/game");
  });

  it("rejects unknown GAME_DB_DRIVER (fail)", () => {
    expect(() => resolveDbDriver({ GAME_DB_DRIVER: "mysql" })).toThrow(
      DbConfigError,
    );
  });

  it("rejects postgres without URL (fail)", () => {
    expect(() => resolvePostgresUrl({ GAME_DB_DRIVER: "postgres" })).toThrow(
      DbConfigError,
    );
    expect(() => resolvePostgresUrl({ DATABASE_URL: "" })).toThrow(
      DbConfigError,
    );
  });

  it("rejects non-postgres URL (edge)", () => {
    expect(() =>
      resolvePostgresUrl({ DATABASE_URL: "mysql://localhost/game" }),
    ).toThrow(DbConfigError);
  });

  it("explicit sqlite wins over postgres DATABASE_URL (edge)", () => {
    expect(
      resolveDbDriver({
        GAME_DB_DRIVER: "sqlite",
        DATABASE_URL: "postgres://localhost:5432/game",
      }),
    ).toBe("sqlite");
  });
});
