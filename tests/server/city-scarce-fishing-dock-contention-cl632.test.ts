import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  isCityLandKind,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl632-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherFish } = await import(
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
 * CL63.2 — City scarce fishing_dock soft contention.
 * Choice: extend CL52.3/CL60 presence lock into gatherFish (dock was missing).
 */
describe("CityLands CL63.2 city scarce fishing_dock contention assert", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl632a_${stamp}`;
    bobName = `cl632b_${stamp}`;
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

  it("second fisher at scarce city dock gets wait refuse (contention)", () => {
    const city = getPlayerState(aliceId)!;
    const dock = city.buildings.find((b) => b.type === "fishing_dock");
    expect(dock).toBeTruthy();
    if (!dock) return;

    const pos = buildingPos(dock);
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
        dock.x,
        dock.z,
        bobId,
      ),
    ).toBe(true);

    const blocked = gatherFish(bobId, dock.id, pos);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toBe(ACTION_ERROR.stationBusy);
      expect(blocked.error).toMatch(/wait/i);
    }
  });

  it("alone at city dock catches OK; land unlimited ignores peer presence (edge)", () => {
    const city = getPlayerState(aliceId)!;
    const dock = city.buildings.find((b) => b.type === "fishing_dock")!;
    const pos = buildingPos(dock);

    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        dock.x,
        dock.z,
        aliceId,
      ),
    ).toBe(false);
    expect(gatherFish(aliceId, dock.id, pos).ok).toBe(true);

    expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    const home = getPlayerState(aliceId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.userId, aliceId))
      .run();
    addItem(home.playerId, "wood", 3);
    addItem(home.playerId, "plank", 1);
    expect(placeLandStation(aliceId, "fishing_dock", boardPos(home)).ok).toBe(
      true,
    );
    const landDock = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "fishing_dock",
    )!;
    const landPos = buildingPos(landDock);

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
        landDock.x,
        landDock.z,
        aliceId,
      ),
    ).toBe(false);
    expect(gatherFish(aliceId, landDock.id, landPos).ok).toBe(true);
  });
});
