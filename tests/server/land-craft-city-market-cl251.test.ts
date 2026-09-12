import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, MARKET, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl251-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { createMarketListing, listMarket } = await import(
  "../../apps/server/src/game/actions/market.ts"
);
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

describe("CityLands CL25.1 list land craft on City market smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl251_${Date.now().toString(36)}`,
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

  it("crafts plank+cloth on land, travels City, lists plank/cloth/fish (happy)", () => {
    expect(getPlayerState(userId)!.landKind).toBe("player_land");
    const home = getPlayerState(userId)!;
    const pos = boardPos(home);
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    // Place cost mats (workshop/loom need wood+plank) + craft inputs.
    addItem(home.playerId, "wood", 20);
    addItem(home.playerId, "plank", 6);
    addItem(home.playerId, "leather", 4);

    expect(placeLandStation(userId, "workshop", pos).ok).toBe(true);
    expect(placeLandStation(userId, "loom", pos).ok).toBe(true);
    const built = getPlayerState(userId)!;
    expect(built.buildings.some((b) => b.type === "workshop")).toBe(true);
    expect(built.buildings.some((b) => b.type === "loom")).toBe(true);

    expect(
      craftRecipeComplete(userId, "saw_planks", stationPos(built, "workshop")).ok,
    ).toBe(true);
    expect(
      craftRecipeComplete(userId, "weave_cloth", stationPos(built, "loom")).ok,
    ).toBe(true);
    // Fish is catch/gather produce — still lists with land crafts (CL23.2).
    addItem(built.playerId, "fish", 2);

    const afterCraft = getPlayerState(userId)!;
    expect(
      afterCraft.inventory.some((s) => s.itemId === "plank" && s.qty >= 1),
    ).toBe(true);
    expect(
      afterCraft.inventory.some((s) => s.itemId === "cloth" && s.qty >= 1),
    ).toBe(true);
    expect(
      afterCraft.inventory.some((s) => s.itemId === "fish" && s.qty >= 1),
    ).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    expect(city.buildings.some((b) => b.type === "market_board")).toBe(true);

    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins * 3 + 10 })
      .where(eq(players.userId, userId))
      .run();

    const qtyOf = (itemId: string) =>
      getPlayerState(userId)!.inventory.find((s) => s.itemId === itemId)?.qty ??
      0;
    const plankBefore = qtyOf("plank");
    const clothBefore = qtyOf("cloth");
    const fishBefore = qtyOf("fish");
    expect(plankBefore).toBeGreaterThanOrEqual(1);
    expect(clothBefore).toBeGreaterThanOrEqual(1);
    expect(fishBefore).toBe(2);

    expect(createMarketListing(userId, "plank", 1, 5).ok).toBe(true);
    expect(createMarketListing(userId, "cloth", 1, 6).ok).toBe(true);
    expect(createMarketListing(userId, "fish", 1, 4).ok).toBe(true);

    const board = listMarket(userId);
    expect(board.some((l) => l.itemId === "plank" && l.mine)).toBe(true);
    expect(board.some((l) => l.itemId === "cloth" && l.mine)).toBe(true);
    expect(board.some((l) => l.itemId === "fish" && l.mine)).toBe(true);
    expect(qtyOf("plank")).toBe(plankBefore - 1);
    expect(qtyOf("cloth")).toBe(clothBefore - 1);
    expect(qtyOf("fish")).toBe(fishBefore - 1);
  });

  it("allows listing without city gate — escrow is global (edge)", () => {
    // Choice: createMarketListing is not map-gated (walk-up board is UX);
    // assert land craft goods remain listable after return to player_land.
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const pid = getPlayerState(userId)!.playerId;
    addItem(pid, "plank", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 5 })
      .where(eq(players.userId, userId))
      .run();
    expect(createMarketListing(userId, "plank", 1, 3).ok).toBe(true);
    expect(listMarket(userId).some((l) => l.itemId === "plank" && l.mine)).toBe(
      true,
    );
  });

  it("rejects market list with bad qty (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const pid = getPlayerState(userId)!.playerId;
    addItem(pid, "cloth", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 5 })
      .where(eq(players.userId, userId))
      .run();
    const bad = createMarketListing(userId, "cloth", 0, 5);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBe(ACTION_ERROR.marketInvalid);
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === "cloth"),
    ).toBe(true);
  });
});
