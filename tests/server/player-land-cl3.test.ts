import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  PLAYER_LAND_BUILDINGS,
  PLAYER_LAND_STATIONS,
  WORLD,
  isNonProductionLandMarker,
  isProductionBuildingType,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl31-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState, addItem, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { placeLandStation, nextFreeBuildCell, expandLandSlot } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { plantCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function boardPos(state: { buildings: Array<{ type: string; x: number; z: number }> }) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

describe("CityLands CL3.1 empty player land + CL3.2 build stations", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl31_${Date.now().toString(36)}`,
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

  it("fresh land has no walk-up build board (happy)", () => {
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("player_land");
    expect(PLAYER_LAND_BUILDINGS).toHaveLength(0);
    expect(state.buildings.some((b) => b.type === "build_board")).toBe(false);
    for (const b of state.buildings) {
      expect(isProductionBuildingType(b.type)).toBe(false);
      expect(isNonProductionLandMarker(b.type)).toBe(true);
    }
    expect(state.buildings.some((b) => b.type === "mill")).toBe(false);
    expect(state.buildings.some((b) => b.type === "crop_plot")).toBe(false);
  });

  it("travel round-trip does not refill production (edge)", () => {
    const before = getPlayerState(userId)!;
    const prodBefore = before.buildings.filter((b) =>
      isProductionBuildingType(b.type),
    ).length;
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const after = getPlayerState(userId)!;
    const prodAfter = after.buildings.filter((b) =>
      isProductionBuildingType(b.type),
    ).length;
    expect(prodAfter).toBe(prodBefore);
    expect(after.buildings.some((b) => b.type === "build_board")).toBe(false);
    expect(after.buildings.some((b) => b.type === "forge")).toBe(false);
  });

  it("places ≥2 same station type and crafts on owned mill (happy CL3.2)", () => {
    const state = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200 })
      .where(eq(players.id, state.playerId))
      .run();
    addItem(state.playerId, "wood", 20);
    addItem(state.playerId, "plank", 4);
    addItem(state.playerId, "iron_bar", 4);
    addItem(state.playerId, "iron_ore", 4);
    addItem(state.playerId, "wheat", 4);

    const pos = boardPos(getPlayerState(userId)!);
    const plotCost = PLAYER_LAND_STATIONS.crop_plot;
    expect(placeLandStation(userId, "crop_plot", pos).ok).toBe(true);
    expect(placeLandStation(userId, "crop_plot", pos).ok).toBe(true);
    expect(placeLandStation(userId, "mill", pos).ok).toBe(true);

    const after = getPlayerState(userId)!;
    expect(after.buildings.filter((b) => b.type === "crop_plot")).toHaveLength(
      2,
    );
    expect(after.buildings.some((b) => b.type === "mill")).toBe(true);

    const plot = after.buildings.find((b) => b.type === "crop_plot")!;
    const mill = after.buildings.find((b) => b.type === "mill")!;
    addItem(after.playerId, "wheat_seed", 2);
    expect(
      plantCrop(userId, plot.id, "wheat_seed", {
        x: WORLD.GRID * plot.x,
        z: WORLD.GRID * plot.z,
      }).ok,
    ).toBe(true);

    const millPos = { x: WORLD.GRID * mill.x, z: WORLD.GRID * mill.z };
    expect(craftRecipeComplete(userId, "mill_flour", millPos).ok).toBe(true);
    expect(plotCost.kitItemId).toBe("crop_plot_kit");
  });

  it("rejects build on city and unknown station (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall");
    const pos = stall
      ? { x: WORLD.GRID * stall.x, z: WORLD.GRID * stall.z }
      : { x: 0, z: 0 };
    const cityBuild = placeLandStation(userId, "crop_plot", pos);
    expect(cityBuild.ok).toBe(false);
    if (!cityBuild.ok) {
      expect(cityBuild.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    const bad = placeLandStation(userId, "vendor_stall", boardPos(home));
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBe(ACTION_ERROR.unknownStation);

    // ensureStarterYard is explicit-only — reloading after partial never dumps full pile again.
    const before = getPlayerState(userId)!.buildings.length;
    ensureStarterYardBuildings(home.landId);
    const seeded = getPlayerState(userId)!;
    expect(seeded.buildings.length).toBeGreaterThan(before);
    expect(seeded.buildings.some((b) => b.type === "forge")).toBe(true);
  });

  it("spirals free cells around the yard origin (edge helper)", () => {
    const cell = nextFreeBuildCell([{ x: 0, z: 1 }], 0, 1);
    expect(cell).not.toBeNull();
    expect(`${cell!.x},${cell!.z}`).not.toBe("0,1");
  });

  it("expands a field without standing on a pad (happy)", () => {
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 80, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "iron_bar", 2);
    const result = expandLandSlot(userId, { x: 80, z: 80 });
    expect(result.ok).toBe(true);
    expect(
      getPlayerState(userId)!.buildings.some((b) => b.slotIndex === 6),
    ).toBe(true);
  });
});
