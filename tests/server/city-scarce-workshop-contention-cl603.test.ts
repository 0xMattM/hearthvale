import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  WORLD,
  getRecipe,
  isCityLandKind,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl603-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
 * CL60.3 — City scarce workshop soft contention.
 * Choice: assert-only craft lock (already CL52.3) at workshop; loom left optional.
 */
describe("CityLands CL60.3 city scarce workshop contention assert", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl603a_${stamp}`;
    bobName = `cl603b_${stamp}`;
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

  it("peer presence does not block city craft start (wait/collect override)", () => {
    const city = getPlayerState(aliceId)!;
    const workshop = city.buildings.find((b) => b.type === "workshop");
    expect(workshop).toBeTruthy();
    if (!workshop) return;

    const pos = buildingPos(workshop);
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
        workshop.x,
        workshop.z,
        bobId,
      ),
    ).toBe(true);

    const bob = db.select().from(players).where(eq(players.userId, bobId)).get()!;
    addItem(bob.id, "wood", 2);
    expect(getRecipe("saw_planks")!.station).toBe("workshop");

    const blocked = craftRecipe(bobId, "saw_planks", pos);
    expect(blocked.ok).toBe(true);
  });

  it("alone at city workshop crafts OK; land unlimited ignores peer presence (edge)", () => {
    const city = getPlayerState(aliceId)!;
    const workshop = city.buildings.find((b) => b.type === "workshop")!;
    const pos = buildingPos(workshop);

    const alice = db
      .select()
      .from(players)
      .where(eq(players.userId, aliceId))
      .get()!;
    addItem(alice.id, "wood", 2);
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        workshop.x,
        workshop.z,
        aliceId,
      ),
    ).toBe(false);
    expect(craftRecipe(aliceId, "saw_planks", pos).ok).toBe(true);

    expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    const home = getPlayerState(aliceId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.userId, aliceId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "plank", 2);
    expect(placeLandStation(aliceId, "workshop", boardPos(home)).ok).toBe(true);
    const landShop = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "workshop",
    )!;
    const landPos = buildingPos(landShop);
    addItem(getPlayerState(aliceId)!.playerId, "wood", 2);

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
        landShop.x,
        landShop.z,
        aliceId,
      ),
    ).toBe(false);
    expect(craftRecipe(aliceId, "saw_planks", landPos).ok).toBe(true);
  });
});
