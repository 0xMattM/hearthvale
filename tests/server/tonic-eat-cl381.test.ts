import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ENERGY,
  FOOD_RESTORE,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl381-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { craftRecipeComplete, eatFood } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function playerId(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!.id;
}

describe("CityLands CL38.1 herbal tonic eat assert", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl381_${Date.now().toString(36)}`, "password123");
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

  it("eating herbal_tonic restores energy without combat buff (happy)", () => {
    expect(FOOD_RESTORE.herbal_tonic).toBe(ENERGY.herbalTonicRestore);
    expect(ENERGY.herbalTonicRestore).toBe(45);

    const pid = playerId(userId);
    addItem(pid, "herbal_tonic", 1);
    db.update(players).set({ energy: 10 }).where(eq(players.id, pid)).run();
    const before = getPlayerState(userId)!;
    expect(before.energy).toBe(10);
    const cookXp = before.cookXp;
    const alchemistXp = before.alchemistXp;

    expect(eatFood(userId, "herbal_tonic").ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.energy).toBe(
      Math.min(after.maxEnergy, 10 + ENERGY.herbalTonicRestore),
    );
    expect(after.inventory.some((s) => s.itemId === "herbal_tonic")).toBe(
      false,
    );
    // Reason: eat is energy-only — no profession XP and no combat stats.
    expect(after.cookXp).toBe(cookXp);
    expect(after.alchemistXp).toBe(alchemistXp);
    expect(after.health).toBe(before.health);
    expect(after.damage).toBe(before.damage);
    expect(after.defense).toBe(before.defense);
  });

  it("keeps kitchen cook crafts unchanged (edge)", () => {
    expect(getRecipe("cook_stew")!.profession).toBe("cook");
    expect(getRecipe("cook_fish")!.profession).toBe("cook");
    expect(getRecipe("brew_herbal_tonic")!.profession).toBe("alchemist");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const kitchen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    const pid = playerId(userId);
    addItem(pid, "fish", 1);
    db.update(players).set({ energy: 100 }).where(eq(players.id, pid)).run();
    const cookBefore = getPlayerState(userId)!.cookXp;
    const alchemistBefore = getPlayerState(userId)!.alchemistXp;
    expect(craftRecipeComplete(userId, "cook_fish", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const after = getPlayerState(userId)!;
    expect(after.cookXp).toBeGreaterThan(cookBefore);
    expect(after.alchemistXp).toBe(alchemistBefore);
  });

  it("rejects eat with no tonic (failure)", () => {
    const leftover =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "herbal_tonic")
        ?.qty ?? 0;
    expect(leftover).toBe(0);
    const result = eatFood(userId, "herbal_tonic");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.noFood);
    }
  });
});
