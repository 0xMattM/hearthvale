import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  ENERGY,
  FOOD_RESTORE,
  WORLD,
  formatFreeTravelCircuit,
  freeTravelPortalPrompt,
  getRecipe,
  getVendorPrices,
  type BuildingDto,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import type { InteractTarget } from "../../apps/web/components/land-scene/landProximity";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl743-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherWood, gatherOre } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
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
const { sendMail } = await import("../../apps/server/src/game/mail.ts");
const { getVisitLand } = await import("../../apps/server/src/game/visit.ts");
const {
  arePlayersNearbyForTrade,
  TRADE_PING_RANGE,
} = await import("../../apps/server/src/game/tradeInvite.ts");
const {
  listPresenceOnLand,
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

const CRATE_SELL = 3;

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

function portalTarget(): InteractTarget {
  const building: BuildingDto = {
    id: "portal",
    type: "portal",
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
 * CL74.3 — phase-17 regression companion after CL71–CL74.
 * Companion: Explore→land saw/smelt, MH+AH claims, bread/stew eat, crate vendor,
 * visit/mail, portal prompts.
 */
describe("CityLands CL74.3 regression smoke after CL71–CL74", () => {
  let userId = "";
  let peerId = "";
  let peerName = "";
  let hostName = "";
  let hostLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl743smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    peerName = `cl743peer_${stamp}`;
    const peer = registerUser(peerName, "password123");
    expect(peer.ok).toBe(true);
    if (!peer.ok) throw new Error("peer register failed");
    peerId = userIdFromToken(peer.token)!;

    hostName = `cl743host_${stamp}`;
    const host = registerUser(hostName, "password123");
    expect(host.ok).toBe(true);
    if (!host.ok) throw new Error("host register failed");
    const hostId = userIdFromToken(host.token)!;
    const homeTravel = travelToLandKind(hostId, "player_land");
    if (!homeTravel.ok) {
      expect(homeTravel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    hostLandId = getPlayerState(hostId)!.landId;
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

  it("Explore wood→land saw + Explore ore→land smelt (happy)", () => {
    expect(getRecipe("saw_planks")!.profession).toBe("carpenter");
    expect(getRecipe("smelt_iron_bar")!.profession).toBe("blacksmith");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    clearInv(userId, "wood");
    clearInv(userId, "iron_ore");
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();

    const stumps = explore.buildings.filter((b) => b.type === "tree_stump");
    expect(stumps.length).toBeGreaterThanOrEqual(2);
    expect(gatherWood(userId, stumps[0]!.id, pos(stumps[0]!)).ok).toBe(true);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    expect(gatherWood(userId, stumps[1]!.id, pos(stumps[1]!)).ok).toBe(true);

    equipHammer(userId);
    const nodes = getPlayerState(userId)!.buildings.filter(
      (b) => b.type === "ore_node",
    );
    expect(nodes.length).toBeGreaterThanOrEqual(2);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    expect(gatherOre(userId, nodes[0]!.id, pos(nodes[0]!)).ok).toBe(true);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    expect(gatherOre(userId, nodes[1]!.id, pos(nodes[1]!)).ok).toBe(true);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "plank", 4);
    addItem(home.playerId, "iron_bar", 2);

    if (!home.buildings.some((b) => b.type === "workshop")) {
      expect(placeLandStation(userId, "workshop", boardPos(home)).ok).toBe(
        true,
      );
    }
    const land = getPlayerState(userId)!;
    if (!land.buildings.some((b) => b.type === "forge")) {
      expect(placeLandStation(userId, "forge", boardPos(land)).ok).toBe(true);
    }

    const workshop = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "workshop",
    )!;
    const forge = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "forge",
    )!;
    // Reason: ensure Explore chops cover saw inputs after place leftovers.
    const woodNeed = 2;
    const woodHave =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "wood")
        ?.qty ?? 0;
    if (woodHave < woodNeed) {
      addItem(getPlayerState(userId)!.playerId, "wood", woodNeed - woodHave);
    }
    const oreHave =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "iron_ore")
        ?.qty ?? 0;
    if (oreHave < 2) {
      addItem(getPlayerState(userId)!.playerId, "iron_ore", 2 - oreHave);
    }

    expect(craftRecipeComplete(userId, "saw_planks", pos(workshop)).ok).toBe(true);
    expect(craftRecipeComplete(userId, "smelt_iron_bar", pos(forge)).ok).toBe(true);
  });

  it("claims Animal Hunter + Monster Hunter after trail/thicket (happy)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();

    const trail = explore.buildings.find((b) => b.type === "game_trail")!;
    const thicket = explore.buildings.find((b) => b.type === "edge_thicket")!;
    expect(huntTrail(userId, trail.id, pos(trail)).ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_hunter")!.quest.status,
    ).toBe("ready");

    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    expect(huntTrail(userId, thicket.id, pos(thicket)).ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "monster_hunter")!.quest.status,
    ).toBe("ready");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(claimTutorialQuest(userId, "animal_hunter").ok).toBe(true);
    expect(claimTutorialQuest(userId, "monster_hunter").ok).toBe(true);
  });

  it("eats bread/stew, sells crate, visits + mails (happy)", () => {
    expect(FOOD_RESTORE.bread).toBe(ENERGY.breadRestore);
    expect(FOOD_RESTORE.stew).toBe(ENERGY.stewRestore);
    expect(getVendorPrices("city").sell.wood_crate).toBe(CRATE_SELL);

    const pid = getPlayerState(userId)!.playerId;
    clearInv(userId, "bread");
    clearInv(userId, "stew");
    addItem(pid, "bread", 1);
    addItem(pid, "stew", 1);
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

    expect(getPlayerState(userId)!.landKind).toBe("city");
    clearInv(userId, "wood_crate");
    addItem(pid, "wood_crate", 1);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "wood_crate", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + CRATE_SELL);

    const visit = getVisitLand(userId, hostName);
    expect(visit.ok).toBe(true);
    if (visit.ok) expect(visit.land.landId).toBe(hostLandId);

    reportPresence({
      userId: peerId,
      username: peerName,
      landId: hostLandId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: userId,
      username: getPlayerState(userId)!.username,
      landId: hostLandId,
      x: TRADE_PING_RANGE / 2,
      z: 0,
    });
    expect(
      listPresenceOnLand(hostLandId, peerId).some(
        (p) => p.username === getPlayerState(userId)!.username,
      ),
    ).toBe(true);
    expect(arePlayersNearbyForTrade(userId, peerId)).toBe(true);

    addItem(getPlayerState(userId)!.playerId, "wheat", 1);
    const mail = sendMail(
      userId,
      peerName,
      [{ itemId: "wheat", qty: 1 }],
      0,
      "CL74.3",
    );
    expect(mail.ok).toBe(true);
  });

  it("keeps Free travel portal prompts on city/land/explore + Exit on warrior (happy)", () => {
    const circuit = formatFreeTravelCircuit();
    for (const kind of ["city", "player_land", "explore"] as const) {
      const label = resolveInteractPrompt({
        target: portalTarget(),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: kind,
      })?.label;
      expect(label).toBe(freeTravelPortalPrompt(kind));
      expect(label).toMatch(/^Travel · free ·/);
      expect(label).toContain(circuit);
    }
    const warrior = resolveInteractPrompt({
      target: portalTarget(),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "warrior",
    })?.label;
    expect(warrior).toMatch(/^Exit · Travel · free/);
    expect(warrior).toMatch(/\bN\b/);
  });

  it("refuses incomplete AH claim, empty eat, empty mail, empty crate sell (failure)", () => {
    const fresh = registerUser(
      `cl743f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    const early = claimTutorialQuest(other, "animal_hunter");
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.questNotReady);

    clearInv(other, "bread");
    const emptyEat = eatFood(other, "bread");
    expect(emptyEat.ok).toBe(false);
    if (!emptyEat.ok) expect(emptyEat.error).toBe(ACTION_ERROR.noBread);

    const emptyMail = sendMail(other, peerName, [], 0);
    expect(emptyMail.ok).toBe(false);
    if (!emptyMail.ok) expect(emptyMail.error).toBe(ACTION_ERROR.mailEmpty);

    const missingMail = sendMail(
      other,
      "nobody_cl743",
      [{ itemId: "wheat", qty: 1 }],
      0,
    );
    expect(missingMail.ok).toBe(false);
    if (!missingMail.ok) {
      expect(missingMail.error).toBe(ACTION_ERROR.mailPlayerMissing);
    }

    clearInv(other, "wood_crate");
    const stall = getPlayerState(other)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const emptySell = vendorSell(other, "wood_crate", 1, pos(stall));
    expect(emptySell.ok).toBe(false);
    if (!emptySell.ok) expect(emptySell.error).toBe(ACTION_ERROR.notEnoughItems);
  });
});
