import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ENERGY,
  FOOD_RESTORE,
  MARKET,
  WORLD,
  formatMinimalHudHint,
  getRecipe,
  getVendorPrices,
  type BuildingDto,
  type ItemId,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import {
  buildingPanelIntent,
  defaultClosedPanelIds,
} from "../../apps/web/lib/hud/panel-orchestration";
import type { InteractTarget } from "../../apps/web/components/land-scene/landProximity";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl863-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherWood } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { getVisitLand } = await import("../../apps/server/src/game/visit.ts");
const {
  createTradeOffer,
  acceptTrade,
} = await import("../../apps/server/src/game/actions/trade.ts");
const {
  createMarketListing,
  buyMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const {
  arePlayersNearbyForTrade,
  TRADE_PING_RANGE,
} = await import("../../apps/server/src/game/tradeInvite.ts");
const {
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

const CRATE_SELL = 3;
const COOKED_FISH_SELL = 4;
const CRATE_ITEM: ItemId = "wood_crate";
const FISH_ITEM: ItemId = "cooked_fish";

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

function buildingTarget(type: BuildingDto["type"]): InteractTarget {
  const building: BuildingDto = {
    id: "b1",
    type,
    slotIndex: 0,
    x: 0,
    z: 0,
    tier: 1,
    cropState: null,
    cropId: null,
    plantedAt: null,
    readyAt: null,
    claim: null,
    tutorialNpcId: null,
  };
  return { kind: "building", dist: 1, building };
}

/**
 * CL86.3 — phase-20 regression companion after CL83–CL86.
 * Companion: Explore→land craft, crate/fish sinks + eat, visit/trade/market, min HUD + free travel.
 */
describe("CityLands CL86.3 regression smoke after CL83–CL86", () => {
  let userId = "";
  let peerId = "";
  let peerName = "";
  let peerLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl863smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    peerName = `cl863peer_${stamp}`;
    const peer = registerUser(peerName, "password123");
    expect(peer.ok).toBe(true);
    if (!peer.ok) throw new Error("peer register failed");
    peerId = userIdFromToken(peer.token)!;

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(travelToLandKind(peerId, "city").ok).toBe(true);

    const peerHome = travelToLandKind(peerId, "player_land");
    if (!peerHome.ok) {
      expect(peerHome.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    peerLandId = getPlayerState(peerId)!.landId;
  });

  afterEach(() => {
    resetPresence();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("Explore wood → land saw_planks (happy craft)", () => {
    const recipe = getRecipe("saw_planks")!;
    expect(recipe.station).toBe("workshop");
    expect(recipe.inputs).toEqual([{ itemId: "wood", qty: 2 }]);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const stumps = explore.buildings.filter((b) => b.type === "tree_stump");
    expect(stumps.length).toBeGreaterThanOrEqual(2);
    clearInv(userId, "wood");
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    expect(gatherWood(userId, stumps[0]!.id, pos(stumps[0]!)).ok).toBe(true);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    expect(gatherWood(userId, stumps[1]!.id, pos(stumps[1]!)).ok).toBe(true);
    const woodQty =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "wood")
        ?.qty ?? 0;
    expect(woodQty).toBeGreaterThanOrEqual(2);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    if (!home.buildings.some((b) => b.type === "workshop")) {
      addItem(home.playerId, "wood", 4);
      addItem(home.playerId, "plank", 2);
      expect(placeLandStation(userId, "workshop", boardPos(home)).ok).toBe(
        true,
      );
    }
    const land = getPlayerState(userId)!;
    const workshop = land.buildings.find((b) => b.type === "workshop")!;
    // Reason: keep Explore wood as saw inputs — trim place leftovers.
    const woodAfter =
      land.inventory.find((i) => i.itemId === "wood")?.qty ?? 0;
    if (woodAfter > woodQty) {
      removeItem(land.playerId, "wood", woodAfter - woodQty);
    }
    clearInv(userId, "plank");
    expect(craftRecipeComplete(userId, "saw_planks", pos(workshop)).ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.some(
        (s) => s.itemId === "plank" && s.qty >= 1,
      ),
    ).toBe(true);
  });

  it("sells crate/fish sinks and eats bread/stew/ration (happy sinks+eat)", () => {
    expect(getVendorPrices("city").sell.wood_crate).toBe(CRATE_SELL);
    expect(getVendorPrices("city").sell.cooked_fish).toBe(COOKED_FISH_SELL);
    expect(FOOD_RESTORE.bread).toBe(ENERGY.breadRestore);
    expect(FOOD_RESTORE.stew).toBe(ENERGY.stewRestore);
    expect(FOOD_RESTORE.travel_ration).toBe(ENERGY.rationRestore);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const pid = getPlayerState(userId)!.playerId;
    clearInv(userId, CRATE_ITEM);
    clearInv(userId, FISH_ITEM);
    addItem(pid, CRATE_ITEM, 1);
    addItem(pid, FISH_ITEM, 1);

    let coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, CRATE_ITEM, 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + CRATE_SELL);
    coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, FISH_ITEM, 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + COOKED_FISH_SELL);

    clearInv(userId, "bread");
    clearInv(userId, "stew");
    clearInv(userId, "travel_ration");
    addItem(pid, "bread", 1);
    addItem(pid, "stew", 1);
    addItem(pid, "travel_ration", 1);
    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, pid))
      .run();
    expect(eatFood(userId, "bread").ok).toBe(true);
    expect(getPlayerState(userId)!.energy).toBe(
      Math.min(getPlayerState(userId)!.maxEnergy, 10 + ENERGY.breadRestore),
    );
    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, pid))
      .run();
    expect(eatFood(userId, "stew").ok).toBe(true);
    expect(getPlayerState(userId)!.energy).toBe(
      Math.min(getPlayerState(userId)!.maxEnergy, 10 + ENERGY.stewRestore),
    );
    db.update(players)
      .set({ energy: 10 })
      .where(eq(players.id, pid))
      .run();
    expect(eatFood(userId, "travel_ration").ok).toBe(true);
    expect(getPlayerState(userId)!.energy).toBe(
      Math.min(getPlayerState(userId)!.maxEnergy, 10 + ENERGY.rationRestore),
    );
  });

  it("visit presence + nearby trade accept + market cross-buy (happy social)", () => {
    const visit = getVisitLand(userId, peerName);
    expect(visit.ok).toBe(true);
    if (!visit.ok) return;
    expect(visit.land.landId).toBe(peerLandId);

    reportPresence({
      userId: peerId,
      username: peerName,
      landId: peerLandId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId,
      username: getPlayerState(userId)!.username,
      landId: peerLandId,
      x: TRADE_PING_RANGE / 2,
      z: 0,
    });
    expect(arePlayersNearbyForTrade(userId, peerId)).toBe(true);

    // Reason: sinks/eat may already leave user on city; peer may be on land.
    const userCity = travelToLandKind(userId, "city");
    if (!userCity.ok) {
      expect(userCity.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    expect(travelToLandKind(peerId, "city").ok).toBe(true);
    const hubId = getPlayerState(userId)!.landId;
    reportPresence({
      userId,
      username: getPlayerState(userId)!.username,
      landId: hubId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: hubId,
      x: TRADE_PING_RANGE / 2,
      z: 0,
    });

    addItem(getPlayerState(userId)!.playerId, "leather", 1);
    const offer = createTradeOffer(
      userId,
      peerName,
      [{ itemId: "leather", qty: 1 }],
      [],
      0,
      0,
    );
    expect(offer.ok).toBe(true);
    expect(acceptTrade(peerId, offer.tradeId!).ok).toBe(true);

    addItem(getPlayerState(userId)!.playerId, "plank", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.userId, userId))
      .run();
    const listed = createMarketListing(userId, "plank", 1, 6);
    expect(listed.ok).toBe(true);
    db.update(players)
      .set({ softCurrency: 50 })
      .where(eq(players.userId, peerId))
      .run();
    expect(buyMarketListing(peerId, listed.listingId!).ok).toBe(true);
    expect(listMarket(peerId).some((l) => l.id === listed.listingId)).toBe(
      false,
    );
  });

  it("keeps min HUD closed panels + Free travel portal; fare-free hop (happy HUD/travel)", () => {
    expect(defaultClosedPanelIds()).toContain("craft");
    expect(defaultClosedPanelIds()).toContain("market");
    expect(buildingPanelIntent({ id: "k1", type: "kitchen" })).toEqual({
      type: "craft",
      station: "kitchen",
      buildingId: "k1",
    });
    expect(
      resolveInteractPrompt({
        target: buildingTarget("portal"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
      })?.label,
    ).toMatch(/Travel · free/i);
    expect(formatMinimalHudHint().toLowerCase()).not.toContain("craft");

    const coins = getPlayerState(userId)!.softCurrency;
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    expect(travelToLandKind(userId, "warrior").ok).toBe(true);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins);
    expect(getPlayerState(userId)!.travelArriveAt).toBeNull();
  });

  it("refuses own-visit, empty crate sell, own market list, already-here (failure)", () => {
    const own = getVisitLand(userId, getPlayerState(userId)!.username);
    expect(own.ok).toBe(false);
    if (!own.ok) expect(own.error).toContain("own land");

    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    clearInv(userId, CRATE_ITEM);
    const emptySell = vendorSell(userId, CRATE_ITEM, 1, pos(stall));
    expect(emptySell.ok).toBe(false);
    if (!emptySell.ok) {
      expect(emptySell.error).toBe(ACTION_ERROR.notEnoughItems);
    }

    addItem(getPlayerState(userId)!.playerId, "plank", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 10 })
      .where(eq(players.userId, userId))
      .run();
    const listed = createMarketListing(userId, "plank", 1, 5);
    expect(listed.ok).toBe(true);
    const ownBuy = buyMarketListing(userId, listed.listingId!);
    expect(ownBuy.ok).toBe(false);
    if (!ownBuy.ok) expect(ownBuy.error).toBe(ACTION_ERROR.marketOwnListing);

    expect(getPlayerState(userId)!.landKind).toBe("city");
    const again = travelToLandKind(userId, "city");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
  });
});
