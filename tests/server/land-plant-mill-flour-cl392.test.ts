import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl392-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { plantCrop, harvestCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

describe("CityLands CL39.2 land plant → harvest → mill flour smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl392_${Date.now().toString(36)}`,
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

  it("plants wheat, harvests, mills flour on player land with farmer XP (happy)", () => {
    const millRecipe = getRecipe("mill_flour")!;
    expect(millRecipe.profession).toBe("farmer");
    expect(millRecipe.station).toBe("mill");

    // New players spawn on empty player_land — stay put (travelAlreadyHere if re-called).
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    // crop_plot + mill materials (mill gated until first place grants builder XP)
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "iron_bar", 1);
    addItem(home.playerId, "wheat_seed", 2);

    const pos = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "crop_plot", pos).ok).toBe(true);
    expect(placeLandStation(userId, "mill", pos).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const plot = land.buildings.find((b) => b.type === "crop_plot")!;
    const mill = land.buildings.find((b) => b.type === "mill")!;
    expect(plot).toBeTruthy();
    expect(mill).toBeTruthy();

    const farmerBefore = land.farmerXp;
    expect(
      plantCrop(userId, plot.id, "wheat_seed", buildingPos(plot)).ok,
    ).toBe(true);
    const afterPlant = getPlayerState(userId)!;
    expect(afterPlant.farmerXp).toBeGreaterThan(farmerBefore);

    const planted = afterPlant.buildings.find((b) => b.id === plot.id)!;
    expect(planted.cropState).toBe("planted");
    db.update(buildings)
      .set({ readyAt: Date.now() - 1000 })
      .where(eq(buildings.id, planted.id))
      .run();

    const farmerMid = getPlayerState(userId)!.farmerXp;
    expect(harvestCrop(userId, plot.id, buildingPos(plot)).ok).toBe(true);
    const afterHarvest = getPlayerState(userId)!;
    expect(afterHarvest.farmerXp).toBeGreaterThan(farmerMid);
    const wheatQty = afterHarvest.inventory
      .filter((s) => s.itemId === "wheat")
      .reduce((n, s) => n + s.qty, 0);
    expect(wheatQty).toBeGreaterThanOrEqual(2);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterHarvest.playerId))
      .run();
    const farmerPreMill = getPlayerState(userId)!.farmerXp;
    expect(craftRecipeComplete(userId, "mill_flour", buildingPos(mill)).ok).toBe(true);
    const afterMill = getPlayerState(userId)!;
    expect(afterMill.farmerXp).toBeGreaterThan(farmerPreMill);
    expect(
      afterMill.inventory.some((s) => s.itemId === "flour" && s.qty >= 1),
    ).toBe(true);
  });

  it("refuses mill_flour without wheat on land mill (failure)", () => {
    const land = getPlayerState(userId)!;
    const mill = land.buildings.find((b) => b.type === "mill")!;
    expect(mill).toBeTruthy();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    const wheatQty = land.inventory
      .filter((s) => s.itemId === "wheat")
      .reduce((n, s) => n + s.qty, 0);
    if (wheatQty > 0) removeItem(land.playerId, "wheat", wheatQty);

    const result = craftRecipeComplete(userId, "mill_flour", buildingPos(mill));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });

  it("refuses harvest while crop still growing (edge)", () => {
    const land = getPlayerState(userId)!;
    const plot = land.buildings.find((b) => b.type === "crop_plot")!;
    addItem(land.playerId, "wheat_seed", 1);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    expect(
      plantCrop(userId, plot.id, "wheat_seed", buildingPos(plot)).ok,
    ).toBe(true);
    const result = harvestCrop(userId, plot.id, buildingPos(plot));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.cropNotReady);
    }
  });
});
