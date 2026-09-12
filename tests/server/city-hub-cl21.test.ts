import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CITY_BUILDINGS, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl21-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind, getSharedCityLand } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { expandLandSlot } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { plantCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/** World-space position at a building's grid cell center. */
function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL2.1 shared city scarce stations", () => {
  let userA = "";
  let userB = "";

  beforeAll(() => {
    migrateSqlite();
    const a = registerUser(`cl21a_${Date.now().toString(36)}`, "password123");
    const b = registerUser(`cl21b_${Date.now().toString(36)}`, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    userA = userIdFromToken(a.token)!;
    userB = userIdFromToken(b.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("loads scarce stations and crafts/plants on the shared hub (happy)", () => {
    expect(travelToLandKind(userA, "city").ok).toBe(true);
    const state = getPlayerState(userA)!;
    expect(state.landKind).toBe("city");
    expect(state.buildings.length).toBe(CITY_BUILDINGS.length);
    expect(state.buildings.filter((b) => b.type === "workshop")).toHaveLength(1);
    expect(state.buildings.filter((b) => b.type === "forge")).toHaveLength(1);
    expect(state.buildings.filter((b) => b.type === "crop_plot").length).toBeGreaterThanOrEqual(2);
    expect(state.buildings.filter((b) => b.type === "tree_stump").length).toBeGreaterThanOrEqual(2);

    const pid = db.select().from(players).where(eq(players.userId, userA)).get()!.id;
    addItem(pid, "wood", 4);
    const workshop = state.buildings.find((b) => b.type === "workshop")!;
    expect(
      craftRecipeComplete(userA, "saw_planks", buildingPos(workshop)).ok,
    ).toBe(true);

    addItem(pid, "wheat_seed", 1);
    const plot = state.buildings.find((b) => b.type === "crop_plot")!;
    expect(plantCrop(userA, plot.id, "wheat_seed", buildingPos(plot)).ok).toBe(
      true,
    );
  });

  it("shares one city land id across players (edge)", () => {
    expect(travelToLandKind(userB, "city").ok).toBe(true);
    const a = getPlayerState(userA)!;
    const b = getPlayerState(userB)!;
    expect(a.landId).toBe(b.landId);
    expect(getSharedCityLand()?.id).toBe(a.landId);
    expect(a.buildings.length).toBe(CITY_BUILDINGS.length);
    expect(b.buildings.length).toBe(CITY_BUILDINGS.length);
  });

  it("rejects own-expand on the city map (failure)", () => {
    if (getPlayerState(userA)!.landKind !== "city") {
      expect(travelToLandKind(userA, "city").ok).toBe(true);
    }
    expect(getPlayerState(userA)!.landKind).toBe("city");
    const result = expandLandSlot(userA, { x: 0, z: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/your land/i);
    }
  });
});
