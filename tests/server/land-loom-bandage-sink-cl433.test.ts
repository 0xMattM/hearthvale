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
  `game-cl433-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { createMarketListing, listMarket } = await import(
  "../../apps/server/src/game/actions/market.ts"
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

describe("CityLands CL43.3 land loom bandage → vendor/market sink", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl433_${Date.now().toString(36)}`,
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

  it("weaves bandage on land loom then sells at City vendor (happy)", () => {
    const recipe = getRecipe("weave_cloth_bandage")!;
    expect(recipe.profession).toBe("weaver");
    expect(recipe.station).toBe("loom");
    expect(getVendorPrices("city").sell.cloth_bandage).toBe(2);

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
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "plank", 4);
    addItem(home.playerId, "cloth", 2);

    expect(placeLandStation(userId, "loom", boardPos(home)).ok).toBe(true);
    const land = getPlayerState(userId)!;
    const loom = land.buildings.find((b) => b.type === "loom")!;
    expect(loom).toBeTruthy();

    const weaverBefore = land.weaverXp;
    expect(
      craftRecipeComplete(userId, "weave_cloth_bandage", buildingPos(loom)).ok,
    ).toBe(true);
    const afterWeave = getPlayerState(userId)!;
    expect(afterWeave.weaverXp).toBeGreaterThan(weaverBefore);
    expect(
      afterWeave.inventory.some((s) => s.itemId === "cloth_bandage" && s.qty >= 1),
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
    expect(
      vendorSell(userId, "cloth_bandage", 1, buildingPos(stall)).ok,
    ).toBe(true);
    const afterSell = getPlayerState(userId)!;
    expect(afterSell.softCurrency).toBe(coinsBefore + 2);
    expect(afterSell.inventory.some((s) => s.itemId === "cloth_bandage")).toBe(
      false,
    );
  });

  it("lists a second land-woven bandage on City market (edge)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const land = getPlayerState(userId)!;
    const loom = land.buildings.find((b) => b.type === "loom")!;
    expect(loom).toBeTruthy();
    db.update(players)
      .set({ softCurrency: 100, energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "cloth", 1);
    expect(
      craftRecipeComplete(userId, "weave_cloth_bandage", buildingPos(loom)).ok,
    ).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(createMarketListing(userId, "cloth_bandage", 1, 5).ok).toBe(true);
    const board = listMarket(userId);
    expect(board.some((l) => l.itemId === "cloth_bandage" && l.mine)).toBe(
      true,
    );
  });

  it("refuses City vendor sell with empty bandage bag (failure)", () => {
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    const qty =
      city.inventory.find((s) => s.itemId === "cloth_bandage")?.qty ?? 0;
    expect(qty).toBe(0);

    const result = vendorSell(
      userId,
      "cloth_bandage",
      1,
      buildingPos(stall),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
