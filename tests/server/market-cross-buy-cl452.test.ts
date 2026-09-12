import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, MARKET, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl452-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL45.2 Market cross-player buy smoke", () => {
  let sellerId = "";
  let buyerId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const s = registerUser(`cl452s_${stamp}`, "password123");
    const b = registerUser(`cl452b_${stamp}`, "password123");
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

  it("lists land craft and second account buys it (happy)", () => {
    expect(getPlayerState(sellerId)!.landKind).toBe("player_land");
    const home = getPlayerState(sellerId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 16);
    addItem(home.playerId, "plank", 6);

    expect(
      placeLandStation(sellerId, "workshop", boardPos(home)).ok,
    ).toBe(true);
    const built = getPlayerState(sellerId)!;
    expect(
      craftRecipeComplete(sellerId, "saw_planks", stationPos(built, "workshop")).ok,
    ).toBe(true);
    expect(
      craftRecipeComplete(
        sellerId,
        "assemble_wood_crate",
        stationPos(built, "workshop"),
      ).ok,
    ).toBe(true);

    expect(travelToLandKind(sellerId, "city").ok).toBe(true);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 40 })
      .where(eq(players.userId, sellerId))
      .run();

    const listed = createMarketListing(sellerId, "wood_crate", 1, 8);
    expect(listed.ok).toBe(true);
    const listingId = listed.listingId!;

    expect(travelToLandKind(buyerId, "city").ok).toBe(true);
    db.update(players)
      .set({ softCurrency: 100 })
      .where(eq(players.userId, buyerId))
      .run();

    const board = listMarket(buyerId);
    expect(board.some((l) => l.id === listingId && !l.mine)).toBe(true);

    const buyerBefore = getPlayerState(buyerId)!;
    const sellerBefore = getPlayerState(sellerId)!;
    expect(buyMarketListing(buyerId, listingId).ok).toBe(true);

    const buyerAfter = getPlayerState(buyerId)!;
    const sellerAfter = getPlayerState(sellerId)!;
    expect(buyerAfter.softCurrency).toBe(buyerBefore.softCurrency - 8);
    expect(sellerAfter.softCurrency).toBe(sellerBefore.softCurrency + 8);
    expect(
      buyerAfter.inventory.some(
        (s) => s.itemId === "wood_crate" && s.qty >= 1,
      ),
    ).toBe(true);
    expect(listMarket(buyerId).some((l) => l.id === listingId)).toBe(false);
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
    expect(
      listMarket(sellerId).some((l) => l.id === listingId && l.mine),
    ).toBe(true);

    expect(cancelMarketListing(sellerId, listingId).ok).toBe(true);
  });
});
