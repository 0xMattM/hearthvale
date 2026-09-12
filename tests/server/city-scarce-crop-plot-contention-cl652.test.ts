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
  `game-cl652-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { plantCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
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
 * CL65.2 — City scarce crop_plot plant soft contention.
 * Choice: extend presence lock into plantCrop (was craft/gather-only); land unlimited.
 */
describe("CityLands CL65.2 city scarce crop_plot plant contention assert", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl652a_${stamp}`;
    bobName = `cl652b_${stamp}`;
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

  it("second planter at scarce city crop_plot gets wait refuse (contention)", () => {
    const city = getPlayerState(aliceId)!;
    const plot = city.buildings.find((b) => b.type === "crop_plot");
    expect(plot).toBeTruthy();
    if (!plot) return;

    const pos = buildingPos(plot);
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
        plot.x,
        plot.z,
        bobId,
      ),
    ).toBe(true);

    const bob = db.select().from(players).where(eq(players.userId, bobId)).get()!;
    addItem(bob.id, "wheat_seed", 1);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.userId, bobId))
      .run();

    const blocked = plantCrop(bobId, plot.id, "wheat_seed", pos);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toBe(ACTION_ERROR.stationBusy);
      expect(blocked.error).toMatch(/wait/i);
    }
  });

  it("alone at city plot plants OK; land unlimited ignores peer presence (edge)", () => {
    const city = getPlayerState(aliceId)!;
    const emptyPlot = city.buildings.find(
      (b) => b.type === "crop_plot" && !b.cropId,
    );
    expect(emptyPlot).toBeTruthy();
    if (!emptyPlot) return;
    const pos = buildingPos(emptyPlot);

    const alice = db
      .select()
      .from(players)
      .where(eq(players.userId, aliceId))
      .get()!;
    addItem(alice.id, "wheat_seed", 1);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.userId, aliceId))
      .run();
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        emptyPlot.x,
        emptyPlot.z,
        aliceId,
      ),
    ).toBe(false);
    expect(plantCrop(aliceId, emptyPlot.id, "wheat_seed", pos).ok).toBe(true);

    expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    const home = getPlayerState(aliceId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.userId, aliceId))
      .run();
    addItem(home.playerId, "wood", 4);
    if (!home.buildings.some((b) => b.type === "crop_plot")) {
      expect(placeLandStation(aliceId, "crop_plot", boardPos(home)).ok).toBe(
        true,
      );
    }
    const landPlot = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "crop_plot" && !b.cropId,
    )!;
    const landPos = buildingPos(landPlot);
    addItem(getPlayerState(aliceId)!.playerId, "wheat_seed", 1);

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
        landPlot.x,
        landPlot.z,
        aliceId,
      ),
    ).toBe(false);
    expect(plantCrop(aliceId, landPlot.id, "wheat_seed", landPos).ok).toBe(
      true,
    );
  });
});
