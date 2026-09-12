import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-pres-land-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);
process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind } = await import("../../apps/server/src/game/land.ts");
const { getPlayerState } = await import("../../apps/server/src/game/player.ts");
const {
  activeLandIdForUser,
  getPresence,
  reportPresenceOnActiveLand,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");

describe("presence active land SEC-6", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`pl_${Date.now().toString(36)}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
  });

  afterEach(() => {
    resetPresence();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("writes presence onto the homestead (happy)", () => {
    const landId = getPlayerState(userId)!.landId;
    expect(activeLandIdForUser(userId)).toBe(landId);
    const res = reportPresenceOnActiveLand({
      userId,
      username: "alice",
      x: 1,
      z: 2,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.landId).toBe(landId);
    expect(getPresence(userId)?.landId).toBe(landId);
  });

  it("follows travel to city, ignoring a client-claimed other land (edge)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const cityId = getPlayerState(userId)!.landId;
    expect(cityId).not.toBeFalsy();
    const res = reportPresenceOnActiveLand({
      userId,
      username: "alice",
      x: 4,
      z: 5,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.landId).toBe(cityId);
    expect(getPresence(userId)?.landId).toBe(cityId);
  });

  it("rejects a missing player (failure)", () => {
    const res = reportPresenceOnActiveLand({
      userId: "no-such-user",
      username: "ghost",
      x: 0,
      z: 0,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe(ACTION_ERROR.playerMissing);
  });
});
