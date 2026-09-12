import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ENERGY,
  FOOD_RESTORE,
  ITEMS,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl721-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem, removeItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { eatFood } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/**
 * CL72.1 — bread / hearty stew (`stew`) eat restores Content Lock energy; empty refuse.
 * Choice: assert-only eat sinks (restore already locked) over new food SKUs.
 */
describe("CityLands CL72.1 bread / hearty stew eat energy still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl721_${Date.now().toString(36)}`,
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

  it("eats bread and stew for Content Lock energy without combat buff (happy)", () => {
    expect(ITEMS.stew.name).toBe("Hearty Stew");
    expect(FOOD_RESTORE.bread).toBe(ENERGY.breadRestore);
    expect(FOOD_RESTORE.stew).toBe(ENERGY.stewRestore);
    expect(ENERGY.breadRestore).toBe(25);
    expect(ENERGY.stewRestore).toBe(55);

    const home = getPlayerState(userId)!;
    for (const id of ["bread", "stew"] as const) {
      const qty =
        home.inventory.find((s) => s.itemId === id)?.qty ?? 0;
      if (qty > 0) removeItem(home.playerId, id, qty);
    }
    addItem(home.playerId, "bread", 1);
    addItem(home.playerId, "stew", 1);

    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, home.playerId))
      .run();
    const beforeBread = getPlayerState(userId)!;
    const health = beforeBread.health;
    const damage = beforeBread.damage;
    const defense = beforeBread.defense;
    const cookXp = beforeBread.cookXp;
    const farmerXp = beforeBread.farmerXp;

    expect(eatFood(userId, "bread").ok).toBe(true);
    const afterBread = getPlayerState(userId)!;
    expect(afterBread.energy).toBe(
      Math.min(afterBread.maxEnergy, 10 + ENERGY.breadRestore),
    );
    expect(afterBread.inventory.some((s) => s.itemId === "bread")).toBe(false);
    expect(afterBread.cookXp).toBe(cookXp);
    expect(afterBread.farmerXp).toBe(farmerXp);
    expect(afterBread.health).toBe(health);
    expect(afterBread.damage).toBe(damage);
    expect(afterBread.defense).toBe(defense);

    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, afterBread.playerId))
      .run();
    expect(eatFood(userId, "stew").ok).toBe(true);
    const afterStew = getPlayerState(userId)!;
    expect(afterStew.energy).toBe(
      Math.min(afterStew.maxEnergy, 10 + ENERGY.stewRestore),
    );
    expect(afterStew.inventory.some((s) => s.itemId === "stew")).toBe(false);
    expect(afterStew.cookXp).toBe(cookXp);
    expect(afterStew.health).toBe(health);
    expect(afterStew.damage).toBe(damage);
    expect(afterStew.defense).toBe(defense);
  });

  it("keeps stew restore above bread and under travel ration (edge)", () => {
    expect(ENERGY.stewRestore).toBeGreaterThan(ENERGY.breadRestore);
    expect(ENERGY.rationRestore).toBeGreaterThan(ENERGY.stewRestore);
    expect(FOOD_RESTORE.bread).toBe(25);
    expect(FOOD_RESTORE.stew).toBe(55);
  });

  it("rejects eat with empty bread / stew bag (failure)", () => {
    const state = getPlayerState(userId)!;
    for (const id of ["bread", "stew"] as const) {
      const qty = state.inventory.find((s) => s.itemId === id)?.qty ?? 0;
      if (qty > 0) removeItem(state.playerId, id, qty);
    }
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "bread")
        ?.qty ?? 0,
    ).toBe(0);
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "stew")
        ?.qty ?? 0,
    ).toBe(0);

    // Reason: bread keeps legacy noBread copy; other edibles use noFood.
    const bread = eatFood(userId, "bread");
    expect(bread.ok).toBe(false);
    if (!bread.ok) expect(bread.error).toBe(ACTION_ERROR.noBread);

    const stew = eatFood(userId, "stew");
    expect(stew.ok).toBe(false);
    if (!stew.ok) expect(stew.error).toBe(ACTION_ERROR.noFood);
  });
});
