import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const dbFile = path.join(
  os.tmpdir(),
  `game-pg-adapter-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;
delete process.env.GAME_DB_DRIVER;
delete process.env.DATABASE_URL;
delete process.env.GAME_DATABASE_URL;

const { dbDriver, migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { users } = await import("../../apps/server/src/db/schema.ts");

describe("postgres adapter keeps sqlite default F16.1", () => {
  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("uses sqlite client + migrate by default (happy)", () => {
    expect(dbDriver).toBe("sqlite");
    migrateSqlite();
    const row = db
      .insert(users)
      .values({
        id: "u_pg_adapter",
        username: `pg_adapter_${Date.now()}`,
        passwordHash: "x",
        createdAt: Date.now(),
      })
      .returning()
      .get();
    expect(row.id).toBe("u_pg_adapter");
  });
});
