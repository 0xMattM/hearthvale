import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getVendorPrices } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl513-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { plantCrop, harvestCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

/** Content Lock — wheat NPC buyback (city / land; Explore is premium-discounted). */
const WHEAT_SELL_CITY = 2;

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

describe("CityLands CL51.3 land wheat harvest → City vendor sell", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl513_${Date.now().toString(36)}`,
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

  it("plants and harvests on land then sells wheat at City vendor (happy)", () => {
    expect(getVendorPrices("city").sell.wheat).toBe(WHEAT_SELL_CITY);
    expect(getVendorPrices("player_land").sell.wheat).toBe(WHEAT_SELL_CITY);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "wheat_seed", 2);

    // Reason: e2e sells harvested wheat — clear starter/leftover wheat first.
    const leftoverWheat = home.inventory
      .filter((s) => s.itemId === "wheat")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverWheat > 0) removeItem(home.playerId, "wheat", leftoverWheat);

    const pos = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "crop_plot", pos).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const plot = land.buildings.find((b) => b.type === "crop_plot")!;
    expect(plot).toBeTruthy();

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

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(stall).toBeTruthy();
    db.update(players)
      .set({ softCurrency: 40 })
      .where(eq(players.id, city.playerId))
      .run();
    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "wheat", 1, buildingPos(stall)).ok).toBe(true);
    const afterSell = getPlayerState(userId)!;
    expect(afterSell.softCurrency).toBe(coinsBefore + WHEAT_SELL_CITY);
    const wheatLeft = afterSell.inventory
      .filter((s) => s.itemId === "wheat")
      .reduce((n, s) => n + s.qty, 0);
    expect(wheatLeft).toBe(wheatQty - 1);
  });

  it("refuses harvest while crop still growing (cropNotReady holds)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const land = getPlayerState(userId)!;
    const plot = land.buildings.find((b) => b.type === "crop_plot")!;
    expect(plot).toBeTruthy();
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

  it("refuses City vendor sell with empty wheat bag (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    const wheatQty = city.inventory
      .filter((s) => s.itemId === "wheat")
      .reduce((n, s) => n + s.qty, 0);
    if (wheatQty > 0) removeItem(city.playerId, "wheat", wheatQty);

    const result = vendorSell(userId, "wheat", 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
