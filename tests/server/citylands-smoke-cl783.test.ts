import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  EXPLORE_VENDOR_PREMIUM_SELL_ITEMS,
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
  `game-cl783-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete } = await import(
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
const { sendMail, cancelMail, listMail } = await import(
  "../../apps/server/src/game/mail.ts"
);
const {
  createTradeOffer,
  acceptTrade,
} = await import("../../apps/server/src/game/actions/trade.ts");
const {
  createMarketListing,
  buyMarketListing,
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

const FLOUR_SELL = 5;
const BANDAGE_SELL = 2;
const PLANK_SELL = 4;
const WOOD_ITEM: ItemId = "wood";

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
 * CL78.3 — phase-18 regression companion after CL75–CL78.
 * Companion: flour/bandage/plank sinks, mail cancel + trade/market buy,
 * Explore wood premium, XP gates, homestead hunt refuse, min HUD + free travel.
 */
describe("CityLands CL78.3 regression smoke after CL75–CL78", () => {
  let userId = "";
  let peerId = "";
  let peerName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl783smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    peerName = `cl783peer_${stamp}`;
    const peer = registerUser(peerName, "password123");
    expect(peer.ok).toBe(true);
    if (!peer.ok) throw new Error("peer register failed");
    peerId = userIdFromToken(peer.token)!;

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(travelToLandKind(peerId, "city").ok).toBe(true);
    cityLandId = getPlayerState(userId)!.landId;
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

  it("sells flour/bandage/plank at City Content Lock rates (happy)", () => {
    expect(getVendorPrices("city").sell.flour).toBe(FLOUR_SELL);
    expect(getVendorPrices("city").sell.cloth_bandage).toBe(BANDAGE_SELL);
    expect(getVendorPrices("city").sell.plank).toBe(PLANK_SELL);

    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const pid = getPlayerState(userId)!.playerId;
    clearInv(userId, "flour");
    clearInv(userId, "cloth_bandage");
    clearInv(userId, "plank");
    addItem(pid, "flour", 1);
    addItem(pid, "cloth_bandage", 1);
    addItem(pid, "plank", 1);

    let coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "flour", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + FLOUR_SELL);
    coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "cloth_bandage", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + BANDAGE_SELL);
    coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "plank", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + PLANK_SELL);
  });

  it("mail cancel restores escrow; nearby trade accept; market cross-buy (happy)", () => {
    const senderPid = getPlayerState(userId)!.playerId;
    addItem(senderPid, "wheat", 1);
    const beforeQty =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0;
    expect(
      sendMail(
        userId,
        peerName,
        [{ itemId: "wheat", qty: 1 }],
        0,
        "CL78.3 cancel",
      ).ok,
    ).toBe(true);
    const pending = listMail(userId).find(
      (m) => m.direction === "sent" && m.status === "pending",
    )!;
    expect(cancelMail(userId, pending.id).ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0,
    ).toBe(beforeQty);

    reportPresence({
      userId,
      username: getPlayerState(userId)!.username,
      landId: cityLandId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: cityLandId,
      x: TRADE_PING_RANGE / 2,
      z: 0,
    });
    expect(arePlayersNearbyForTrade(userId, peerId)).toBe(true);

    addItem(senderPid, "leather", 1);
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
    expect(
      getPlayerState(peerId)!.inventory.some(
        (s) => s.itemId === "leather" && s.qty >= 1,
      ),
    ).toBe(true);

    addItem(senderPid, "plank", 1);
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
  });

  it("Explore wood premium + XP gates OK with enough XP; homestead hunt refuse (happy)", () => {
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain(WOOD_ITEM);
    const cityRate = getVendorPrices("city").sell[WOOD_ITEM]!;
    const exploreRate = getVendorPrices("explore").sell[WOOD_ITEM]!;
    expect(exploreRate).toBeGreaterThan(cityRate);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    clearInv(userId, WOOD_ITEM);
    addItem(getPlayerState(userId)!.playerId, WOOD_ITEM, 1);
    const coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, WOOD_ITEM, 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + cityRate);

    expect(getRecipe("pack_travel_ration")!.minProfessionXp).toBe(25);
    expect(getRecipe("forge_iron_hammer")!.minProfessionXp).toBe(20);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
        cookXp: 25,
        blacksmithXp: 20,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "iron_bar", 4);
    addItem(home.playerId, "iron_ore", 1);
    if (!home.buildings.some((b) => b.type === "kitchen")) {
      expect(placeLandStation(userId, "kitchen", boardPos(home)).ok).toBe(
        true,
      );
    }
    const land = getPlayerState(userId)!;
    if (!land.buildings.some((b) => b.type === "forge")) {
      expect(placeLandStation(userId, "forge", boardPos(land)).ok).toBe(true);
    }
    const kitchen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    const forge = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "forge",
    )!;
    addItem(getPlayerState(userId)!.playerId, "bread", 1);
    addItem(getPlayerState(userId)!.playerId, "cooked_meat", 1);
    addItem(getPlayerState(userId)!.playerId, "iron_bar", 2);
    expect(
      craftRecipeComplete(userId, "pack_travel_ration", pos(kitchen)).ok,
    ).toBe(true);
    expect(
      craftRecipeComplete(userId, "forge_iron_hammer", pos(forge)).ok,
    ).toBe(true);

    expect(home.buildings.some((b) => b.type === "game_trail")).toBe(false);
    const fake = getPlayerState(userId)!.buildings[0]!;
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    const refused = huntTrail(userId, fake.id, pos(fake));
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe(ACTION_ERROR.huntExploreOnly);
    }
  });

  it("keeps min HUD closed panels + Free travel portal prompt; fare-free hop (happy)", () => {
    expect(defaultClosedPanelIds()).toContain("craft");
    expect(defaultClosedPanelIds()).toContain("notice");
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
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    expect(travelToLandKind(userId, "warrior").ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins);
    expect(getPlayerState(userId)!.travelArriveAt).toBeNull();
  });

  it("refuses empty flour sell, under-gated ration, own market list, already-here (failure)", () => {
    const fresh = registerUser(
      `cl783f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    const stall = getPlayerState(other)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    clearInv(other, "flour");
    const emptySell = vendorSell(other, "flour", 1, pos(stall));
    expect(emptySell.ok).toBe(false);
    if (!emptySell.ok) {
      expect(emptySell.error).toBe(ACTION_ERROR.notEnoughItems);
    }

    const kitchen = getPlayerState(other)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    db.update(players)
      .set({ cookXp: 24, energy: 100 })
      .where(eq(players.userId, other))
      .run();
    addItem(getPlayerState(other)!.playerId, "bread", 1);
    addItem(getPlayerState(other)!.playerId, "cooked_meat", 1);
    const under = craftRecipeComplete(other, "pack_travel_ration", pos(kitchen));
    expect(under.ok).toBe(false);
    if (!under.ok) {
      expect(under.error).toBe(ACTION_ERROR.needsXp("Cook", 25));
    }

    addItem(getPlayerState(other)!.playerId, "plank", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 10 })
      .where(eq(players.userId, other))
      .run();
    const listed = createMarketListing(other, "plank", 1, 5);
    expect(listed.ok).toBe(true);
    const own = buyMarketListing(other, listed.listingId!);
    expect(own.ok).toBe(false);
    if (!own.ok) expect(own.error).toBe(ACTION_ERROR.marketOwnListing);

    expect(getPlayerState(other)!.landKind).toBe("city");
    const again = travelToLandKind(other, "city");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
  });
});
