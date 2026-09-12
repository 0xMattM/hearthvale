import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, BUILDER_PLACE_XP, MARKET, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl332-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL33.2 market list tonic/bandage smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl332_${Date.now().toString(36)}`, "password123");
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

  it("crafts tonic+bandage on land, travels City, lists both (happy)", () => {
    expect(getPlayerState(userId)!.landKind).toBe("player_land");
    const home = getPlayerState(userId)!;
    const pos = boardPos(home);
    db.update(players)
      .set({
        softCurrency: 300,
        energy: 100,
        // Reason: CL36.3 — alchemy_bench (and loom) need builder XP to place.
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 24);
    addItem(home.playerId, "plank", 8);
    addItem(home.playerId, "iron_ore", 2);
    addItem(home.playerId, "leather", 4);
    addItem(home.playerId, "wheat", 4);
    addItem(home.playerId, "cloth", 2);

    expect(placeLandStation(userId, "alchemy_bench", pos).ok).toBe(true);
    expect(placeLandStation(userId, "loom", pos).ok).toBe(true);
    const built = getPlayerState(userId)!;
    expect(built.buildings.some((b) => b.type === "alchemy_bench")).toBe(true);
    expect(built.buildings.some((b) => b.type === "loom")).toBe(true);

    expect(
      craftRecipeComplete(
        userId,
        "brew_herbal_tonic",
        stationPos(built, "alchemy_bench"),
      ).ok,
    ).toBe(true);
    expect(
      craftRecipeComplete(userId, "weave_cloth_bandage", stationPos(built, "loom")).ok,
    ).toBe(true);

    const afterCraft = getPlayerState(userId)!;
    expect(
      afterCraft.inventory.some((s) => s.itemId === "herbal_tonic"),
    ).toBe(true);
    expect(
      afterCraft.inventory.some((s) => s.itemId === "cloth_bandage"),
    ).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    expect(city.buildings.some((b) => b.type === "market_board")).toBe(true);

    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins * 2 + 10 })
      .where(eq(players.userId, userId))
      .run();

    const qtyOf = (itemId: string) =>
      getPlayerState(userId)!.inventory.find((s) => s.itemId === itemId)?.qty ??
      0;
    const tonicBefore = qtyOf("herbal_tonic");
    const bandageBefore = qtyOf("cloth_bandage");
    expect(tonicBefore).toBeGreaterThanOrEqual(1);
    expect(bandageBefore).toBeGreaterThanOrEqual(1);

    expect(createMarketListing(userId, "herbal_tonic", 1, 7).ok).toBe(true);
    expect(createMarketListing(userId, "cloth_bandage", 1, 5).ok).toBe(true);

    const board = listMarket(userId);
    expect(board.some((l) => l.itemId === "herbal_tonic" && l.mine)).toBe(true);
    expect(board.some((l) => l.itemId === "cloth_bandage" && l.mine)).toBe(
      true,
    );
    expect(qtyOf("herbal_tonic")).toBe(tonicBefore - 1);
    expect(qtyOf("cloth_bandage")).toBe(bandageBefore - 1);
  });

  it("allows listing tonic without city gate — escrow is global (edge)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const pid = getPlayerState(userId)!.playerId;
    addItem(pid, "herbal_tonic", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 5 })
      .where(eq(players.userId, userId))
      .run();
    expect(createMarketListing(userId, "herbal_tonic", 1, 4).ok).toBe(true);
    expect(
      listMarket(userId).some((l) => l.itemId === "herbal_tonic" && l.mine),
    ).toBe(true);
  });

  it("rejects market list with bad qty (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const pid = getPlayerState(userId)!.playerId;
    addItem(pid, "cloth_bandage", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 5 })
      .where(eq(players.userId, userId))
      .run();
    const bad = createMarketListing(userId, "cloth_bandage", 0, 5);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBe(ACTION_ERROR.marketInvalid);
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === "cloth_bandage"),
    ).toBe(true);
  });
});
