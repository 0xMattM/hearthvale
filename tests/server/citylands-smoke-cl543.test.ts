import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  WORLD,
  formatFreeTravelCircuit,
  freeTravelPortalPrompt,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl543-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const {
  createTradeOffer,
  acceptTrade,
} = await import("../../apps/server/src/game/actions/trade.ts");
const {
  arePlayersNearbyForTrade,
  TRADE_PING_RANGE,
} = await import("../../apps/server/src/game/tradeInvite.ts");
const {
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");
const { getVisitLand } = await import("../../apps/server/src/game/visit.ts");
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock rates asserted in CL51 / CL39 sinks. */
const COOKED_FISH_SELL = 4;
const CRATE_SELL = 3;
const WHEAT_SELL = 2;

function pos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

/**
 * CL54.3 — phase-12 regression companion after CL51–CL54.
 * Food sinks, trade/visit, thicket claim, portal free-travel copy.
 */
describe("CityLands CL54.3 regression smoke after CL51–CL54", () => {
  let userId = "";
  let peerId = "";
  let peerName = "";
  let hostName = "";
  let hostLandId = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl543smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    peerName = `cl543peer_${stamp}`;
    const peer = registerUser(peerName, "password123");
    expect(peer.ok).toBe(true);
    if (!peer.ok) throw new Error("peer register failed");
    peerId = userIdFromToken(peer.token)!;

    hostName = `cl543host_${stamp}`;
    const host = registerUser(hostName, "password123");
    expect(host.ok).toBe(true);
    if (!host.ok) throw new Error("host register failed");
    const hostId = userIdFromToken(host.token)!;
    const homeTravel = travelToLandKind(hostId, "player_land");
    if (!homeTravel.ok) {
      expect(homeTravel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    hostLandId = getPlayerState(hostId)!.landId;

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

  it("sells food/crate sinks, trades nearby, visits, claims thicket (happy)", () => {
    expect(getVendorPrices("city").sell.cooked_fish).toBe(COOKED_FISH_SELL);
    expect(getVendorPrices("city").sell.wood_crate).toBe(CRATE_SELL);
    expect(getVendorPrices("city").sell.wheat).toBe(WHEAT_SELL);
    expect(getRecipe("pack_travel_ration")!.minProfessionXp).toBe(25);
    expect(getRecipe("forge_iron_hammer")!.minProfessionXp).toBe(20);

    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    addItem(city.playerId, "cooked_fish", 1);
    addItem(city.playerId, "wheat", 1);
    addItem(city.playerId, "wood_crate", 1);
    const coins0 = city.softCurrency;
    expect(vendorSell(userId, "cooked_fish", 1, pos(stall)).ok).toBe(true);
    expect(vendorSell(userId, "wheat", 1, pos(stall)).ok).toBe(true);
    expect(vendorSell(userId, "wood_crate", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(
      coins0 + COOKED_FISH_SELL + WHEAT_SELL + CRATE_SELL,
    );

    const meName = getPlayerState(userId)!.username;
    reportPresence({
      userId,
      username: meName,
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
    addItem(getPlayerState(userId)!.playerId, "plank", 1);
    const offer = createTradeOffer(
      userId,
      peerName,
      [{ itemId: "plank", qty: 1 }],
      [],
      0,
      0,
    );
    expect(offer.ok).toBe(true);
    if (!offer.ok || !offer.tradeId) throw new Error("trade create failed");
    expect(acceptTrade(peerId, offer.tradeId).ok).toBe(true);

    const visit = getVisitLand(userId, hostName);
    expect(visit.ok).toBe(true);
    if (visit.ok) {
      expect(visit.land.landId).toBe(hostLandId);
      expect(visit.land.landKind).toBe("player_land");
    }

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const thicket = explore.buildings.find((b) => b.type === "edge_thicket")!;
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    expect(huntTrail(userId, thicket.id, pos(thicket)).ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "monster_hunter")!.quest.status,
    ).toBe("ready");
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(claimTutorialQuest(userId, "monster_hunter").ok).toBe(true);
  });

  it("keeps portal free-travel circuit copy on all four maps (edge)", () => {
    const circuit = formatFreeTravelCircuit();
    expect(circuit).toMatch(/City/);
    expect(circuit).toMatch(/Your Land/);
    expect(circuit).toMatch(/Exploration/);
    expect(circuit).toMatch(/Warrior Arena/);
    for (const kind of ["city", "player_land", "explore", "warrior"] as const) {
      const label = freeTravelPortalPrompt(kind);
      expect(label).toMatch(/Travel · free/i);
      expect(label).toContain(circuit);
      expect(label.toLowerCase()).not.toMatch(/fare|caravan/);
    }
    expect(freeTravelPortalPrompt("warrior")).toMatch(/^Exit · Travel · free/);
  });

  it("refuses incomplete Monster Hunter claim + empty cooked_fish sell (failure)", () => {
    const fresh = registerUser(
      `cl543fail_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    const early = claimTutorialQuest(other, "monster_hunter");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const city = getPlayerState(other)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    const fishQty =
      city.inventory.find((s) => s.itemId === "cooked_fish")?.qty ?? 0;
    if (fishQty > 0) removeItem(city.playerId, "cooked_fish", fishQty);
    const empty = vendorSell(other, "cooked_fish", 1, pos(stall));
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.error).toBe(ACTION_ERROR.notEnoughItems);
    }

    // Reason: far soft-invite ping refuse holds (CL52.1) — offer create is separate.
    resetPresence();
    reportPresence({
      userId: other,
      username: getPlayerState(other)!.username,
      landId: city.landId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: city.landId,
      x: TRADE_PING_RANGE * 3,
      z: 0,
    });
    expect(arePlayersNearbyForTrade(other, peerId)).toBe(false);
  });
});
