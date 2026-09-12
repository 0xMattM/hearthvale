import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl522-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
  listPresenceOnLand,
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");

describe("CityLands CL52.2 visit land presence + leave smoke", () => {
  let aliceId = "";
  let aliceName = "";
  let aliceHomeId = "";
  let bobId = "";
  let bobName = "";
  let bobLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl522a_${stamp}`;
    bobName = `cl522b_${stamp}`;
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

    const aliceHome = travelToLandKind(aliceId, "player_land");
    if (!aliceHome.ok) {
      expect(aliceHome.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    aliceHomeId = getPlayerState(aliceId)!.landId;
    expect(aliceHomeId).not.toBe(bobLandId);
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

  it("visits other land with presence visible, then leave/return home clean (happy)", () => {
    const visit = getVisitLand(aliceId, bobName);
    expect(visit.ok).toBe(true);
    if (!visit.ok) return;
    expect(visit.land.landId).toBe(bobLandId);
    expect(visit.land.ownerUsername).toBe(bobName);
    expect(visit.land.landKind).toBe("player_land");

    // Reason: visit overlay uses host landId for presence — Alice appears to Bob.
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
      x: 2,
      z: 0,
    });

    const onBobLand = listPresenceOnLand(bobLandId, bobId);
    expect(onBobLand.some((p) => p.username === aliceName)).toBe(true);
    expect(onBobLand.find((p) => p.username === aliceName)?.x).toBe(2);

    // Leave visit: presence returns to visitor home; host land clears visitor.
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: aliceHomeId,
      x: 0,
      z: 0,
    });
    expect(
      listPresenceOnLand(bobLandId, bobId).some((p) => p.username === aliceName),
    ).toBe(false);

    const homePeers = listPresenceOnLand(aliceHomeId, bobId);
    expect(homePeers.some((p) => p.username === aliceName)).toBe(true);

    // Return home travel stays clean (already on player_land or already-here).
    const ret = travelToLandKind(aliceId, "player_land");
    if (!ret.ok) {
      expect(ret.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    expect(getPlayerState(aliceId)!.landId).toBe(aliceHomeId);
    expect(getPlayerState(aliceId)!.landKind).toBe("player_land");
  });

  it("refuses visit own land; presence stays off host after leave (failure)", () => {
    const own = getVisitLand(aliceId, aliceName);
    expect(own.ok).toBe(false);
    if (!own.ok) {
      expect(own.error).toContain("own land");
    }

    const missing = getVisitLand(aliceId, "nobody_cl522_xyz");
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.error).toBe(ACTION_ERROR.tradePlayerMissing);
    }

    reportPresence({
      userId: bobId,
      username: bobName,
      landId: bobLandId,
      x: 0,
      z: 0,
    });
    // Alice never reported on Bob's land after leave — still absent.
    expect(listPresenceOnLand(bobLandId, bobId)).toHaveLength(0);
  });
});
