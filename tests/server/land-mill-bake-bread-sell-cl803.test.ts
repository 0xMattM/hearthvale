import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl803-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock — bread NPC buyback (city / explore / land). */
const BREAD_SELL = 3;

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

/**
 * CL80.3 — Land mill→bake→City bread sell still green.
 * Choice: assert-only mill→bake→vendor chain (parity with CL43.1 / CL47.3; no Content Lock retune).
 */
describe("CityLands CL80.3 land mill→bake→City bread sell still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl803_${Date.now().toString(36)}`,
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

  it("mills flour, bakes bread on land, sells at City vendor (happy)", () => {
    const millRecipe = getRecipe("mill_flour")!;
    const breadRecipe = getRecipe("bake_bread")!;
    expect(millRecipe.profession).toBe("farmer");
    expect(millRecipe.station).toBe("mill");
    expect(breadRecipe.profession).toBe("cook");
    expect(breadRecipe.station).toBe("kitchen");
    expect(getVendorPrices("city").sell.bread).toBe(BREAD_SELL);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "iron_bar", 1);
    addItem(home.playerId, "iron_ore", 1);
    addItem(home.playerId, "wheat", 4);

    const starterBread = home.inventory
      .filter((s) => s.itemId === "bread")
      .reduce((n, s) => n + s.qty, 0);
    if (starterBread > 0) removeItem(home.playerId, "bread", starterBread);

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
    expect(
      afterBake.inventory.some((s) => s.itemId === "bread" && s.qty >= 1),
    ).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(stall).toBeTruthy();
    db.update(players)
      .set({ softCurrency: 40 })
      .where(eq(players.id, city.playerId))
      .run();
    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "bread", 1, buildingPos(stall)).ok).toBe(true);
    const afterSell = getPlayerState(userId)!;
    expect(afterSell.softCurrency).toBe(coinsBefore + BREAD_SELL);
    expect(afterSell.inventory.some((s) => s.itemId === "bread")).toBe(false);
  });

  it("keeps bread sell below flour buyback (edge)", () => {
    expect(getVendorPrices("city").sell.bread!).toBeLessThan(
      getVendorPrices("city").sell.flour!,
    );
  });

  it("refuses City vendor sell with empty bread bag (failure)", () => {
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    const qty = city.inventory.find((s) => s.itemId === "bread")?.qty ?? 0;
    expect(qty).toBe(0);

    const result = vendorSell(userId, "bread", 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
