import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl351-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL35.1 mill flour → bake bread smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl351_${Date.now().toString(36)}`,
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

  it("mills flour then bakes bread with farmer/cook XP (happy)", () => {
    const millRecipe = getRecipe("mill_flour")!;
    const breadRecipe = getRecipe("bake_bread")!;
    expect(millRecipe.profession).toBe("farmer");
    expect(millRecipe.station).toBe("mill");
    expect(breadRecipe.profession).toBe("cook");
    expect(breadRecipe.station).toBe("kitchen");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const pid = city.playerId;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, pid))
      .run();

    const mill = city.buildings.find((b) => b.type === "mill")!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    expect(mill).toBeTruthy();
    expect(kitchen).toBeTruthy();

    // mill_flour needs 2 wheat → 1 flour; bake_bread needs 2 flour → 1 bread
    addItem(pid, "wheat", 4);
    const farmerBefore = city.farmerXp;
    const cookBefore = city.cookXp;

    expect(craftRecipeComplete(userId, "mill_flour", buildingPos(mill)).ok).toBe(true);
    expect(craftRecipeComplete(userId, "mill_flour", buildingPos(mill)).ok).toBe(true);
    const afterMill = getPlayerState(userId)!;
    expect(afterMill.farmerXp).toBeGreaterThan(farmerBefore);
    expect(afterMill.cookXp).toBe(cookBefore);
    expect(
      afterMill.inventory.some((s) => s.itemId === "flour" && s.qty >= 2),
    ).toBe(true);

    expect(craftRecipeComplete(userId, "bake_bread", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const afterBake = getPlayerState(userId)!;
    expect(afterBake.cookXp).toBeGreaterThan(cookBefore);
    expect(afterBake.farmerXp).toBe(afterMill.farmerXp);
    expect(
      afterBake.inventory.some((s) => s.itemId === "bread" && s.qty >= 1),
    ).toBe(true);
  });

  it("refuses bake without flour (failure)", () => {
    const city = getPlayerState(userId)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    const flourQty = city.inventory
      .filter((s) => s.itemId === "flour")
      .reduce((n, s) => n + s.qty, 0);
    if (flourQty > 0) removeItem(city.playerId, "flour", flourQty);

    const result = craftRecipeComplete(userId, "bake_bread", buildingPos(kitchen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });

  it("refuses mill_flour at kitchen (wrong station edge)", () => {
    const city = getPlayerState(userId)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    addItem(city.playerId, "wheat", 2);
    const result = craftRecipeComplete(userId, "mill_flour", buildingPos(kitchen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
      expect(result.error).not.toBe(ACTION_ERROR.playerMissing);
    }
  });
});
