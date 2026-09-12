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
  `game-cl903-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherFish } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { sendMail, cancelMail, listMail } = await import(
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
const { players } = await import("../../apps/server/src/db/schema.ts");

const FLOUR_SELL = 5;
const WOOD: ItemId = "wood";

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
 * CL90.3 — phase-21 regression companion after CL87–CL90.
 * Companion: city scarce busy + land unlimited, Fisher/Alchemist claims, flour sink,
 * Explore wood premium, mail/market cancel, notice/warrior.
 */
describe("CityLands CL90.3 regression smoke after CL87–CL90", () => {
  let userId = "";
  let peerId = "";
  let peerName = "";
  let receiverId = "";
  let receiverName = "";
  let otherId = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl903smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    peerName = `cl903peer_${stamp}`;
    const peer = registerUser(peerName, "password123");
    expect(peer.ok).toBe(true);
    if (!peer.ok) throw new Error("peer register failed");
    peerId = userIdFromToken(peer.token)!;

    receiverName = `cl903recv_${stamp}`;
    const recv = registerUser(receiverName, "password123");
    expect(recv.ok).toBe(true);
    if (!recv.ok) throw new Error("receiver register failed");
    receiverId = userIdFromToken(recv.token)!;

    const other = registerUser(`cl903oth_${stamp}`, "password123");
    expect(other.ok).toBe(true);
    if (!other.ok) throw new Error("other register failed");
    otherId = userIdFromToken(other.token)!;

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

  it("Fisher + Alchemist tutor claims after land paths; flour City sink (happy)", () => {
    // Fisher: land dock catch → City claim (parity with CL88.1).
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    clearInv(userId, "fish");
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    let land = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wood", 10);
    addItem(land.playerId, "plank", 4);
    if (!land.buildings.some((b) => b.type === "fishing_dock")) {
      expect(
        placeLandStation(userId, "fishing_dock", boardPos(land)).ok,
      ).toBe(true);
    }
    clearInv(userId, "fish");
    land = getPlayerState(userId)!;
    const dock = land.buildings.find((b) => b.type === "fishing_dock")!;
    expect(gatherFish(userId, dock.id, pos(dock)).ok).toBe(true);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "ready",
    );
    expect(claimTutorialQuest(userId, "fisher").ok).toBe(true);

    // Alchemist: land brew_herbal_tonic → City claim (parity with CL88.2).
    clearInv(userId, "herbal_tonic");
    db.update(players)
      .set({ alchemistXp: 0 })
      .where(eq(players.userId, userId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "active",
    );
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    land = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
        alchemistXp: 0,
      })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wood", 6);
    addItem(land.playerId, "iron_ore", 1);
    addItem(land.playerId, "wheat", 2);
    addItem(land.playerId, "leather", 1);
    if (!land.buildings.some((b) => b.type === "alchemy_bench")) {
      expect(
        placeLandStation(userId, "alchemy_bench", boardPos(land)).ok,
      ).toBe(true);
    }
    clearInv(userId, "herbal_tonic");
    db.update(players)
      .set({ alchemistXp: 0, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    const bench = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "alchemy_bench",
    )!;
    addItem(getPlayerState(userId)!.playerId, "wheat", 2);
    addItem(getPlayerState(userId)!.playerId, "leather", 1);
    expect(getRecipe("brew_herbal_tonic")!.station).toBe("alchemy_bench");
    expect(
      craftRecipeComplete(userId, "brew_herbal_tonic", pos(bench)).ok,
    ).toBe(true);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "ready",
    );
    expect(claimTutorialQuest(userId, "alchemist").ok).toBe(true);

    // Flour sink @5.
    expect(getVendorPrices("city").sell.flour).toBe(FLOUR_SELL);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    clearInv(userId, "flour");
    addItem(getPlayerState(userId)!.playerId, "flour", 1);
    const coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "flour", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + FLOUR_SELL);
  });

  it("Explore wood premium + mail cancel + market cancel (happy)", () => {
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain(WOOD);
    const cityWood = getVendorPrices("city").sell[WOOD]!;
    const exploreWood = getVendorPrices("explore").sell[WOOD]!;
    expect(exploreWood).toBeGreaterThan(cityWood);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    clearInv(userId, WOOD);
    addItem(getPlayerState(userId)!.playerId, WOOD, 1);
    const coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, WOOD, 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + cityWood);

    addItem(getPlayerState(userId)!.playerId, "cloth_bandage", 1);
    const beforeQty =
      getPlayerState(userId)!.inventory.find(
        (i) => i.itemId === "cloth_bandage",
      )?.qty ?? 0;
    expect(
      sendMail(
        userId,
        receiverName,
        [{ itemId: "cloth_bandage", qty: 1 }],
        0,
        "CL90.3 cancel me",
      ).ok,
    ).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.find(
        (i) => i.itemId === "cloth_bandage",
      )?.qty ?? 0,
    ).toBe(beforeQty - 1);
    const pending = listMail(userId).find(
      (m) =>
        m.direction === "sent" &&
        m.status === "pending" &&
        m.subject === "CL90.3 cancel me",
    )!;
    const midQty =
      getPlayerState(userId)!.inventory.find(
        (i) => i.itemId === "cloth_bandage",
      )?.qty ?? 0;
    expect(cancelMail(userId, pending.id).ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.find(
        (i) => i.itemId === "cloth_bandage",
      )?.qty ?? 0,
    ).toBe(midQty + 1);

    const pid = getPlayerState(userId)!.playerId;
    addItem(pid, "plank", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.id, pid))
      .run();
    const listed = createMarketListing(userId, "plank", 1, 5);
    expect(listed.ok).toBe(true);
    const midPlank =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0;
    expect(cancelMarketListing(userId, listed.listingId!).ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0,
    ).toBe(midPlank + 1);
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

  it("refuses empty flour sell, mail cancel-not-yours, market cancel-not-yours (failure)", () => {
    if (getPlayerState(userId)!.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    clearInv(userId, "flour");
    const empty = vendorSell(userId, "flour", 1, pos(stall));
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error).toBe(ACTION_ERROR.notEnoughItems);

    addItem(getPlayerState(userId)!.playerId, "flour", 1);
    expect(
      sendMail(
        userId,
        receiverName,
        [{ itemId: "flour", qty: 1 }],
        0,
        "CL90.3 not yours",
      ).ok,
    ).toBe(true);
    const pending = listMail(userId).find(
      (m) =>
        m.direction === "sent" &&
        m.status === "pending" &&
        m.subject === "CL90.3 not yours",
    )!;
    const stolenMail = cancelMail(otherId, pending.id);
    expect(stolenMail.ok).toBe(false);
    if (!stolenMail.ok) expect(stolenMail.error).toBe(ACTION_ERROR.mailOnlySender);
    expect(cancelMail(userId, pending.id).ok).toBe(true);

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
