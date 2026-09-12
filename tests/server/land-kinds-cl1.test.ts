import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CANONICAL_LAND_KINDS,
  LAND_DESTINATIONS,
  normalizeLandKind,
  STARTER_BUILDINGS,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl11-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { buildings, lands } = await import("../../apps/server/src/db/schema.ts");

describe("CityLands CL1.1 land kinds + empty player land", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl11_${Date.now().toString(36)}`,
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

  it("bootstraps empty player_land without packed homestead (happy)", () => {
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("player_land");
    expect(state.buildings.every((b) => b.type === "build_board" || b.type === "decor_pad")).toBe(
      true,
    );
    expect(state.buildings.some((b) => b.type === "build_board")).toBe(false);
    expect(state.buildings.some((b) => b.type === "mill")).toBe(false);
    expect(state.buildings.some((b) => b.type === "forge")).toBe(false);
    expect(state.buildings.some((b) => b.type === "kitchen")).toBe(false);
    expect(state.buildings.some((b) => b.type === "vendor_stall")).toBe(false);
    expect(state.buildings.some((b) => b.type === "game_trail")).toBe(false);

    const row = db.select().from(lands).where(eq(lands.id, state.landId)).get();
    expect(row?.kind).toBe("player_land");
  });

  it("does not auto-refill packed yard on reload after partial seed (edge)", () => {
    const state = getPlayerState(userId)!;
    const beforeCount = state.buildings.length;
    // Seed only one station, then reload — ensure* must not dump the full pile.
    db.insert(buildings)
      .values({
        id: `solo_${Date.now()}`,
        landId: state.landId,
        type: "crop_plot",
        slotIndex: 0,
        x: 0,
        z: 0,
        tier: 1,
        cropId: null,
        plantedAt: null,
        readyAt: null,
      })
      .run();

    const after = getPlayerState(userId)!;
    expect(after.buildings.length).toBe(beforeCount + 1);
    expect(after.buildings.some((b) => b.type === "crop_plot")).toBe(true);
    expect(after.buildings.filter((b) => b.type === "mill")).toHaveLength(0);
    expect(STARTER_BUILDINGS.length).toBeGreaterThan(1);
  });

  it("rejects unknown land kind normalize; documents four spaces (failure)", () => {
    expect(normalizeLandKind("swamp")).toBeNull();
    expect(normalizeLandKind("starter")).toBe("player_land");
    expect(normalizeLandKind("forest")).toBe("explore");
    expect([...CANONICAL_LAND_KINDS]).toEqual([
      "city",
      "player_land",
      "explore",
      "warrior",
    ]);
    expect(LAND_DESTINATIONS.map((d) => d.kind)).toEqual([
      "city",
      "player_land",
      "explore",
      "warrior",
    ]);
    // Explicit seed still works for legacy tests — not via getPlayerState.
    ensureStarterYardBuildings(getPlayerState(userId)!.landId);
    const seeded = getPlayerState(userId)!;
    expect(seeded.buildings.some((b) => b.type === "mill")).toBe(true);
  });
});
