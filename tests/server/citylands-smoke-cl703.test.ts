import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ANIMAL_PEN,
  BUILDER_PLACE_XP,
  ENERGY,
  FOOD_RESTORE,
  MARKET,
  WORLD,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl703-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete, eatFood } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { cleanAnimalPen, feedAnimalPen } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const {
  createMarketListing,
  cancelMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function pos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  return pos(state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 });
}

function clearInv(uid: string, itemId: string) {
  const state = getPlayerState(uid)!;
  const qty = state.inventory
    .filter((s) => s.itemId === itemId)
    .reduce((n, s) => n + s.qty, 0);
  if (qty > 0) removeItem(state.playerId, itemId, qty);
}

/**
 * CL70.3 — phase-16 regression companion after CL67–CL70.
 * Companion: ration/tonic eat, Breeder claim, Explore leather weave/sell, free travel, market cancel.
 */
describe("CityLands CL70.3 regression smoke after CL67–CL70", () => {
  let userId = "";
  let otherId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl703smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    const other = registerUser(`cl703other_${stamp}`, "password123");
    expect(other.ok).toBe(true);
    if (!other.ok) throw new Error("other register failed");
    otherId = userIdFromToken(other.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("eats travel_ration + herbal_tonic for Content Lock energy (happy)", () => {
    expect(FOOD_RESTORE.travel_ration).toBe(ENERGY.rationRestore);
    expect(FOOD_RESTORE.herbal_tonic).toBe(ENERGY.herbalTonicRestore);

    const home = getPlayerState(userId)!;
    clearInv(userId, "travel_ration");
    clearInv(userId, "herbal_tonic");
    addItem(home.playerId, "travel_ration", 1);
    addItem(home.playerId, "herbal_tonic", 1);

    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, home.playerId))
      .run();
    expect(eatFood(userId, "travel_ration").ok).toBe(true);
    expect(getPlayerState(userId)!.energy).toBe(
      Math.min(getPlayerState(userId)!.maxEnergy, 10 + ENERGY.rationRestore),
    );

    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, home.playerId))
      .run();
    const health = getPlayerState(userId)!.health;
    expect(eatFood(userId, "herbal_tonic").ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.energy).toBe(
      Math.min(after.maxEnergy, 10 + ENERGY.herbalTonicRestore),
    );
    expect(after.health).toBe(health);
  });

  it("feeds+cleans pen then claims Animal Breeder at City (happy)", () => {
    if (getPlayerState(userId)!.landKind !== "player_land") {
      expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    }
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 100,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 12);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(userId, "animal_pen", boardPos(home)).ok).toBe(
      true,
    );

    const land = getPlayerState(userId)!;
    const pen = land.buildings.find((b) => b.type === "animal_pen")!;
    addItem(land.playerId, "wheat", ANIMAL_PEN.feedQty);
    expect(feedAnimalPen(userId, pen.id, pos(pen)).ok).toBe(true);

    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, pen.id))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    expect(cleanAnimalPen(userId, pen.id, pos(pen)).ok).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_breeder")!.quest.status,
    ).toBe("ready");
    expect(claimTutorialQuest(userId, "animal_breeder").ok).toBe(true);
  });

  it("hunts Explore leather → land weave + Explore premium sell (happy)", () => {
    const recipe = getRecipe("weave_cloth")!;
    expect(recipe.inputs).toEqual([{ itemId: "leather", qty: 2 }]);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    clearInv(userId, "leather");
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    const trails = explore.buildings.filter((b) => b.type === "game_trail");
    expect(trails.length).toBeGreaterThanOrEqual(2);
    expect(huntTrail(userId, trails[0]!.id, pos(trails[0]!)).ok).toBe(true);
    expect(huntTrail(userId, trails[1]!.id, pos(trails[1]!)).ok).toBe(true);
    expect(
      (getPlayerState(userId)!.inventory.find((s) => s.itemId === "leather")
        ?.qty ?? 0) >= 2,
    ).toBe(true);

    const exploreRate = getVendorPrices("explore").sell.leather!;
    const cityRate = getVendorPrices("city").sell.leather!;
    expect(exploreRate).toBeGreaterThan(cityRate);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    addItem(getPlayerState(userId)!.playerId, "leather", 1);
    const coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "leather", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + exploreRate);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const land = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 100, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wood", 8);
    addItem(land.playerId, "plank", 2);
    if (!land.buildings.some((b) => b.type === "loom")) {
      expect(placeLandStation(userId, "loom", boardPos(land)).ok).toBe(true);
    }
    const loom = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "loom",
    )!;
    clearInv(userId, "cloth");
    const weaverBefore = getPlayerState(userId)!.weaverXp;
    // Reason: ensure ≥2 leather after premium sell consumed one trail stack.
    const leatherQty =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "leather")
        ?.qty ?? 0;
    if (leatherQty < 2) addItem(getPlayerState(userId)!.playerId, "leather", 2 - leatherQty);
    expect(craftRecipeComplete(userId, "weave_cloth", pos(loom)).ok).toBe(true);
    expect(getPlayerState(userId)!.weaverXp).toBeGreaterThan(weaverBefore);
  });

  it("circuits four maps fare-free and cancels market escrow (happy)", () => {
    const coins = getPlayerState(userId)!.softCurrency;
    for (const kind of [
      "city",
      "player_land",
      "explore",
      "warrior",
      "city",
    ] as const) {
      expect(travelToLandKind(userId, kind).ok).toBe(true);
      expect(getPlayerState(userId)!.landKind).toBe(kind);
      expect(getPlayerState(userId)!.travelArriveAt).toBeNull();
      expect(getPlayerState(userId)!.softCurrency).toBe(coins);
    }

    const pid = getPlayerState(userId)!.playerId;
    addItem(pid, "plank", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 10 })
      .where(eq(players.id, pid))
      .run();
    const before =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0;
    const listed = createMarketListing(userId, "plank", 1, 6);
    expect(listed.ok).toBe(true);
    const listingId = listed.listingId!;
    const mid =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0;
    expect(mid).toBe(before - 1);
    expect(cancelMarketListing(userId, listingId).ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0,
    ).toBe(mid + 1);
    expect(listMarket(userId).some((l) => l.id === listingId)).toBe(false);
  });

  it("refuses empty eat, already-here travel, cancel-not-yours (failure)", () => {
    clearInv(userId, "travel_ration");
    const empty = eatFood(userId, "travel_ration");
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error).toBe(ACTION_ERROR.noFood);

    expect(getPlayerState(userId)!.landKind).toBe("city");
    const again = travelToLandKind(userId, "city");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.travelAlreadyHere);

    const pid = getPlayerState(userId)!.playerId;
    addItem(pid, "cloth", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 5 })
      .where(eq(players.id, pid))
      .run();
    const listed = createMarketListing(userId, "cloth", 1, 4);
    expect(listed.ok).toBe(true);
    expect(travelToLandKind(otherId, "city").ok).toBe(true);
    const stolen = cancelMarketListing(otherId, listed.listingId!);
    expect(stolen.ok).toBe(false);
    if (!stolen.ok) expect(stolen.error).toBe(ACTION_ERROR.marketNotYours);
    expect(cancelMarketListing(userId, listed.listingId!).ok).toBe(true);
  });
});
