import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl732-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getVisitLand } = await import("../../apps/server/src/game/visit.ts");
const { getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const {
  arePlayersNearbyForTrade,
  TRADE_PING_RANGE,
} = await import("../../apps/server/src/game/tradeInvite.ts");
const {
  listPresenceOnLand,
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");

/**
 * CL73.2 — Visit presence + nearby trade still green.
 * Choice: assert-only visit host presence + trade ping (parity with CL66.1; no social invent).
 */
describe("CityLands CL73.2 visit presence + nearby trade still green", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let bobLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl732a_${stamp}`;
    bobName = `cl732b_${stamp}`;
    const a = registerUser(aliceName, "password123");
    const b = registerUser(bobName, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    aliceId = userIdFromToken(a.token)!;
    bobId = userIdFromToken(b.token)!;

    const bobHome = travelToLandKind(bobId, "player_land");
    if (!bobHome.ok) {
      expect(bobHome.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    bobLandId = getPlayerState(bobId)!.landId;
    expect(getPlayerState(bobId)!.landKind).toBe("player_land");
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

  it("visits other land with presence then nearby trade invite ping (happy)", () => {
    const visit = getVisitLand(aliceId, bobName);
    expect(visit.ok).toBe(true);
    if (!visit.ok) return;
    expect(visit.land.landId).toBe(bobLandId);
    expect(visit.land.ownerUsername).toBe(bobName);
    expect(visit.land.landKind).toBe("player_land");

    reportPresence({
      userId: bobId,
      username: bobName,
      landId: bobLandId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: bobLandId,
      x: TRADE_PING_RANGE / 2,
      z: 0,
    });

    const onBobLand = listPresenceOnLand(bobLandId, bobId);
    expect(onBobLand.some((p) => p.username === aliceName)).toBe(true);
    expect(arePlayersNearbyForTrade(aliceId, bobId)).toBe(true);
  });

  it("refuses own-visit and far trade ping (failure)", () => {
    const own = getVisitLand(aliceId, aliceName);
    expect(own.ok).toBe(false);
    if (!own.ok) {
      expect(own.error).toContain("own land");
    }

    const aliceHome = getPlayerState(aliceId)!;
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: aliceHome.landId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: bobId,
      username: bobName,
      landId: bobLandId,
      x: 0,
      z: 0,
    });
    expect(aliceHome.landId).not.toBe(bobLandId);
    expect(arePlayersNearbyForTrade(aliceId, bobId)).toBe(false);
  });
});
