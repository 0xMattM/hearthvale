import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  EXPLORE_BUILDINGS,
  EXPLORE_LAND,
  PLAYER_LAND_BUILDINGS,
  WORLD,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl4-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { gatherBuilding } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const { buildings, inventory, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

/** World-space position at a building's grid cell center. */
function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL4.1–CL4.2 exploration map + hunt relocate", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl4_${Date.now().toString(36)}`,
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

  it("loads multi-section explore template with trees, mines, hunt nodes (happy)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("explore");
    expect(state.buildings).toHaveLength(EXPLORE_BUILDINGS.length);
    expect(state.buildings.length).toBe(EXPLORE_LAND.buildSlots);
    expect(
      state.buildings.filter((b) => b.type === "tree_stump").length,
    ).toBeGreaterThanOrEqual(4);
    expect(
      state.buildings.filter((b) => b.type === "ore_node").length,
    ).toBeGreaterThanOrEqual(4);
    expect(
      state.buildings.filter((b) => b.type === "game_trail").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      state.buildings.filter((b) => b.type === "edge_thicket").length,
    ).toBeGreaterThanOrEqual(1);
    expect(state.buildings.some((b) => b.type === "crop_plot")).toBe(false);
    expect(state.buildings.some((b) => b.type === "portal")).toBe(false);
    expect(state.buildings.some((b) => b.type === "vendor_stall")).toBe(false);
  });

  it("gathers wood and ore on explore with existing gather actions (edge)", () => {
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("explore");
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    addItem(pid, "iron_hammer", 1);
    const hammer = db
      .select()
      .from(inventory)
      .where(eq(inventory.playerId, pid))
      .all()
      .find((i) => i.itemId === "iron_hammer")!;
    db.update(players)
      .set({ equippedToolInventoryId: hammer.id })
      .where(eq(players.id, pid))
      .run();

    const stump = state.buildings.find((b) => b.type === "tree_stump")!;
    const ore = state.buildings.find((b) => b.type === "ore_node")!;
    expect(gatherBuilding(userId, stump.id, buildingPos(stump)).ok).toBe(true);
    expect(gatherBuilding(userId, ore.id, buildingPos(ore)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.inventory.some((i) => i.itemId === "wood")).toBe(true);
    expect(after.inventory.some((i) => i.itemId === "iron_ore")).toBe(true);
  });

  it("wins hunt on explore and grants mats (happy CL4.2)", () => {
    const state = getPlayerState(userId)!;
    const trail = state.buildings.find((b) => b.type === "game_trail")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, trail.id))
      .run();
    db.update(players)
      .set({ health: 100 })
      .where(eq(players.userId, userId))
      .run();
    const result = huntTrail(userId, trail.id, buildingPos(trail));
    expect(result.ok).toBe(true);
    expect(result.encounter?.won).toBe(true);
    expect(result.encounter!.leather).toBeGreaterThan(0);
    const after = getPlayerState(userId)!;
    expect(after.inventory.some((i) => i.itemId === "leather")).toBe(true);
  });

  it("rejects hunt on player land / homestead (failure CL4.2)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    expect(home.buildings.some((b) => b.type === "game_trail")).toBe(false);
    expect(home.buildings.some((b) => b.type === "edge_thicket")).toBe(false);
    expect(PLAYER_LAND_BUILDINGS.some((m) => m.type === "game_trail")).toBe(
      false,
    );

    // Packed homestead seed no longer includes hunt trails.
    ensureStarterYardBuildings(home.landId);
    const packed = getPlayerState(userId)!;
    expect(packed.buildings.some((b) => b.type === "game_trail")).toBe(false);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const fakeTrail = city.buildings[0];
    const rejected = huntTrail(userId, fakeTrail.id, buildingPos(fakeTrail));
    expect(rejected.ok).toBe(false);
    expect(rejected.error).toBe(ACTION_ERROR.huntExploreOnly);
  });
});
