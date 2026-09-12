import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  COMBAT,
  ENERGY,
  FOOD_HEAL,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-hp-regen-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { eatFood } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function playerId(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!.id;
}

describe("health regen and food heal", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `hp_${Date.now().toString(36)}`,
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

  it("regenerates HP over elapsed time from a downed floor (happy)", () => {
    const pid = playerId(userId);
    const now = Date.now();
    db.update(players)
      .set({
        health: 1,
        maxHealth: COMBAT.maxHealthStart,
        healthUpdatedAt: now - 3 * COMBAT.regenIntervalMs,
        energy: ENERGY.maxStart,
        energyUpdatedAt: now,
      })
      .where(eq(players.id, pid))
      .run();

    const state = getPlayerState(userId)!;
    expect(state.health).toBe(1 + 3 * COMBAT.regenAmount);
    expect(state.health).toBeLessThan(state.maxHealth);
  });

  it("eating bread restores matching HP without exceeding max (edge)", () => {
    const pid = playerId(userId);
    addItem(pid, "bread", 1);
    db.update(players)
      .set({
        health: 1,
        healthUpdatedAt: Date.now(),
        energy: 10,
        energyUpdatedAt: Date.now(),
      })
      .where(eq(players.id, pid))
      .run();

    const before = getPlayerState(userId)!;
    expect(eatFood(userId, "bread").ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.health).toBe(1 + FOOD_HEAL.bread);
    expect(after.energy).toBe(10 + ENERGY.breadRestore);
    expect(after.damage).toBe(before.damage);
    expect(after.defense).toBe(before.defense);

    addItem(pid, "bread", 1);
    db.update(players)
      .set({
        health: after.maxHealth - 5,
        healthUpdatedAt: Date.now(),
      })
      .where(eq(players.id, pid))
      .run();
    expect(eatFood(userId, "bread").ok).toBe(true);
    const capped = getPlayerState(userId)!;
    expect(capped.health).toBe(capped.maxHealth);
  });

  it("refuses eat when no food is held and leaves HP unchanged (failure)", () => {
    const pid = playerId(userId);
    db.update(players)
      .set({ health: 4, healthUpdatedAt: Date.now() })
      .where(eq(players.id, pid))
      .run();
    const before = getPlayerState(userId)!;
    const result = eatFood(userId, "stew");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.noFood);
    expect(getPlayerState(userId)!.health).toBe(before.health);
  });
});
