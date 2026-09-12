import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, MARKET, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl291-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const {
  createMarketListing,
  buyMarketListing,
  cancelMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

function stationPos(
  state: { buildings: Array<{ type: string; x: number; z: number }> },
  type: string,
) {
  const b = state.buildings.find((row) => row.type === type)!;
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL29.1 market cancel + buy smoke", () => {
  let sellerId = "";
  let buyerId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const s = registerUser(`cl291s_${stamp}`, "password123");
    const b = registerUser(`cl291b_${stamp}`, "password123");
    expect(s.ok && b.ok).toBe(true);
    if (!s.ok || !b.ok) throw new Error("register failed");
    sellerId = userIdFromToken(s.token)!;
    buyerId = userIdFromToken(b.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("lists land crafts, buyer buys one, seller cancels the other (happy)", () => {
    expect(getPlayerState(sellerId)!.landKind).toBe("player_land");
    const home = getPlayerState(sellerId)!;
    const pos = boardPos(home);
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 20);
    addItem(home.playerId, "plank", 6);
    addItem(home.playerId, "leather", 4);

    expect(placeLandStation(sellerId, "workshop", pos).ok).toBe(true);
    expect(placeLandStation(sellerId, "loom", pos).ok).toBe(true);
    const built = getPlayerState(sellerId)!;
    expect(
      craftRecipeComplete(sellerId, "saw_planks", stationPos(built, "workshop")).ok,
    ).toBe(true);
    expect(
      craftRecipeComplete(sellerId, "weave_cloth", stationPos(built, "loom")).ok,
    ).toBe(true);

    expect(travelToLandKind(sellerId, "city").ok).toBe(true);
    const city = getPlayerState(sellerId)!;
    expect(city.buildings.some((b) => b.type === "market_board")).toBe(true);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins * 2 + 20 })
      .where(eq(players.userId, sellerId))
      .run();

    const plankList = createMarketListing(sellerId, "plank", 1, 5);
    const clothList = createMarketListing(sellerId, "cloth", 1, 6);
    expect(plankList.ok).toBe(true);
    expect(clothList.ok).toBe(true);
    const plankId = plankList.listingId!;
    const clothId = clothList.listingId!;

    expect(travelToLandKind(buyerId, "city").ok).toBe(true);
    db.update(players)
      .set({ softCurrency: 100 })
      .where(eq(players.userId, buyerId))
      .run();

    const board = listMarket(buyerId);
    expect(board.some((l) => l.id === plankId && !l.mine)).toBe(true);
    expect(board.some((l) => l.id === clothId && !l.mine)).toBe(true);

    const buyerBefore = getPlayerState(buyerId)!;
    const sellerBefore = getPlayerState(sellerId)!;
    expect(buyMarketListing(buyerId, plankId).ok).toBe(true);
    const buyerAfter = getPlayerState(buyerId)!;
    const sellerAfterBuy = getPlayerState(sellerId)!;
    expect(buyerAfter.softCurrency).toBe(buyerBefore.softCurrency - 5);
    expect(sellerAfterBuy.softCurrency).toBe(sellerBefore.softCurrency + 5);
    expect(
      buyerAfter.inventory.some((s) => s.itemId === "plank" && s.qty >= 1),
    ).toBe(true);
    expect(listMarket(buyerId).some((l) => l.id === plankId)).toBe(false);

    const clothBefore =
      getPlayerState(sellerId)!.inventory.find((s) => s.itemId === "cloth")
        ?.qty ?? 0;
    expect(cancelMarketListing(sellerId, clothId).ok).toBe(true);
    expect(listMarket(sellerId).some((l) => l.id === clothId)).toBe(false);
    const clothAfter =
      getPlayerState(sellerId)!.inventory.find((s) => s.itemId === "cloth")
        ?.qty ?? 0;
    expect(clothAfter).toBe(clothBefore + 1);
  });

  it("rejects cancel of another player's listing (failure)", () => {
    const pid = getPlayerState(sellerId)!.playerId;
    addItem(pid, "plank", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 5 })
      .where(eq(players.userId, sellerId))
      .run();
    const listed = createMarketListing(sellerId, "plank", 1, 4);
    expect(listed.ok).toBe(true);
    const listingId = listed.listingId!;

    const stolen = cancelMarketListing(buyerId, listingId);
    expect(stolen.ok).toBe(false);
    if (!stolen.ok) expect(stolen.error).toBe(ACTION_ERROR.marketNotYours);
    expect(listMarket(sellerId).some((l) => l.id === listingId && l.mine)).toBe(
      true,
    );

    // Clean up so TTL / leftover listings do not leak into later asserts.
    expect(cancelMarketListing(sellerId, listingId).ok).toBe(true);
  });

  it("rejects buy after TTL expiry (edge)", () => {
    const pid = getPlayerState(sellerId)!.playerId;
    addItem(pid, "cloth", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 5 })
      .where(eq(players.userId, sellerId))
      .run();
    const t0 = Date.now();
    const created = createMarketListing(sellerId, "cloth", 1, 7, t0);
    expect(created.ok).toBe(true);
    const listingId = created.listingId!;

    db.update(players)
      .set({ softCurrency: 50 })
      .where(eq(players.userId, buyerId))
      .run();
    const late = buyMarketListing(
      buyerId,
      listingId,
      t0 + MARKET.listingTtlMs + 2,
    );
    expect(late.ok).toBe(false);
    if (!late.ok) {
      expect(
        late.error === ACTION_ERROR.marketExpired ||
          late.error === ACTION_ERROR.marketNotFound,
      ).toBe(true);
    }
    expect(listMarket(buyerId, t0 + MARKET.listingTtlMs + 3).some((l) => l.id === listingId)).toBe(
      false,
    );
  });
});
