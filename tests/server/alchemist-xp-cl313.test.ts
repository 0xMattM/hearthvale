import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl313-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem, removeItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL31.3 Alchemist XP column", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl313_${Date.now().toString(36)}`, "password123");
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

  it("brew grants alchemist XP not cook; stew/fish stay cook (happy)", () => {
    const brew = getRecipe("brew_herbal_tonic")!;
    expect(brew.profession).toBe("alchemist");
    expect(getRecipe("cook_stew")!.profession).toBe("cook");
    expect(getRecipe("cook_fish")!.profession).toBe("cook");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const bench = city.buildings.find((b) => b.type === "alchemy_bench")!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    addItem(city.playerId, "wheat", 2);
    addItem(city.playerId, "leather", 1);

    const alchemistBefore = city.alchemistXp;
    const cookBefore = city.cookXp;
    expect(
      craftRecipeComplete(userId, "brew_herbal_tonic", buildingPos(bench)).ok,
    ).toBe(true);
    const afterBrew = getPlayerState(userId)!;
    expect(afterBrew.alchemistXp).toBeGreaterThan(alchemistBefore);
    expect(afterBrew.cookXp).toBe(cookBefore);

    // cook_fish is ungated cook craft (stew needs cook XP 15)
    addItem(afterBrew.playerId, "fish", 1);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterBrew.playerId))
      .run();
    const cookMid = afterBrew.cookXp;
    const alchemistMid = afterBrew.alchemistXp;
    expect(craftRecipeComplete(userId, "cook_fish", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const afterFish = getPlayerState(userId)!;
    expect(afterFish.cookXp).toBeGreaterThan(cookMid);
    expect(afterFish.alchemistXp).toBe(alchemistMid);
  });

  it("refuses brew without materials (edge)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const city = getPlayerState(userId)!;
    const bench = city.buildings.find((b) => b.type === "alchemy_bench")!;
    const wheat = city.inventory.find((s) => s.itemId === "wheat")?.qty ?? 0;
    if (wheat > 0) removeItem(city.playerId, "wheat", wheat);
    const before = getPlayerState(userId)!;
    const refused = craftRecipeComplete(
      userId,
      "brew_herbal_tonic",
      buildingPos(bench),
    );
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe(ACTION_ERROR.missingMaterials);
    }
    expect(getPlayerState(userId)!.alchemistXp).toBe(before.alchemistXp);
    expect(getPlayerState(userId)!.cookXp).toBe(before.cookXp);
  });

  it("refuses brew at kitchen station (failure)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const city = getPlayerState(userId)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    addItem(city.playerId, "wheat", 2);
    addItem(city.playerId, "leather", 1);
    const before = getPlayerState(userId)!;
    const wrong = craftRecipeComplete(
      userId,
      "brew_herbal_tonic",
      buildingPos(kitchen),
    );
    expect(wrong.ok).toBe(false);
    expect(getPlayerState(userId)!.alchemistXp).toBe(before.alchemistXp);
  });
});
