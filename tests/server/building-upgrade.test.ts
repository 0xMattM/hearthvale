import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDING_UPGRADES,
  ENERGY,
  WORLD,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-upgrade-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { upgradeBuilding } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { craftRecipeComplete } = await import(
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

describe("mill/forge upgrades F10.4", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `upg_${Date.now().toString(36)}`,
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

  it("upgrades mill T1→T2 and grants stackable throughput (happy)", () => {
    const state = getPlayerState(userId)!;
    const mill = state.buildings.find((b) => b.type === "mill")!;
    expect(mill.tier).toBe(1);
    const pid = playerRow(userId).id;
    const cost = BUILDING_UPGRADES.mill;
    db.update(players)
      .set({ softCurrency: cost.coinCost + 10, energy: 100 })
      .where(eq(players.id, pid))
      .run();
    addItem(pid, "plank", 4);
    addItem(pid, "iron_bar", 2);

    const upgraded = upgradeBuilding(userId, mill.id, buildingPos(mill));
    expect(upgraded.ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.buildings.find((b) => b.id === mill.id)?.tier).toBe(2);
    expect(after.softCurrency).toBe(10);

    addItem(pid, "wheat", 2);
    const beforeFlour =
      after.inventory.find((i) => i.itemId === "flour")?.qty ?? 0;
    const craft = craftRecipeComplete(userId, "mill_flour", buildingPos(mill));
    expect(craft.ok).toBe(true);
    const milled = getPlayerState(userId)!;
    const flourQty = milled.inventory.find((i) => i.itemId === "flour")?.qty ?? 0;
    expect(flourQty).toBe(beforeFlour + 2);
  });

  it("rejects second upgrade (edge)", () => {
    const state = getPlayerState(userId)!;
    const mill = state.buildings.find((b) => b.type === "mill")!;
    expect(mill.tier).toBe(2);
    const result = upgradeBuilding(userId, mill.id, buildingPos(mill));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.alreadyUpgraded);
  });

  it("rejects forge upgrade without coins (failure)", () => {
    const state = getPlayerState(userId)!;
    const forge = state.buildings.find((b) => b.type === "forge")!;
    const pid = playerRow(userId).id;
    db.update(players)
      .set({ softCurrency: 0, energy: 100 })
      .where(eq(players.id, pid))
      .run();
    addItem(pid, "iron_bar", 3);
    addItem(pid, "plank", 2);
    const result = upgradeBuilding(userId, forge.id, buildingPos(forge));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(
        ACTION_ERROR.needCoinsUpgrade(BUILDING_UPGRADES.forge.coinCost),
      );
    }
    expect(ENERGY.costs.build).toBe(BUILDING_UPGRADES.forge.energyCost);
  });
});
