import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, ENERGY, FOOD_RESTORE, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-food-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { craftRecipeComplete, eatFood } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { getPlayerState, addItem, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function playerRow(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!;
}

describe("longer food chain F10.3", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `food_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    ensureStarterYardBuildings(getPlayerState(userId)!.landId);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("cooks stew from flour+meat and restores tier energy (happy)", () => {
    const state = getPlayerState(userId)!;
    const kitchen = state.buildings.find((b) => b.type === "kitchen")!;
    const pid = playerRow(userId).id;
    db.update(players).set({ cookXp: 20, energy: 20 }).where(eq(players.id, pid)).run();
    addItem(pid, "flour", 1);
    addItem(pid, "raw_meat", 1);

    const crafted = craftRecipeComplete(userId, "cook_stew", buildingPos(kitchen));
    expect(crafted.ok).toBe(true);

    const afterCraft = getPlayerState(userId)!;
    expect(afterCraft.inventory.some((i) => i.itemId === "stew")).toBe(true);
    expect(afterCraft.inventory.some((i) => i.itemId === "flour")).toBe(false);
    expect(afterCraft.inventory.some((i) => i.itemId === "raw_meat")).toBe(false);

    const beforeEnergy = afterCraft.energy;
    const eaten = eatFood(userId, "stew");
    expect(eaten.ok).toBe(true);
    const afterEat = getPlayerState(userId)!;
    expect(afterEat.energy).toBe(
      Math.min(afterEat.maxEnergy, beforeEnergy + ENERGY.stewRestore),
    );
    expect(afterEat.inventory.some((i) => i.itemId === "stew")).toBe(false);
  });

  it("packs travel ration and restores higher tier (edge)", () => {
    const state = getPlayerState(userId)!;
    const kitchen = state.buildings.find((b) => b.type === "kitchen")!;
    const pid = playerRow(userId).id;
    db.update(players)
      .set({ cookXp: 30, energy: 10 })
      .where(eq(players.id, pid))
      .run();
    addItem(pid, "bread", 1);
    addItem(pid, "cooked_meat", 1);

    const crafted = craftRecipeComplete(
      userId,
      "pack_travel_ration",
      buildingPos(kitchen),
    );
    expect(crafted.ok).toBe(true);
    expect(FOOD_RESTORE.travel_ration).toBe(ENERGY.rationRestore);

    const before = getPlayerState(userId)!.energy;
    expect(eatFood(userId, "travel_ration").ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.energy).toBe(
      Math.min(after.maxEnergy, before + ENERGY.rationRestore),
    );
  });

  it("rejects stew craft without cook XP gate (failure)", () => {
    const state = getPlayerState(userId)!;
    const kitchen = state.buildings.find((b) => b.type === "kitchen")!;
    const pid = playerRow(userId).id;
    db.update(players).set({ cookXp: 0 }).where(eq(players.id, pid)).run();
    addItem(pid, "flour", 1);
    addItem(pid, "raw_meat", 1);

    const result = craftRecipeComplete(userId, "cook_stew", buildingPos(kitchen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.needsXp("Cook", 15));
    }
  });
});
