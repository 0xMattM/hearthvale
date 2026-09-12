import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  CITY_BUILDINGS,
  CITY_LAND,
  ENERGY,
  FOOD_RESTORE,
  PLAYER_LAND_STATIONS,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl282-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL28.2 Alchemist bench stub", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl282_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("seeds city bench and brews herbal tonic (happy)", () => {
    expect(CITY_BUILDINGS.filter((b) => b.type === "alchemy_bench")).toHaveLength(
      1,
    );
    expect(CITY_BUILDINGS.length).toBe(CITY_LAND.buildSlots);
    expect(PLAYER_LAND_STATIONS.alchemy_bench.kitItemId).toBe("alchemy_bench_kit");

    const recipe = getRecipe("brew_herbal_tonic")!;
    expect(recipe.station).toBe("alchemy_bench");
    expect(recipe.profession).toBe("alchemist");
    expect(recipe.output.itemId).toBe("herbal_tonic");
    expect(recipe.inputs).toEqual([
      { itemId: "wheat", qty: 2 },
      { itemId: "leather", qty: 1 },
    ]);
    expect(FOOD_RESTORE.herbal_tonic).toBe(ENERGY.herbalTonicRestore);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const benches = city.buildings.filter((b) => b.type === "alchemy_bench");
    expect(benches).toHaveLength(1);

    const alchemistBefore = city.alchemistXp;
    const cookBefore = city.cookXp;
    addItem(city.playerId, "wheat", 2);
    addItem(city.playerId, "leather", 1);
    expect(
      craftRecipeComplete(userId, "brew_herbal_tonic", buildingPos(benches[0]!)).ok,
    ).toBe(true);
    const after = getPlayerState(userId)!;
    expect(
      after.inventory.some((s) => s.itemId === "herbal_tonic" && s.qty >= 1),
    ).toBe(true);
    expect(after.alchemistXp).toBeGreaterThan(alchemistBefore);
    expect(after.cookXp).toBe(cookBefore);
  });

  it("keeps cook stew on kitchen (edge — distinct from brew)", () => {
    const stew = getRecipe("cook_stew")!;
    expect(stew.station).toBe("kitchen");
    expect(stew.profession).toBe("cook");
    expect(stew.output.itemId).toBe("stew");
    const brew = getRecipe("brew_herbal_tonic")!;
    expect(brew.station).not.toBe("kitchen");
    expect(brew.profession).toBe("alchemist");
    expect(brew.output.itemId).not.toBe("stew");
  });

  it("blocks city place; land place + craft OK; kitchen refuse brew (failure)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const city = getPlayerState(userId)!;
    const near = city.buildings[0]!;
    const cityPlace = placeLandStation(userId, "alchemy_bench", {
      x: WORLD.GRID * near.x,
      z: WORLD.GRID * near.z,
    });
    expect(cityPlace.ok).toBe(false);
    if (!cityPlace.ok) {
      expect(cityPlace.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }

    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    addItem(city.playerId, "wheat", 2);
    addItem(city.playerId, "leather", 1);
    const wrongStation = craftRecipeComplete(
      userId,
      "brew_herbal_tonic",
      buildingPos(kitchen),
    );
    expect(wrongStation.ok).toBe(false);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        // Reason: CL36.3 — alchemy_bench requires one prior land place worth of builder XP.
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "iron_ore", 2);
    const board = home.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
    expect(
      placeLandStation(userId, "alchemy_bench", buildingPos(board)).ok,
    ).toBe(true);
    const land = getPlayerState(userId)!;
    const bench = land.buildings.find((b) => b.type === "alchemy_bench")!;
    addItem(land.playerId, "wheat", 2);
    addItem(land.playerId, "leather", 1);
    expect(
      craftRecipeComplete(userId, "brew_herbal_tonic", buildingPos(bench)).ok,
    ).toBe(true);
  });
});
