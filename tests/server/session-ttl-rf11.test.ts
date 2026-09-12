import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-session-ttl-rf11-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;
process.env.GAME_BCRYPT_COST = "4";

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const {
  DEFAULT_SESSION_TTL_MS,
  isSessionExpired,
  registerUser,
  resolveSessionTtlMs,
  sessionExpiresAt,
  userIdFromToken,
} = await import("../../apps/server/src/auth/auth.ts");
const { sessions } = await import("../../apps/server/src/db/schema.ts");

describe("session TTL RF1.1", () => {
  let token = "";
  let createdAt = 0;

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `ttl_${Date.now().toString(16)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok || !reg.token) throw new Error("register failed");
    token = reg.token;
    const row = db.select().from(sessions).where(eq(sessions.token, token)).get();
    expect(row).toBeTruthy();
    createdAt = row!.createdAt;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("resolves a fresh session (happy)", () => {
    const userId = userIdFromToken(token, createdAt + 1_000);
    expect(userId).toBeTruthy();
    expect(typeof userId).toBe("string");
  });

  it("rejects an expired session and deletes the row (fail)", () => {
    const ttl = resolveSessionTtlMs();
    const pastExpiry = sessionExpiresAt(createdAt, ttl);
    const userId = userIdFromToken(token, pastExpiry);
    expect(userId).toBeNull();
    const row = db.select().from(sessions).where(eq(sessions.token, token)).get();
    expect(row).toBeUndefined();
  });

  it("treats missing token as null (edge)", () => {
    expect(userIdFromToken(undefined)).toBeNull();
    expect(userIdFromToken("")).toBeNull();
  });

  it("defaults TTL to 7 days and honors GAME_SESSION_TTL_MS", () => {
    expect(DEFAULT_SESSION_TTL_MS).toBe(7 * 24 * 60 * 60 * 1000);
    expect(resolveSessionTtlMs({})).toBe(DEFAULT_SESSION_TTL_MS);
    expect(resolveSessionTtlMs({ GAME_SESSION_TTL_MS: "3600000" })).toBe(
      3_600_000,
    );
    // Reason: invalid override must not shrink TTL to zero.
    expect(resolveSessionTtlMs({ GAME_SESSION_TTL_MS: "0" })).toBe(
      DEFAULT_SESSION_TTL_MS,
    );
    expect(isSessionExpired(100, 100 + DEFAULT_SESSION_TTL_MS)).toBe(true);
    expect(isSessionExpired(100, 100 + DEFAULT_SESSION_TTL_MS - 1)).toBe(false);
  });
});
