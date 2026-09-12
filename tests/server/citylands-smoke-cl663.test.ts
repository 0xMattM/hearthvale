import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  MARKET,
  TUTORIAL_NPCS,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl663-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { plantCrop, harvestCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { gatherFish } = await import(
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
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function pos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return pos(board);
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
 * CL66.3 — phase-15 regression companion after CL63–CL66.
 * Scarce loom/dock/alchemy, Farmer/Fisher/Alchemist claims, market TTL + cooked_fish buy.
 */
describe("CityLands CL66.3 regression smoke after CL63–CL66", () => {
  let userId = "";
  let peerId = "";
  let peerName = "";
  let buyerId = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl663smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    peerName = `cl663peer_${stamp}`;
    const peer = registerUser(peerName, "password123");
    expect(peer.ok).toBe(true);
    if (!peer.ok) throw new Error("peer register failed");
    peerId = userIdFromToken(peer.token)!;

    const buyer = registerUser(`cl663buy_${stamp}`, "password123");
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

  it("city scarce loom/dock/alchemy contend (edge)", () => {
    ensureLandKind(userId, "city");
    ensureLandKind(peerId, "city");
    const city = getPlayerState(userId)!;
    const loom = city.buildings.find((b) => b.type === "loom")!;
    const dock = city.buildings.find((b) => b.type === "fishing_dock")!;
    const alchemy = city.buildings.find((b) => b.type === "alchemy_bench")!;

    const loomPos = pos(loom);
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: cityLandId,
      x: loomPos.x,
      z: loomPos.z,
    });
    addItem(getPlayerState(userId)!.playerId, "leather", 2);
    const blockedLoom = craftRecipeComplete(userId, "weave_cloth", loomPos);
    expect(blockedLoom.ok).toBe(true);

    resetPresence();
    const dockPos = pos(dock);
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: cityLandId,
      x: dockPos.x,
      z: dockPos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        dock.x,
        dock.z,
        userId,
      ),
    ).toBe(true);
    const blockedDock = gatherFish(userId, dock.id, dockPos);
    expect(blockedDock.ok).toBe(false);
    if (!blockedDock.ok) {
      expect(blockedDock.error).toBe(ACTION_ERROR.stationBusy);
    }

    resetPresence();
    const alchemyPos = pos(alchemy);
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: cityLandId,
      x: alchemyPos.x,
      z: alchemyPos.z,
    });
    addItem(getPlayerState(userId)!.playerId, "wheat", 2);
    addItem(getPlayerState(userId)!.playerId, "leather", 1);
    const blockedBrew = craftRecipeComplete(userId, "brew_herbal_tonic", alchemyPos);
    expect(blockedBrew.ok).toBe(true);
  });

  it("claims Farmer / Fisher / Alchemist after land paths (happy slice)", () => {
    expect(TUTORIAL_NPCS.farmer.quest.objective).toBe("farm_starter_loop");
    expect(TUTORIAL_NPCS.fisher.quest.objective).toBe("hold_fish");
    expect(TUTORIAL_NPCS.alchemist.quest.objective).toBe("hold_herbal_tonic");

    // Farmer — land plant→harvest
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "mayor").ok).toBe(true);
    clearInv(userId, "wheat");
    clearInv(userId, "flour");
    db.update(players)
      .set({ farmerXp: 0, energy: 100 })
      .where(eq(players.id, getPlayerState(userId)!.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "active",
    );

    ensureLandKind(userId, "player_land");
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 4);
    addItem(home.playerId, "wheat_seed", 1);
    if (!home.buildings.some((b) => b.type === "crop_plot")) {
      expect(placeLandStation(userId, "crop_plot", boardPos(home)).ok).toBe(
        true,
      );
    }
    const plot = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "crop_plot" && !b.cropId,
    )!;
    expect(plantCrop(userId, plot.id, "wheat_seed", pos(plot)).ok).toBe(true);
    db.update(buildings)
      .set({ readyAt: Date.now() - 1 })
      .where(eq(buildings.id, plot.id))
      .run();
    expect(harvestCrop(userId, plot.id, pos(plot)).ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "ready",
    );
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "farmer").ok).toBe(true);

    // Fisher — land dock catch
    clearInv(userId, "fish");
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "active",
    );
    ensureLandKind(userId, "player_land");
    const land = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wood", 8);
    addItem(land.playerId, "plank", 4);
    if (!land.buildings.some((b) => b.type === "fishing_dock")) {
      expect(
        placeLandStation(userId, "fishing_dock", boardPos(land)).ok,
      ).toBe(true);
    }
    const dock = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "fishing_dock",
    )!;
    expect(gatherFish(userId, dock.id, pos(dock)).ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "ready",
    );
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "fisher").ok).toBe(true);

    // Alchemist — land brew
    clearInv(userId, "herbal_tonic");
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "active",
    );
    expect(getRecipe("brew_herbal_tonic")!.station).toBe("alchemy_bench");
    ensureLandKind(userId, "player_land");
    const yard = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, yard.playerId))
      .run();
    addItem(yard.playerId, "wood", 6);
    addItem(yard.playerId, "plank", 2);
    addItem(yard.playerId, "wheat", 2);
    addItem(yard.playerId, "leather", 1);
    if (!yard.buildings.some((b) => b.type === "alchemy_bench")) {
      expect(
        placeLandStation(userId, "alchemy_bench", boardPos(yard)).ok,
      ).toBe(true);
    }
    const bench = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "alchemy_bench",
    )!;
    expect(craftRecipeComplete(userId, "brew_herbal_tonic", pos(bench)).ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "alchemist")!.quest.status,
    ).toBe("ready");
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "alchemist").ok).toBe(true);
  });

  it("market TTL escrow return + cooked_fish cross-buy (happy slice)", () => {
    ensureLandKind(userId, "city");
    addItem(getPlayerState(userId)!.playerId, "plank", 2);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.userId, userId))
      .run();
    const before =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "plank")
        ?.qty ?? 0;
    const t0 = Date.now();
    const ttlList = createMarketListing(userId, "plank", 1, 4, t0);
    expect(ttlList.ok).toBe(true);
    const ttlId = ttlList.listingId!;
    expect(
      listMarket(buyerId, t0 + MARKET.listingTtlMs + 1).some(
        (l) => l.id === ttlId,
      ),
    ).toBe(false);
    expect(
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "plank")
        ?.qty ?? 0,
    ).toBe(before);
    const lateBuy = buyMarketListing(
      buyerId,
      ttlId,
      t0 + MARKET.listingTtlMs + 2,
    );
    expect(lateBuy.ok).toBe(false);

    addItem(getPlayerState(userId)!.playerId, "cooked_fish", 2);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.userId, userId))
      .run();
    const fishList = createMarketListing(userId, "cooked_fish", 1, 6);
    expect(fishList.ok).toBe(true);
    const fishId = fishList.listingId!;
    ensureLandKind(buyerId, "city");
    db.update(players)
      .set({ softCurrency: 50 })
      .where(eq(players.userId, buyerId))
      .run();
    expect(buyMarketListing(buyerId, fishId).ok).toBe(true);
    expect(
      getPlayerState(buyerId)!.inventory.some(
        (s) => s.itemId === "cooked_fish" && s.qty >= 1,
      ),
    ).toBe(true);

    // Own-list refuse edge
    addItem(getPlayerState(userId)!.playerId, "cooked_fish", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 10 })
      .where(eq(players.userId, userId))
      .run();
    const own = createMarketListing(userId, "cooked_fish", 1, 5);
    expect(own.ok).toBe(true);
    const ownBuy = buyMarketListing(userId, own.listingId!);
    expect(ownBuy.ok).toBe(false);
    if (!ownBuy.ok) expect(ownBuy.error).toBe(ACTION_ERROR.marketOwnListing);
  });
});
