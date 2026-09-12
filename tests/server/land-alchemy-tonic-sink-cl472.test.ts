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
  `game-cl472-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL47.2 land alchemy brew → vendor/market sink", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl472_${Date.now().toString(36)}`,
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

  it("brews tonic on land bench then sells at City vendor (happy)", () => {
    const recipe = getRecipe("brew_herbal_tonic")!;
    expect(recipe.profession).toBe("alchemist");
    expect(recipe.station).toBe("alchemy_bench");
    expect(getVendorPrices("city").sell.herbal_tonic).toBe(4);

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
    addItem(home.playerId, "iron_ore", 1);
    addItem(home.playerId, "wheat", 2);
    addItem(home.playerId, "leather", 1);

    expect(
      placeLandStation(userId, "alchemy_bench", boardPos(home)).ok,
    ).toBe(true);
    const land = getPlayerState(userId)!;
    const bench = land.buildings.find((b) => b.type === "alchemy_bench")!;
    expect(bench).toBeTruthy();

    const alchemistBefore = land.alchemistXp;
    expect(
      craftRecipeComplete(userId, "brew_herbal_tonic", buildingPos(bench)).ok,
    ).toBe(true);
    const afterBrew = getPlayerState(userId)!;
    expect(afterBrew.alchemistXp).toBeGreaterThan(alchemistBefore);
    expect(afterBrew.cookXp).toBe(land.cookXp);
    expect(
      afterBrew.inventory.some(
        (s) => s.itemId === "herbal_tonic" && s.qty >= 1,
      ),
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
      vendorSell(userId, "herbal_tonic", 1, buildingPos(stall)).ok,
    ).toBe(true);
    const afterSell = getPlayerState(userId)!;
    expect(afterSell.softCurrency).toBe(coinsBefore + 4);
    expect(afterSell.inventory.some((s) => s.itemId === "herbal_tonic")).toBe(
      false,
    );
  });

  it("lists a second land-brewed tonic on City market (edge)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const land = getPlayerState(userId)!;
    const bench = land.buildings.find((b) => b.type === "alchemy_bench")!;
    expect(bench).toBeTruthy();
    db.update(players)
      .set({ softCurrency: 100, energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wheat", 2);
    addItem(land.playerId, "leather", 1);
    expect(
      craftRecipeComplete(userId, "brew_herbal_tonic", buildingPos(bench)).ok,
    ).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(createMarketListing(userId, "herbal_tonic", 1, 6).ok).toBe(true);
    const board = listMarket(userId);
    expect(board.some((l) => l.itemId === "herbal_tonic" && l.mine)).toBe(
      true,
    );
  });

  it("refuses City vendor sell with empty tonic bag (failure)", () => {
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    const qty =
      city.inventory.find((s) => s.itemId === "herbal_tonic")?.qty ?? 0;
    expect(qty).toBe(0);

    const result = vendorSell(
      userId,
      "herbal_tonic",
      1,
      buildingPos(stall),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
