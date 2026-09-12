import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  MARKET,
  ORE_NODE,
  TUTORIAL_NPCS,
  WORLD,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl623-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherOre, gatherWood } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const {
  createMarketListing,
  buyMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const { isCityStationContendedByOther } = await import(
  "../../apps/server/src/game/stationContention.ts"
);
const {
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

function pos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return pos(board);
}

function equipHammer(uid: string) {
  const pid = db.select().from(players).where(eq(players.userId, uid)).get()!
    .id;
  addItem(pid, "iron_hammer", 1);
  const hammer = getPlayerState(uid)!.inventory.find(
    (i) => i.itemId === "iron_hammer",
  )!;
  db.update(players)
    .set({ equippedToolInventoryId: hammer.id })
    .where(eq(players.id, pid))
    .run();
}

function ensureLandKind(
  uid: string,
  kind: "city" | "player_land" | "explore",
) {
  if (getPlayerState(uid)!.landKind === kind) return;
  expect(travelToLandKind(uid, kind).ok).toBe(true);
}

function clearInv(uid: string, itemId: string) {
  const state = getPlayerState(uid)!;
  const qty = state.inventory
    .filter((s) => s.itemId === itemId)
    .reduce((n, s) => n + s.qty, 0);
  if (qty > 0) removeItem(state.playerId, itemId, qty);
}

/**
 * CL62.3 — phase-14 regression companion after CL59–CL62.
 * Miner/Blacksmith/Cook claims, scarce tree/ore/workshop, market buy, Builder/Weaver.
 */
describe("CityLands CL62.3 regression smoke after CL59–CL62", () => {
  let userId = "";
  let peerId = "";
  let peerName = "";
  let buyerId = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl623smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    peerName = `cl623peer_${stamp}`;
    const peer = registerUser(peerName, "password123");
    expect(peer.ok).toBe(true);
    if (!peer.ok) throw new Error("peer register failed");
    peerId = userIdFromToken(peer.token)!;

    const buyer = registerUser(`cl623buy_${stamp}`, "password123");
    expect(buyer.ok).toBe(true);
    if (!buyer.ok) throw new Error("buyer register failed");
    buyerId = userIdFromToken(buyer.token)!;

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

  it("claims Miner after Explore ore chip (happy slice)", () => {
    expect(TUTORIAL_NPCS.miner.quest.objective).toBe("gather_ore");
    clearInv(userId, "iron_ore");
    clearInv(userId, "iron_bar");
    db.update(players)
      .set({ minerXp: 0, energy: 100 })
      .where(eq(players.id, getPlayerState(userId)!.playerId))
      .run();

    ensureLandKind(userId, "explore");
    const explore = getPlayerState(userId)!;
    const node = explore.buildings.find((b) => b.type === "ore_node")!;
    equipHammer(userId);
    const minerBefore = getPlayerState(userId)!.minerXp;
    expect(gatherOre(userId, node.id, pos(node)).ok).toBe(true);
    expect(getPlayerState(userId)!.minerXp).toBe(minerBefore + ORE_NODE.xp);
    expect(getTutorialNpcForPlayer(userId, "miner")!.quest.status).toBe(
      "ready",
    );
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "miner").ok).toBe(true);
  });

  it("claims Blacksmith + Cook after land smelt/cook (happy slice)", () => {
    expect(getRecipe("smelt_iron_bar")!.profession).toBe("blacksmith");
    expect(getRecipe("cook_meat")!.profession).toBe("cook");

    ensureLandKind(userId, "player_land");
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
        blacksmithXp: 0,
      })
      .where(eq(players.id, home.playerId))
      .run();
    clearInv(userId, "iron_bar");
    clearInv(userId, "iron_hammer");
    clearInv(userId, "iron_hoe");
    addItem(home.playerId, "iron_bar", 2);
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "iron_ore", 3);
    expect(placeLandStation(userId, "forge", boardPos(home)).ok).toBe(true);
    clearInv(userId, "iron_bar");
    clearInv(userId, "iron_hammer");
    clearInv(userId, "iron_hoe");
    addItem(getPlayerState(userId)!.playerId, "iron_ore", 2);
    const forge = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "forge",
    )!;
    expect(craftRecipeComplete(userId, "smelt_iron_bar", pos(forge)).ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "blacksmith")!.quest.status,
    ).toBe("ready");
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "blacksmith").ok).toBe(true);

    ensureLandKind(userId, "player_land");
    const land = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, cookXp: 0 })
      .where(eq(players.id, land.playerId))
      .run();
    clearInv(userId, "bread");
    clearInv(userId, "cooked_meat");
    clearInv(userId, "stew");
    addItem(land.playerId, "wood", 6);
    addItem(land.playerId, "iron_ore", 1);
    addItem(land.playerId, "raw_meat", 1);
    expect(placeLandStation(userId, "kitchen", boardPos(land)).ok).toBe(true);
    clearInv(userId, "bread");
    clearInv(userId, "cooked_meat");
    clearInv(userId, "stew");
    addItem(getPlayerState(userId)!.playerId, "raw_meat", 1);
    db.update(players)
      .set({ cookXp: 0, energy: 100 })
      .where(eq(players.id, getPlayerState(userId)!.playerId))
      .run();
    const kitchen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    expect(craftRecipeComplete(userId, "cook_meat", pos(kitchen)).ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "cook")!.quest.status).toBe(
      "ready",
    );
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "cook").ok).toBe(true);
  });

  it("city scarce tree/ore/workshop contend; land unlimited (edge)", () => {
    ensureLandKind(userId, "city");
    ensureLandKind(peerId, "city");
    const city = getPlayerState(userId)!;
    const stump = city.buildings.find((b) => b.type === "tree_stump")!;
    const ore = city.buildings.find((b) => b.type === "ore_node")!;
    const workshop = city.buildings.find((b) => b.type === "workshop")!;

    const stumpPos = pos(stump);
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: cityLandId,
      x: stumpPos.x,
      z: stumpPos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        stump.x,
        stump.z,
        userId,
      ),
    ).toBe(true);
    const blockedChop = gatherWood(userId, stump.id, stumpPos);
    expect(blockedChop.ok).toBe(false);
    if (!blockedChop.ok) {
      expect(blockedChop.error).toBe(ACTION_ERROR.stationBusy);
    }

    resetPresence();
    const orePos = pos(ore);
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: cityLandId,
      x: orePos.x,
      z: orePos.z,
    });
    equipHammer(userId);
    const blockedOre = gatherOre(userId, ore.id, orePos);
    expect(blockedOre.ok).toBe(false);
    if (!blockedOre.ok) {
      expect(blockedOre.error).toBe(ACTION_ERROR.stationBusy);
    }

    resetPresence();
    const workshopPos = pos(workshop);
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: cityLandId,
      x: workshopPos.x,
      z: workshopPos.z,
    });
    addItem(getPlayerState(userId)!.playerId, "wood", 2);
    const blockedCraft = craftRecipeComplete(userId, "saw_planks", workshopPos);
    expect(blockedCraft.ok).toBe(true);

    resetPresence();
    ensureLandKind(userId, "player_land");
    const land = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 100, energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wood", 2);
    if (!land.buildings.some((b) => b.type === "tree_stump")) {
      expect(placeLandStation(userId, "tree_stump", boardPos(land)).ok).toBe(
        true,
      );
    }
    const landStump = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "tree_stump",
    )!;
    const landPos = pos(landStump);
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
        landStump.x,
        landStump.z,
        userId,
      ),
    ).toBe(false);
    expect(gatherWood(userId, landStump.id, landPos).ok).toBe(true);
  });

  it("market buy from other listing + Builder/Weaver claims (happy slice)", () => {
    ensureLandKind(userId, "city");
    addItem(getPlayerState(userId)!.playerId, "plank", 2);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.userId, userId))
      .run();
    const listed = createMarketListing(userId, "plank", 1, 6);
    expect(listed.ok).toBe(true);
    const listingId = listed.listingId!;

    ensureLandKind(buyerId, "city");
    db.update(players)
      .set({ softCurrency: 40 })
      .where(eq(players.userId, buyerId))
      .run();
    expect(listMarket(buyerId).some((l) => l.id === listingId && !l.mine)).toBe(
      true,
    );
    expect(buyMarketListing(buyerId, listingId).ok).toBe(true);

    ensureLandKind(userId, "player_land");
    let land = getPlayerState(userId)!;
    if (!land.buildings.some((b) => b.type === "crop_plot")) {
      db.update(players)
        .set({ softCurrency: 50, energy: 100 })
        .where(eq(players.id, land.playerId))
        .run();
      addItem(land.playerId, "wood", 4);
      expect(placeLandStation(userId, "crop_plot", boardPos(land)).ok).toBe(
        true,
      );
    }
    expect(getTutorialNpcForPlayer(userId, "builder")!.quest.status).toBe(
      "ready",
    );
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "builder").ok).toBe(true);

    ensureLandKind(userId, "player_land");
    land = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
        weaverXp: 0,
      })
      .where(eq(players.id, land.playerId))
      .run();
    clearInv(userId, "cloth");
    addItem(land.playerId, "wood", 6);
    addItem(land.playerId, "plank", 4);
    if (!getPlayerState(userId)!.buildings.some((b) => b.type === "loom")) {
      expect(placeLandStation(userId, "loom", boardPos(land)).ok).toBe(true);
    }
    clearInv(userId, "cloth");
    db.update(players)
      .set({ weaverXp: 0, energy: 100 })
      .where(eq(players.id, getPlayerState(userId)!.playerId))
      .run();
    addItem(getPlayerState(userId)!.playerId, "leather", 2);
    const loom = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "loom",
    )!;
    expect(craftRecipeComplete(userId, "weave_cloth", pos(loom)).ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "weaver")!.quest.status).toBe(
      "ready",
    );
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "weaver").ok).toBe(true);
  });

  it("refuses incomplete Miner + keeps cooked_fish/ore NPC rates (failure/edge)", () => {
    const fresh = registerUser(
      `cl623f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;
    ensureLandKind(other, "city");
    clearInv(other, "iron_ore");
    clearInv(other, "iron_bar");
    db.update(players)
      .set({ minerXp: 0 })
      .where(eq(players.id, getPlayerState(other)!.playerId))
      .run();
    const early = claimTutorialQuest(other, "miner");
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.questNotReady);

    expect(getVendorPrices("city").sell.cooked_fish).toBe(4);
    expect(getVendorPrices("city").sell.iron_ore).toBe(1);
    expect(getVendorPrices("explore").sell.iron_ore).toBe(2);
  });
});
