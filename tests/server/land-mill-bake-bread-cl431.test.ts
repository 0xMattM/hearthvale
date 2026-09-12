import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, BUILDER_PLACE_XP, WORLD, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl431-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

describe("CityLands CL43.1 land mill → kitchen bake bread smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl431_${Date.now().toString(36)}`,
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

  it("mills flour then bakes bread on player land with farmer/cook XP (happy)", () => {
    const millRecipe = getRecipe("mill_flour")!;
    const breadRecipe = getRecipe("bake_bread")!;
    expect(millRecipe.profession).toBe("farmer");
    expect(millRecipe.station).toBe("mill");
    expect(breadRecipe.profession).toBe("cook");
    expect(breadRecipe.station).toBe("kitchen");

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        // Reason: mill is gated; kitchen stays ungated cook bootstrap.
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "iron_bar", 1);
    addItem(home.playerId, "iron_ore", 1);
    addItem(home.playerId, "wheat", 4);

    const pos = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "mill", pos).ok).toBe(true);
    expect(placeLandStation(userId, "kitchen", pos).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const mill = land.buildings.find((b) => b.type === "mill")!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    expect(mill).toBeTruthy();
    expect(kitchen).toBeTruthy();

    const farmerBefore = land.farmerXp;
    const cookBefore = land.cookXp;

    expect(craftRecipeComplete(userId, "mill_flour", buildingPos(mill)).ok).toBe(true);
    expect(craftRecipeComplete(userId, "mill_flour", buildingPos(mill)).ok).toBe(true);
    const afterMill = getPlayerState(userId)!;
    expect(afterMill.farmerXp).toBeGreaterThan(farmerBefore);
    expect(afterMill.cookXp).toBe(cookBefore);
    expect(
      afterMill.inventory.some((s) => s.itemId === "flour" && s.qty >= 2),
    ).toBe(true);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterMill.playerId))
      .run();
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

  it("refuses bake without flour at land kitchen (failure)", () => {
    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    expect(kitchen).toBeTruthy();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    const flourQty = land.inventory
      .filter((s) => s.itemId === "flour")
      .reduce((n, s) => n + s.qty, 0);
    if (flourQty > 0) removeItem(land.playerId, "flour", flourQty);

    const result = craftRecipeComplete(userId, "bake_bread", buildingPos(kitchen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });

  it("refuses mill_flour at land kitchen (wrong station edge)", () => {
    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wheat", 2);
    const result = craftRecipeComplete(userId, "mill_flour", buildingPos(kitchen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
      expect(result.error).not.toBe(ACTION_ERROR.playerMissing);
    }
  });
});
