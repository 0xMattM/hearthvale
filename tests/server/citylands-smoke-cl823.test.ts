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
  arenaInteractPrompt,
  cityNoticeBoardTips,
  getRecipe,
  getVendorPrices,
  type ItemId,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl823-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { plantCrop, harvestCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { sendMail, claimMail, listMail } = await import(
  "../../apps/server/src/game/mail.ts"
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
const { isCityStationContendedByOther } = await import(
  "../../apps/server/src/game/stationContention.ts"
);
const {
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

const BREAD_SELL = 3;
const LEATHER: ItemId = "leather";
const ORE: ItemId = "iron_ore";

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
 * CL82.3 — phase-19 regression companion after CL79–CL82.
 * Companion: city scarce busy + land unlimited, Farmer/Weaver claims, bread sink,
 * Explore premium, mail claim + market cancel, notice/warrior.
 */
describe("CityLands CL82.3 regression smoke after CL79–CL82", () => {
  let userId = "";
  let peerId = "";
  let peerName = "";
  let receiverId = "";
  let receiverName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl823smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    peerName = `cl823peer_${stamp}`;
    const peer = registerUser(peerName, "password123");
    expect(peer.ok).toBe(true);
    if (!peer.ok) throw new Error("peer register failed");
    peerId = userIdFromToken(peer.token)!;

    receiverName = `cl823recv_${stamp}`;
    const recv = registerUser(receiverName, "password123");
    expect(recv.ok).toBe(true);
    if (!recv.ok) throw new Error("receiver register failed");
    receiverId = userIdFromToken(recv.token)!;

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

  it("city kitchen stationBusy with peer; land kitchen ignores peer (happy)", () => {
    const city = getPlayerState(userId)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    const kitchenPos = pos(kitchen);
    reportPresence({
      userId,
      username: getPlayerState(userId)!.username,
      landId: cityLandId,
      x: kitchenPos.x,
      z: kitchenPos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        kitchen.x,
        kitchen.z,
        peerId,
      ),
    ).toBe(true);
    addItem(getPlayerState(peerId)!.playerId, "fish", 1);
    const blocked = craftRecipeComplete(peerId, "cook_fish", kitchenPos);
    expect(blocked.ok).toBe(true);

    resetPresence();
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 8);
    if (!getPlayerState(userId)!.buildings.some((b) => b.type === "kitchen")) {
      expect(placeLandStation(userId, "kitchen", boardPos(home)).ok).toBe(
        true,
      );
    }
    const landKitchen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    const landPos = pos(landKitchen);
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: getPlayerState(userId)!.landId,
      x: landPos.x,
      z: landPos.z,
    });
    expect(
      isCityStationContendedByOther(
        "player_land",
        getPlayerState(userId)!.landId,
        landKitchen.x,
        landKitchen.z,
        userId,
      ),
    ).toBe(false);
    addItem(getPlayerState(userId)!.playerId, "fish", 1);
    expect(craftRecipeComplete(userId, "cook_fish", landPos).ok).toBe(true);
  });

  it("Farmer + Weaver tutor claims after land paths; bread City sink (happy)", () => {
    // Farmer: clear proxies then plant→harvest (parity with CL80.1).
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(claimTutorialQuest(userId, "mayor").ok).toBe(true);
    for (const id of ["wheat", "flour"] as const) clearInv(userId, id);
    db.update(players)
      .set({ farmerXp: 0 })
      .where(eq(players.userId, userId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    let land = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
        farmerXp: 0,
      })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wood", 8);
    addItem(land.playerId, "wheat_seed", 1);
    if (!land.buildings.some((b) => b.type === "crop_plot")) {
      expect(placeLandStation(userId, "crop_plot", boardPos(land)).ok).toBe(
        true,
      );
    }
    for (const id of ["wheat", "flour"] as const) clearInv(userId, id);
    land = getPlayerState(userId)!;
    const plot = land.buildings.find((b) => b.type === "crop_plot")!;
    db.update(players)
      .set({ energy: 100, farmerXp: 0 })
      .where(eq(players.id, land.playerId))
      .run();
    expect(
      plantCrop(userId, plot.id, "wheat_seed", pos(plot)).ok,
    ).toBe(true);
    db.update(buildings)
      .set({ readyAt: Date.now() - 1000 })
      .where(eq(buildings.id, plot.id))
      .run();
    expect(harvestCrop(userId, plot.id, pos(plot)).ok).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "ready",
    );
    expect(claimTutorialQuest(userId, "farmer").ok).toBe(true);

    // Weaver: land loom weave_cloth (parity with CL80.2).
    clearInv(userId, "cloth");
    db.update(players)
      .set({ weaverXp: 0 })
      .where(eq(players.userId, userId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "weaver")!.quest.status).toBe(
      "active",
    );
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    land = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wood", 8);
    addItem(land.playerId, "plank", 4);
    if (!land.buildings.some((b) => b.type === "loom")) {
      expect(placeLandStation(userId, "loom", boardPos(land)).ok).toBe(true);
    }
    clearInv(userId, "cloth");
    db.update(players)
      .set({ weaverXp: 0, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    const loom = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "loom",
    )!;
    addItem(getPlayerState(userId)!.playerId, "leather", 2);
    expect(getRecipe("weave_cloth")!.station).toBe("loom");
    expect(craftRecipeComplete(userId, "weave_cloth", pos(loom)).ok).toBe(true);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "weaver")!.quest.status).toBe(
      "ready",
    );
    expect(claimTutorialQuest(userId, "weaver").ok).toBe(true);

    // Bread sink @3.
    expect(getVendorPrices("city").sell.bread).toBe(BREAD_SELL);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    clearInv(userId, "bread");
    addItem(getPlayerState(userId)!.playerId, "bread", 1);
    const coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "bread", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + BREAD_SELL);
  });

  it("Explore leather/ore premium + mail claim + market cancel (happy)", () => {
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain(LEATHER);
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain(ORE);
    const cityLeather = getVendorPrices("city").sell[LEATHER]!;
    const exploreLeather = getVendorPrices("explore").sell[LEATHER]!;
    const cityOre = getVendorPrices("city").sell[ORE]!;
    const exploreOre = getVendorPrices("explore").sell[ORE]!;
    expect(exploreLeather).toBeGreaterThan(cityLeather);
    expect(exploreOre).toBeGreaterThan(cityOre);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    clearInv(userId, LEATHER);
    clearInv(userId, ORE);
    addItem(getPlayerState(userId)!.playerId, LEATHER, 1);
    addItem(getPlayerState(userId)!.playerId, ORE, 1);
    let coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, LEATHER, 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + cityLeather);
    coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, ORE, 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + cityOre);

    addItem(getPlayerState(userId)!.playerId, "wheat", 2);
    const wheatBefore =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0;
    expect(
      sendMail(
        userId,
        receiverName,
        [{ itemId: "wheat", qty: 1 }],
        3,
        "CL82.3 parcel",
      ).ok,
    ).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0,
    ).toBe(wheatBefore - 1);
    const inbox = listMail(receiverId).find(
      (m) => m.direction === "inbox" && m.status === "pending",
    )!;
    const recvCoins = getPlayerState(receiverId)!.softCurrency;
    expect(claimMail(receiverId, inbox.id).ok).toBe(true);
    expect(getPlayerState(receiverId)!.softCurrency).toBe(recvCoins + 3);

    const pid = getPlayerState(userId)!.playerId;
    addItem(pid, "plank", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.id, pid))
      .run();
    const listed = createMarketListing(userId, "plank", 1, 5);
    expect(listed.ok).toBe(true);
    const midQty =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0;
    expect(cancelMarketListing(userId, listed.listingId!).ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0,
    ).toBe(midQty + 1);
    expect(
      listMarket(userId).some((l) => l.id === listed.listingId),
    ).toBe(false);
  });

  it("keeps scarce_stations + warrior optional tip / plaque copy (happy)", () => {
    const tips = cityNoticeBoardTips();
    expect(tips.map((t) => t.id)).toContain("scarce_stations");
    expect(tips.map((t) => t.id)).toContain("warrior_optional");
    const scarce = tips.find((t) => t.id === "scarce_stations")!;
    expect(scarce.body.toLowerCase()).toMatch(/scarce|shared|limited/);
    expect(scarce.body.toLowerCase()).toMatch(/your land|unlimited/);
    const warrior = tips.find((t) => t.id === "warrior_optional")!;
    expect(warrior.body.toLowerCase()).toMatch(/optional|not required/);
    expect(warrior.body).not.toMatch(/\d+\s*(dmg|hp|defense|dps)/i);
    expect(arenaInteractPrompt().toLowerCase()).toMatch(/optional/);
    expect(arenaInteractPrompt().toLowerCase()).toMatch(/no ladder/);
  });

  it("refuses empty bread sell, already-claimed mail, cancel-not-yours (failure)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    clearInv(userId, "bread");
    const empty = vendorSell(userId, "bread", 1, pos(stall));
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error).toBe(ACTION_ERROR.notEnoughItems);

    const claimed = listMail(receiverId).find(
      (m) => m.direction === "inbox" && m.status === "claimed",
    );
    expect(claimed).toBeTruthy();
    const again = claimMail(receiverId, claimed!.id);
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.mailAlreadyClaimed);

    const pid = getPlayerState(userId)!.playerId;
    addItem(pid, "cloth", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 5 })
      .where(eq(players.id, pid))
      .run();
    const listed = createMarketListing(userId, "cloth", 1, 4);
    expect(listed.ok).toBe(true);
    if (getPlayerState(peerId)!.landKind !== "city") {
      expect(travelToLandKind(peerId, "city").ok).toBe(true);
    }
    const stolen = cancelMarketListing(peerId, listed.listingId!);
    expect(stolen.ok).toBe(false);
    if (!stolen.ok) expect(stolen.error).toBe(ACTION_ERROR.marketNotYours);
    expect(cancelMarketListing(userId, listed.listingId!).ok).toBe(true);
  });
});
