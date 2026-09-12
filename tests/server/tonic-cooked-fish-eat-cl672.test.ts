import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ENERGY,
  FOOD_RESTORE,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl672-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
 * CL67.2 — herbal_tonic / cooked_fish eat restores Content Lock energy; empty refuse.
 * Choice: assert-only eat sinks (restore already locked) over new food SKUs.
 */
describe("CityLands CL67.2 herbal tonic / cooked_fish eat energy smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl672_${Date.now().toString(36)}`,
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

  it("eats herbal_tonic and cooked_fish for energy without combat buff (happy)", () => {
    expect(FOOD_RESTORE.herbal_tonic).toBe(ENERGY.herbalTonicRestore);
    expect(FOOD_RESTORE.cooked_fish).toBe(ENERGY.cookedFishRestore);
    expect(ENERGY.herbalTonicRestore).toBe(45);
    expect(ENERGY.cookedFishRestore).toBe(40);

    const home = getPlayerState(userId)!;
    for (const id of ["herbal_tonic", "cooked_fish"] as const) {
      const qty =
        home.inventory.find((s) => s.itemId === id)?.qty ?? 0;
      if (qty > 0) removeItem(home.playerId, id, qty);
    }
    addItem(home.playerId, "herbal_tonic", 1);
    addItem(home.playerId, "cooked_fish", 1);

    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, home.playerId))
      .run();
    const beforeTonic = getPlayerState(userId)!;
    const health = beforeTonic.health;
    const damage = beforeTonic.damage;
    const defense = beforeTonic.defense;
    const alchemistXp = beforeTonic.alchemistXp;
    const cookXp = beforeTonic.cookXp;

    expect(eatFood(userId, "herbal_tonic").ok).toBe(true);
    const afterTonic = getPlayerState(userId)!;
    expect(afterTonic.energy).toBe(
      Math.min(afterTonic.maxEnergy, 10 + ENERGY.herbalTonicRestore),
    );
    expect(afterTonic.inventory.some((s) => s.itemId === "herbal_tonic")).toBe(
      false,
    );
    expect(afterTonic.alchemistXp).toBe(alchemistXp);
    expect(afterTonic.cookXp).toBe(cookXp);
    expect(afterTonic.health).toBe(health);
    expect(afterTonic.damage).toBe(damage);
    expect(afterTonic.defense).toBe(defense);

    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, afterTonic.playerId))
      .run();
    expect(eatFood(userId, "cooked_fish").ok).toBe(true);
    const afterFish = getPlayerState(userId)!;
    expect(afterFish.energy).toBe(
      Math.min(afterFish.maxEnergy, 10 + ENERGY.cookedFishRestore),
    );
    expect(afterFish.inventory.some((s) => s.itemId === "cooked_fish")).toBe(
      false,
    );
    expect(afterFish.cookXp).toBe(cookXp);
    expect(afterFish.health).toBe(health);
    expect(afterFish.damage).toBe(damage);
    expect(afterFish.defense).toBe(defense);
  });

  it("keeps tonic restore above cooked_fish and under travel ration (edge)", () => {
    expect(ENERGY.herbalTonicRestore).toBeGreaterThan(ENERGY.cookedFishRestore);
    expect(ENERGY.rationRestore).toBeGreaterThan(ENERGY.herbalTonicRestore);
    expect(FOOD_RESTORE.herbal_tonic).toBe(45);
    expect(FOOD_RESTORE.cooked_fish).toBe(40);
  });

  it("rejects eat with empty tonic / cooked_fish bag (failure)", () => {
    const state = getPlayerState(userId)!;
    for (const id of ["herbal_tonic", "cooked_fish"] as const) {
      const qty = state.inventory.find((s) => s.itemId === id)?.qty ?? 0;
      if (qty > 0) removeItem(state.playerId, id, qty);
    }
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "herbal_tonic")
        ?.qty ?? 0,
    ).toBe(0);
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "cooked_fish")
        ?.qty ?? 0,
    ).toBe(0);

    const tonic = eatFood(userId, "herbal_tonic");
    expect(tonic.ok).toBe(false);
    if (!tonic.ok) expect(tonic.error).toBe(ACTION_ERROR.noFood);

    const fish = eatFood(userId, "cooked_fish");
    expect(fish.ok).toBe(false);
    if (!fish.ok) expect(fish.error).toBe(ACTION_ERROR.noFood);
  });
});
