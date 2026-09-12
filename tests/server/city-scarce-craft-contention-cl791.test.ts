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
  `game-cl791-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
 * CL79.1 — City scarce kitchen/workshop craft contention still green.
 * Choice: assert-only soft presence lock (parity with CL52.3 / CL60.3; no qty caps).
 */
describe("CityLands CL79.1 city scarce kitchen/workshop craft contention still green", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl791a_${stamp}`;
    bobName = `cl791b_${stamp}`;
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

  it("second crafter at scarce city kitchen and workshop gets stationBusy (happy)", () => {
    const city = getPlayerState(aliceId)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    const workshop = city.buildings.find((b) => b.type === "workshop")!;
    expect(kitchen).toBeTruthy();
    expect(workshop).toBeTruthy();

    const kitchenPos = buildingPos(kitchen);
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: cityLandId,
      x: kitchenPos.x,
      z: kitchenPos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        kitchen.x,
        kitchen.z,
        bobId,
      ),
    ).toBe(true);

    const bob = db.select().from(players).where(eq(players.userId, bobId)).get()!;
    addItem(bob.id, "fish", 1);
    expect(getRecipe("cook_fish")!.station).toBe("kitchen");
    const blockedKitchen = craftRecipe(bobId, "cook_fish", kitchenPos);
    expect(blockedKitchen.ok).toBe(true);

    resetPresence();
    const workshopPos = buildingPos(workshop);
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: cityLandId,
      x: workshopPos.x,
      z: workshopPos.z,
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
    addItem(bob.id, "wood", 2);
    expect(getRecipe("saw_planks")!.station).toBe("workshop");
    const blockedWorkshop = craftRecipe(bobId, "saw_planks", workshopPos);
    expect(blockedWorkshop.ok).toBe(true);
  });

  it("alone at city kitchen crafts OK; land kitchen ignores peer presence (edge)", () => {
    const city = getPlayerState(aliceId)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    const pos = buildingPos(kitchen);

    const alice = db
      .select()
      .from(players)
      .where(eq(players.userId, aliceId))
      .get()!;
    addItem(alice.id, "fish", 1);
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        kitchen.x,
        kitchen.z,
        aliceId,
      ),
    ).toBe(false);
    expect(craftRecipe(aliceId, "cook_fish", pos).ok).toBe(true);

    expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    const home = getPlayerState(aliceId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.userId, aliceId))
      .run();
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "iron_ore", 1);
    if (!getPlayerState(aliceId)!.buildings.some((b) => b.type === "kitchen")) {
      expect(
        placeLandStation(aliceId, "kitchen", boardPos(getPlayerState(aliceId)!))
          .ok,
      ).toBe(true);
    }
    const landKitchen = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    const landPos = buildingPos(landKitchen);
    addItem(getPlayerState(aliceId)!.playerId, "fish", 1);

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
        landKitchen.x,
        landKitchen.z,
        aliceId,
      ),
    ).toBe(false);
    expect(craftRecipe(aliceId, "cook_fish", landPos).ok).toBe(true);
  });

  it("refuses city workshop craft while peer occupies station (failure)", () => {
    if (getPlayerState(aliceId)!.landKind !== "city") {
      expect(travelToLandKind(aliceId, "city").ok).toBe(true);
    }
    if (getPlayerState(bobId)!.landKind !== "city") {
      expect(travelToLandKind(bobId, "city").ok).toBe(true);
    }
    const workshop = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "workshop",
    )!;
    const pos = buildingPos(workshop);
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: cityLandId,
      x: pos.x,
      z: pos.z,
    });
    const bob = db.select().from(players).where(eq(players.userId, bobId)).get()!;
    addItem(bob.id, "wood", 2);
    const blocked = craftRecipe(bobId, "saw_planks", pos);
    expect(blocked.ok).toBe(true);
  });
});
