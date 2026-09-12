import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, CITY_BUILDINGS, WORLD, getVendorPrices } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl23-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { vendorBuy } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const {
  createMarketListing,
  buyMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL2.3 city market stub", () => {
  let userA = "";
  let userB = "";
  let tokenA = "";

  beforeAll(() => {
    migrateSqlite();
    const a = registerUser(`cl23a_${Date.now().toString(36)}`, "password123");
    const b = registerUser(`cl23b_${Date.now().toString(36)}`, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    tokenA = a.token;
    userA = userIdFromToken(a.token)!;
    userB = userIdFromToken(b.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("buys tools/seeds from city vendor and lists/buys at market (happy)", () => {
    expect(travelToLandKind(userA, "city").ok).toBe(true);
    const state = getPlayerState(userA)!;
    expect(state.buildings.some((b) => b.type === "vendor_stall")).toBe(true);
    expect(state.buildings.some((b) => b.type === "market_board")).toBe(true);
    expect(CITY_BUILDINGS.some((b) => b.type === "vendor_stall")).toBe(true);
    expect(CITY_BUILDINGS.some((b) => b.type === "market_board")).toBe(true);

    const book = getVendorPrices("city");
    expect(book.buy.wheat_seed).toBe(8);
    expect(book.buy.wooden_hoe).toBe(12);
    expect(book.buy.iron_hammer).toBe(28);

    const stall = state.buildings.find((b) => b.type === "vendor_stall")!;
    const coinsBefore = state.softCurrency;
    expect(
      vendorBuy(userA, "wheat_seed", 1, buildingPos(stall)).ok,
    ).toBe(true);
    expect(
      vendorBuy(userA, "wooden_hoe", 1, buildingPos(stall)).ok,
    ).toBe(true);
    const afterBuy = getPlayerState(userA)!;
    expect(afterBuy.softCurrency).toBe(coinsBefore - 8 - 12);
    expect(afterBuy.inventory.some((i) => i.itemId === "wheat_seed")).toBe(true);
    expect(afterBuy.inventory.some((i) => i.itemId === "wooden_hoe")).toBe(true);

    const pid = db.select().from(players).where(eq(players.userId, userA)).get()!.id;
    addItem(pid, "wheat", 2);
    const listed = createMarketListing(userA, "wheat", 1, 5);
    expect(listed.ok).toBe(true);

    expect(travelToLandKind(userB, "city").ok).toBe(true);
    const board = listMarket(userB);
    expect(board.some((l) => l.itemId === "wheat" && !l.mine)).toBe(true);
    const listing = board.find((l) => l.itemId === "wheat" && !l.mine)!;
    // Give buyer coins
    db.update(players)
      .set({ softCurrency: 100 })
      .where(eq(players.userId, userB))
      .run();
    expect(buyMarketListing(userB, listing.id).ok).toBe(true);
    expect(
      getPlayerState(userB)!.inventory.some((i) => i.itemId === "wheat"),
    ).toBe(true);
  });

  it("rejects city tool buy without coins (edge)", () => {
    if (getPlayerState(userA)!.landKind !== "city") {
      expect(travelToLandKind(userA, "city").ok).toBe(true);
    }
    db.update(players)
      .set({ softCurrency: 0 })
      .where(eq(players.userId, userA))
      .run();
    const stall = getPlayerState(userA)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const result = vendorBuy(userA, "iron_hammer", 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.notEnoughCoins);
  });

  it("rejects vendor buy off city when no stall (failure)", () => {
    expect(travelToLandKind(userA, "player_land").ok).toBe(true);
    const empty = getPlayerState(userA)!;
    expect(empty.buildings.some((b) => b.type === "vendor_stall")).toBe(false);
    const result = vendorBuy(userA, "wheat_seed", 1, { x: 0, z: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/vendor/i);
    // silence unused
    expect(tokenA.length).toBeGreaterThan(0);
  });
});
