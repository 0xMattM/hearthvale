import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  getRecipe,
  isCityLandKind,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl631-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipe } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
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
const { players, craftJobs } = await import("../../apps/server/src/db/schema.ts");

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
 * CL63.1 — City scarce loom soft contention.
 * Choice: assert-only craft lock (already CL52.3) at loom; land unlimited OK.
 */
describe("CityLands CL63.1 city scarce loom contention assert", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl631a_${stamp}`;
    bobName = `cl631b_${stamp}`;
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
    db.delete(craftJobs).run();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("second weaver at scarce city loom gets wait refuse (contention)", () => {
    const city = getPlayerState(aliceId)!;
    const loom = city.buildings.find((b) => b.type === "loom");
    expect(loom).toBeTruthy();
    if (!loom) return;

    const pos = buildingPos(loom);
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
        loom.x,
        loom.z,
        bobId,
      ),
    ).toBe(true);

    const bob = db.select().from(players).where(eq(players.userId, bobId)).get()!;
    addItem(bob.id, "leather", 2);
    expect(getRecipe("weave_cloth")!.station).toBe("loom");

    const blocked = craftRecipe(bobId, "weave_cloth", pos);
    expect(blocked.ok).toBe(true);
  });

  it("alone at city loom weaves OK; land unlimited ignores peer presence (edge)", () => {
    const city = getPlayerState(aliceId)!;
    const loom = city.buildings.find((b) => b.type === "loom")!;
    const pos = buildingPos(loom);

    const alice = db
      .select()
      .from(players)
      .where(eq(players.userId, aliceId))
      .get()!;
    addItem(alice.id, "leather", 2);
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        loom.x,
        loom.z,
        aliceId,
      ),
    ).toBe(false);
    expect(craftRecipe(aliceId, "weave_cloth", pos).ok).toBe(true);

    expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    const home = getPlayerState(aliceId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.userId, aliceId))
      .run();
    addItem(home.playerId, "wood", 3);
    addItem(home.playerId, "plank", 2);
    expect(placeLandStation(aliceId, "loom", boardPos(home)).ok).toBe(true);
    const landLoom = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "loom",
    )!;
    const landPos = buildingPos(landLoom);
    addItem(getPlayerState(aliceId)!.playerId, "leather", 2);

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
        landLoom.x,
        landLoom.z,
        aliceId,
      ),
    ).toBe(false);
    expect(craftRecipe(aliceId, "weave_cloth", landPos).ok).toBe(true);
  });
});
