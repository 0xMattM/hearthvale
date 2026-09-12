import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CITY_BUILDINGS,
  CITY_PRACTICE_STATIONS,
  SEEDED_CITY_TUTORIAL_NPCS,
  WORLD,
  cityPracticeStationsFor,
  isProductionBuildingType,
  type BuildingType,
  type EconomyProfessionId,
} from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl82-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
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

/** CL8.1 tutors that CL8.2 must equip with scarce city stations. */
const CL81_BATCH: readonly EconomyProfessionId[] = [
  "miner",
  "blacksmith",
  "cook",
];

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function cityHasType(type: BuildingType): boolean {
  return CITY_BUILDINGS.some((b) => b.type === type);
}

describe("CityLands CL8.2 scarce stations for new tutors", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl82_${Date.now().toString(36)}`, "password123");
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

  it("maps each new tutor to ≥1 scarce city station and crafts there (happy)", () => {
    for (const id of CL81_BATCH) {
      expect(SEEDED_CITY_TUTORIAL_NPCS).toContain(id);
      const stations = cityPracticeStationsFor(id);
      expect(stations.length).toBeGreaterThanOrEqual(1);
      expect(CITY_PRACTICE_STATIONS[id]).toEqual(stations);
      for (const type of stations) {
        expect(cityHasType(type)).toBe(true);
      }
    }

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.buildings.some((b) => b.type === "ore_node")).toBe(true);
    expect(state.buildings.filter((b) => b.type === "forge")).toHaveLength(1);
    expect(state.buildings.filter((b) => b.type === "kitchen")).toHaveLength(1);

    const pid = state.playerId;
    addItem(pid, "iron_ore", 2);
    const forge = state.buildings.find((b) => b.type === "forge")!;
    expect(craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge)).ok).toBe(
      true,
    );

    addItem(pid, "flour", 2);
    const kitchen = state.buildings.find((b) => b.type === "kitchen")!;
    expect(craftRecipeComplete(userId, "bake_bread", buildingPos(kitchen)).ok).toBe(
      true,
    );
  });

  it("keeps city stations scarce (no homestead-style refill) (edge)", () => {
    const oreCount = CITY_BUILDINGS.filter((b) => b.type === "ore_node").length;
    const forgeCount = CITY_BUILDINGS.filter((b) => b.type === "forge").length;
    const kitchenCount = CITY_BUILDINGS.filter(
      (b) => b.type === "kitchen",
    ).length;
    expect(oreCount).toBeLessThanOrEqual(3);
    expect(forgeCount).toBe(1);
    expect(kitchenCount).toBe(1);

    // Re-load state / backfill must not multiply scarce stations
    const again = getPlayerState(userId)!;
    expect(again.landKind).toBe("city");
    expect(again.buildings.filter((b) => b.type === "forge")).toHaveLength(1);
    expect(again.buildings.filter((b) => b.type === "kitchen")).toHaveLength(1);
    expect(again.buildings.filter((b) => b.type === "ore_node").length).toBe(
      oreCount,
    );
  });

  it("rejects placing production stations on the city map (failure)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    expect(isProductionBuildingType("forge")).toBe(true);
    const result = placeLandStation(userId, "forge", { x: 6, z: 6 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }
  });
});
