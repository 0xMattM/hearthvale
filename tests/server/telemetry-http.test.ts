import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const dbFile = path.join(
  os.tmpdir(),
  `game-tel-http-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);
process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser } = await import("../../apps/server/src/auth/auth.ts");
const { app } = await import("../../apps/server/src/app.ts");
const {
  telemetryHttpPayload,
  track,
  resetTelemetryCounts,
} = await import("../../apps/server/src/telemetry.ts");

describe("GET /telemetry HACK-3", () => {
  let token = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`tel_${Date.now().toString(36)}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    token = reg.token!;
    resetTelemetryCounts();
    track("plant");
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("omits counters for anonymous callers (happy)", async () => {
    const anonymous = telemetryHttpPayload(false);
    expect(anonymous).toEqual({ ok: true });
    expect("counts" in anonymous).toBe(false);

    const res = await app.request("/telemetry");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(body.counts).toBeUndefined();
  });

  it("includes snapshot counters for a valid session (edge)", async () => {
    const authed = telemetryHttpPayload(true);
    expect(authed.ok).toBe(true);
    expect(authed.counts.plant).toBe(1);

    const res = await app.request("/telemetry", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; counts?: { plant?: number } };
    expect(body.ok).toBe(true);
    expect(body.counts?.plant).toBe(1);
  });

  it("treats a garbage Bearer as anonymous (failure)", async () => {
    const res = await app.request("/telemetry", {
      headers: { Authorization: "Bearer not-a-session" },
    });
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(body.counts).toBeUndefined();
  });
});
