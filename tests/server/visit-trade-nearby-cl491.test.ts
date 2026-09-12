import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl491-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");

describe("CityLands CL49.1 visit land + trade invite nearby smoke", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let bobLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl491a_${stamp}`;
    bobName = `cl491b_${stamp}`;
    const a = registerUser(aliceName, "password123");
    const b = registerUser(bobName, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    aliceId = userIdFromToken(a.token)!;
    bobId = userIdFromToken(b.token)!;
    // Reason: visit targets owner's active land — keep Bob on empty player_land (CL3.1).
    const travelHome = travelToLandKind(bobId, "player_land");
    if (!travelHome.ok) {
      expect(travelHome.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const bob = getPlayerState(bobId)!;
    expect(bob.landKind).toBe("player_land");
    bobLandId = bob.landId;
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

  it("visits other player land then trade-pings when nearby (happy)", () => {
    const visit = getVisitLand(aliceId, bobName);
    expect(visit.ok).toBe(true);
    if (!visit.ok) return;
    expect(visit.land.ownerUsername).toBe(bobName);
    expect(visit.land.landKind).toBe("player_land");
    expect(visit.land.landId).toBe(bobLandId);
    // Reason: CityLands empty homestead — visit works without seeded production.
    expect(Array.isArray(visit.land.buildings)).toBe(true);

    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: bobLandId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: bobId,
      username: bobName,
      landId: bobLandId,
      x: TRADE_PING_RANGE / 2,
      z: 0,
    });
    expect(arePlayersNearbyForTrade(aliceId, bobId)).toBe(true);
  });

  it("skips trade invite on different lands (edge)", () => {
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

  it("refuses visit own land and too-far trade ping (failure)", () => {
    const own = getVisitLand(aliceId, aliceName);
    expect(own.ok).toBe(false);
    if (!own.ok) {
      expect(own.error).toContain("own land");
    }

    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: bobLandId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: bobId,
      username: bobName,
      landId: bobLandId,
      x: TRADE_PING_RANGE + WORLD.GRID,
      z: 0,
    });
    expect(arePlayersNearbyForTrade(aliceId, bobId)).toBe(false);
  });
});
