import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, isCityLandKind } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl601-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { gatherWood } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { isCityStationContendedByOther } = await import(
  "../../apps/server/src/game/stationContention.ts"
);
const {
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

/**
 * CL60.1 — City scarce tree chop soft contention.
 * Choice: extend presence lock to gatherWood (parity with craft) over inventing caps.
 */
describe("CityLands CL60.1 city scarce tree chop contention assert", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl601a_${stamp}`;
    bobName = `cl601b_${stamp}`;
    const a = registerUser(aliceName, "password123");
    const b = registerUser(bobName, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    aliceId = userIdFromToken(a.token)!;
    bobId = userIdFromToken(b.token)!;
    expect(travelToLandKind(aliceId, "city").ok).toBe(true);
    expect(travelToLandKind(bobId, "city").ok).toBe(true);
    cityLandId = getPlayerState(aliceId)!.landId;
    expect(getPlayerState(bobId)!.landId).toBe(cityLandId);
    expect(isCityLandKind(getPlayerState(aliceId)!.landKind)).toBe(true);
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

  it("second chopper at scarce city stump gets wait refuse (contention)", () => {
    const city = getPlayerState(aliceId)!;
    const stump = city.buildings.find((b) => b.type === "tree_stump");
    expect(stump).toBeTruthy();
    if (!stump) return;

    const pos = buildingPos(stump);
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: cityLandId,
      x: pos.x,
      z: pos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        stump.x,
        stump.z,
        bobId,
      ),
    ).toBe(true);

    const blocked = gatherWood(bobId, stump.id, pos);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toBe(ACTION_ERROR.stationBusy);
      expect(blocked.error).toMatch(/wait/i);
    }
  });

  it("alone at city stump chops OK; land unlimited ignores peer presence (edge)", () => {
    const city = getPlayerState(aliceId)!;
    const stump = city.buildings.find((b) => b.type === "tree_stump")!;
    const pos = buildingPos(stump);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.userId, aliceId))
      .run();
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        stump.x,
        stump.z,
        aliceId,
      ),
    ).toBe(false);
    expect(gatherWood(aliceId, stump.id, pos).ok).toBe(true);

    expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    const home = getPlayerState(aliceId)!;
    db.update(players)
      .set({ softCurrency: 100, energy: 100 })
      .where(eq(players.userId, aliceId))
      .run();
    addItem(home.playerId, "wood", 1);
    expect(placeLandStation(aliceId, "tree_stump", boardPos(home)).ok).toBe(
      true,
    );
    const landStump = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "tree_stump",
    )!;
    const landPos = buildingPos(landStump);

    reportPresence({
      userId: bobId,
      username: bobName,
      landId: getPlayerState(aliceId)!.landId,
      x: landPos.x,
      z: landPos.z,
    });
    expect(
      isCityStationContendedByOther(
        "player_land",
        getPlayerState(aliceId)!.landId,
        landStump.x,
        landStump.z,
        aliceId,
      ),
    ).toBe(false);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.userId, aliceId))
      .run();
    expect(gatherWood(aliceId, landStump.id, landPos).ok).toBe(true);
  });
});
