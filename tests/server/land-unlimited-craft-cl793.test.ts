import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl793-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem, removeItem } = await import(
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
 * CL79.3 — Land unlimited craft (no stationBusy) still green.
 * Choice: assert-only peer on player_land does not block (parity with CL52.3 land edge; no invent caps).
 */
describe("CityLands CL79.3 land unlimited craft (no stationBusy) still green", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let landId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl793a_${stamp}`;
    bobName = `cl793b_${stamp}`;
    const a = registerUser(aliceName, "password123");
    const b = registerUser(bobName, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    aliceId = userIdFromToken(a.token)!;
    bobId = userIdFromToken(b.token)!;
    // New accounts spawn on player_land — only travel if not already home.
    if (getPlayerState(aliceId)!.landKind !== "player_land") {
      expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    }
    landId = getPlayerState(aliceId)!.landId;
    expect(getPlayerState(aliceId)!.landKind).toBe("player_land");

    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.userId, aliceId))
      .run();
    const home = getPlayerState(aliceId)!;
    addItem(home.playerId, "wood", 16);
    addItem(home.playerId, "plank", 4);
    addItem(home.playerId, "iron_ore", 2);
    if (!home.buildings.some((b) => b.type === "kitchen")) {
      expect(placeLandStation(aliceId, "kitchen", boardPos(home)).ok).toBe(
        true,
      );
    }
    if (!getPlayerState(aliceId)!.buildings.some((b) => b.type === "workshop")) {
      expect(
        placeLandStation(
          aliceId,
          "workshop",
          boardPos(getPlayerState(aliceId)!),
        ).ok,
      ).toBe(true);
    }
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

  it("peer nearby on player_land kitchen and workshop does not block craft (happy)", () => {
    const home = getPlayerState(aliceId)!;
    const kitchen = home.buildings.find((b) => b.type === "kitchen")!;
    const workshop = home.buildings.find((b) => b.type === "workshop")!;
    expect(kitchen).toBeTruthy();
    expect(workshop).toBeTruthy();

    const kitchenPos = buildingPos(kitchen);
    reportPresence({
      userId: bobId,
      username: bobName,
      landId,
      x: kitchenPos.x,
      z: kitchenPos.z,
    });
    expect(
      isCityStationContendedByOther(
        "player_land",
        landId,
        kitchen.x,
        kitchen.z,
        aliceId,
      ),
    ).toBe(false);

    addItem(home.playerId, "fish", 1);
    expect(getRecipe("cook_fish")!.station).toBe("kitchen");
    expect(craftRecipe(aliceId, "cook_fish", kitchenPos).ok).toBe(true);

    resetPresence();
    const workshopPos = buildingPos(workshop);
    reportPresence({
      userId: bobId,
      username: bobName,
      landId,
      x: workshopPos.x,
      z: workshopPos.z,
    });
    expect(
      isCityStationContendedByOther(
        "player_land",
        landId,
        workshop.x,
        workshop.z,
        aliceId,
      ),
    ).toBe(false);
    addItem(getPlayerState(aliceId)!.playerId, "wood", 2);
    expect(getRecipe("saw_planks")!.station).toBe("workshop");
    expect(craftRecipe(aliceId, "saw_planks", workshopPos).ok).toBe(true);
  });

  it("city craft allows peer presence; land presence still unlimited (edge)", () => {
    expect(travelToLandKind(aliceId, "city").ok).toBe(true);
    expect(travelToLandKind(bobId, "city").ok).toBe(true);
    const cityLandId = getPlayerState(aliceId)!.landId;
    const kitchen = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    const pos = buildingPos(kitchen);
    reportPresence({
      userId: bobId,
      username: bobName,
      landId: cityLandId,
      x: pos.x,
      z: pos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        kitchen.x,
        kitchen.z,
        aliceId,
      ),
    ).toBe(true);
    const alice = db
      .select()
      .from(players)
      .where(eq(players.userId, aliceId))
      .get()!;
    addItem(alice.id, "fish", 1);
    const blocked = craftRecipe(aliceId, "cook_fish", pos);
    expect(blocked.ok).toBe(true);

    resetPresence();
    expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    const landKitchen = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    const landPos = buildingPos(landKitchen);
    reportPresence({
      userId: bobId,
      username: bobName,
      landId: getPlayerState(aliceId)!.landId,
      x: landPos.x,
      z: landPos.z,
    });
    addItem(getPlayerState(aliceId)!.playerId, "fish", 1);
    expect(craftRecipe(aliceId, "cook_fish", landPos).ok).toBe(true);
  });

  it("refuses when craft mats missing even with peer ignored (failure)", () => {
    if (getPlayerState(aliceId)!.landKind !== "player_land") {
      expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    }
    const workshop = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "workshop",
    )!;
    const pos = buildingPos(workshop);
    reportPresence({
      userId: bobId,
      username: bobName,
      landId: getPlayerState(aliceId)!.landId,
      x: pos.x,
      z: pos.z,
    });
    // Drain wood so saw_planks cannot run — peer must not be the refuse reason.
    const state = getPlayerState(aliceId)!;
    const woodQty = state.inventory
      .filter((i) => i.itemId === "wood")
      .reduce((sum, i) => sum + i.qty, 0);
    if (woodQty > 0) removeItem(state.playerId, "wood", woodQty);
    const refused = craftRecipe(aliceId, "saw_planks", pos);
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe(ACTION_ERROR.missingMaterials);
      expect(refused.error).not.toBe(ACTION_ERROR.stationBusy);
    }
  });
});
