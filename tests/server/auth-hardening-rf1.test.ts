import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-auth-hardening-rf1-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;
process.env.GAME_BCRYPT_COST = "4";

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const {
  BCRYPT_COST_NEW,
  MIN_PASSWORD_LENGTH,
  loginUser,
  registerUser,
  revokeSession,
  userIdFromToken,
} = await import("../../apps/server/src/auth/auth.ts");
const {
  AUTH_RATE_LIMIT,
  consumeRateLimit,
  resetRateLimitBuckets,
} = await import("../../apps/server/src/auth/rateLimit.ts");
const { sessions } = await import("../../apps/server/src/db/schema.ts");

describe("auth hardening RF1.2–RF1.5", () => {
  beforeAll(() => {
    migrateSqlite();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("revokes a session so the token stops working (RF1.2 happy)", () => {
    const stamp = Date.now().toString(16);
    const reg = registerUser(`out_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    const token = reg.token!;
    expect(userIdFromToken(token)).toBeTruthy();
    expect(revokeSession(token)).toBe(true);
    expect(userIdFromToken(token)).toBeNull();
    const row = db.select().from(sessions).where(eq(sessions.token, token)).get();
    expect(row).toBeUndefined();
  });

  it("revoke of missing token is false (RF1.2 fail)", () => {
    expect(revokeSession(undefined)).toBe(false);
    expect(revokeSession("not-a-real-token")).toBe(false);
  });

  it("rate limit blocks after AUTH_RATE_LIMIT (RF1.3)", () => {
    resetRateLimitBuckets();
    const key = `test:auth:${Date.now()}`;
    for (let i = 0; i < AUTH_RATE_LIMIT; i++) {
      expect(consumeRateLimit(key, AUTH_RATE_LIMIT, 60_000, 1_000)).toBe(true);
    }
    expect(consumeRateLimit(key, AUTH_RATE_LIMIT, 60_000, 1_000)).toBe(false);
    // Reason: new window resets the bucket.
    expect(consumeRateLimit(key, AUTH_RATE_LIMIT, 60_000, 70_000)).toBe(true);
  });

  it("rejects short passwords and hashes new users at BCRYPT_COST_NEW (RF1.4)", () => {
    const stamp = Date.now().toString(16);
    const short = registerUser(`short_${stamp}`, "1234567");
    expect(short.ok).toBe(false);
    expect(MIN_PASSWORD_LENGTH).toBe(8);
    expect(BCRYPT_COST_NEW).toBe(10);
    const ok = registerUser(`okpw_${stamp}`, "12345678");
    expect(ok.ok).toBe(true);
    const login = loginUser(`okpw_${stamp}`, "12345678");
    expect(login.ok).toBe(true);
  });

  it("rejects a wrong password with a generic error (SEC-8 happy fail)", () => {
    const stamp = Date.now().toString(16);
    const name = `wrong_${stamp}`;
    expect(registerUser(name, "password123").ok).toBe(true);
    const bad = loginUser(name, "password124");
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBe("Invalid credentials");
  });

  it("rejects an unknown username with the same generic error (SEC-8 edge)", () => {
    const missing = loginUser(`nobody_${Date.now().toString(16)}`, "password123");
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error).toBe("Invalid credentials");
  });

  it("rejects a taken username and a short username (SEC-8 failure)", () => {
    const stamp = Date.now().toString(16);
    const name = `taken_${stamp}`;
    expect(registerUser(name, "password123").ok).toBe(true);
    const again = registerUser(name, "password123");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe("Username taken");
    const tiny = registerUser("ab", "password123");
    expect(tiny.ok).toBe(false);
    if (!tiny.ok) expect(tiny.error).toBe("Username too short");
  });

  it("chat flood bucket shares limit (RF1.5 edge)", () => {
    resetRateLimitBuckets();
    const key = `chat:user_${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      expect(consumeRateLimit(key, 5, 10_000, 5_000)).toBe(true);
    }
    expect(consumeRateLimit(key, 5, 10_000, 5_000)).toBe(false);
  });
});
