import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  ORE_NODE,
  TUTORIAL_NPCS,
  WORLD,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl583-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
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

/**
 * CL58.3 — phase-13 regression companion after CL55–CL58.
 * Animal Hunter claim, ore→smelt XP split, scarce forge/mill, forester/carpenter claims.
 */
describe("CityLands CL58.3 regression smoke after CL55–CL58", () => {
  let userId = "";
  let peerId = "";
  let peerName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl583smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    peerName = `cl583peer_${stamp}`;
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

  it("claims Animal Hunter after Explore trail (happy slice)", () => {
    expect(TUTORIAL_NPCS.animal_hunter.quest.objective).toBe("hold_leather");
    ensureLandKind(userId, "explore");
    const explore = getPlayerState(userId)!;
    const trail = explore.buildings.find((b) => b.type === "game_trail")!;
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    expect(huntTrail(userId, trail.id, pos(trail)).ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_hunter")!.quest.status,
    ).toBe("ready");
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "animal_hunter").ok).toBe(true);
  });

  it("chips Explore ore → land smelt with miner/blacksmith XP split (happy slice)", () => {
    expect(getRecipe("smelt_iron_bar")!.profession).toBe("blacksmith");
    ensureLandKind(userId, "explore");
    const explore = getPlayerState(userId)!;
    const nodes = explore.buildings.filter((b) => b.type === "ore_node");
    expect(nodes.length).toBeGreaterThanOrEqual(2);
    const leftover = explore.inventory
      .filter((s) => s.itemId === "iron_ore")
      .reduce((n, s) => n + s.qty, 0);
    if (leftover > 0) removeItem(explore.playerId, "iron_ore", leftover);

    equipHammer(userId);
    const minerBefore = getPlayerState(userId)!.minerXp;
    const smithBefore = getPlayerState(userId)!.blacksmithXp;
    for (const node of nodes.slice(0, 2)) {
      db.update(players)
        .set({ energy: 100 })
        .where(eq(players.id, explore.playerId))
        .run();
      expect(gatherOre(userId, node.id, pos(node)).ok).toBe(true);
    }
    const afterChip = getPlayerState(userId)!;
    expect(afterChip.minerXp).toBe(minerBefore + ORE_NODE.xp * 2);
    expect(afterChip.blacksmithXp).toBe(smithBefore);

    ensureLandKind(userId, "player_land");
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "iron_bar", 2);
    addItem(home.playerId, "wood", 2);
    expect(placeLandStation(userId, "forge", boardPos(home)).ok).toBe(true);
    const forge = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "forge",
    )!;
    const minerMid = getPlayerState(userId)!.minerXp;
    const smithMid = getPlayerState(userId)!.blacksmithXp;
    expect(craftRecipeComplete(userId, "smelt_iron_bar", pos(forge)).ok).toBe(true);
    const afterSmelt = getPlayerState(userId)!;
    expect(afterSmelt.minerXp).toBe(minerMid);
    expect(afterSmelt.blacksmithXp).toBeGreaterThan(smithMid);
  });

  it("city scarce forge + mill contend; land forge unlimited (edge)", () => {
    ensureLandKind(userId, "city");
    ensureLandKind(peerId, "city");
    const city = getPlayerState(userId)!;
    const forge = city.buildings.find((b) => b.type === "forge")!;
    const mill = city.buildings.find((b) => b.type === "mill")!;
    const forgePos = pos(forge);
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: cityLandId,
      x: forgePos.x,
      z: forgePos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        forge.x,
        forge.z,
        userId,
      ),
    ).toBe(true);
    addItem(city.playerId, "iron_ore", 2);
    const blockedForge = craftRecipeComplete(userId, "smelt_iron_bar", forgePos);
    expect(blockedForge.ok).toBe(true);

    resetPresence();
    const millPos = pos(mill);
    reportPresence({
      userId: peerId,
      username: peerName,
      landId: cityLandId,
      x: millPos.x,
      z: millPos.z,
    });
    addItem(getPlayerState(userId)!.playerId, "wheat", 2);
    const blockedMill = craftRecipeComplete(userId, "mill_flour", millPos);
    expect(blockedMill.ok).toBe(true);

    resetPresence();
    ensureLandKind(userId, "player_land");
    const landForge = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "forge",
    )!;
    const landPos = pos(landForge);
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
        landForge.x,
        landForge.z,
        userId,
      ),
    ).toBe(false);
    addItem(getPlayerState(userId)!.playerId, "iron_ore", 2);
    expect(craftRecipeComplete(userId, "smelt_iron_bar", landPos).ok).toBe(true);
  });

  it("claims Forester + Carpenter after land chop/saw (happy slice)", () => {
    ensureLandKind(userId, "player_land");
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 1);
    expect(placeLandStation(userId, "tree_stump", boardPos(home)).ok).toBe(
      true,
    );
    const stump = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "tree_stump",
    )!;
    expect(gatherWood(userId, stump.id, pos(stump)).ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "forester")!.quest.status).toBe(
      "ready",
    );
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "forester").ok).toBe(true);

    ensureLandKind(userId, "player_land");
    const land = getPlayerState(userId)!;
    addItem(land.playerId, "wood", 6);
    addItem(land.playerId, "plank", 2);
    expect(placeLandStation(userId, "workshop", boardPos(land)).ok).toBe(true);
    const workshop = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "workshop",
    )!;
    for (const id of ["wood", "plank"] as const) {
      const qty = getPlayerState(userId)!
        .inventory.filter((s) => s.itemId === id)
        .reduce((n, s) => n + s.qty, 0);
      if (qty > 0) removeItem(land.playerId, id, qty);
    }
    addItem(land.playerId, "wood", 2);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    expect(craftRecipeComplete(userId, "saw_planks", pos(workshop)).ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "carpenter")!.quest.status).toBe(
      "ready",
    );
    ensureLandKind(userId, "city");
    expect(claimTutorialQuest(userId, "carpenter").ok).toBe(true);
  });

  it("refuses incomplete Animal Hunter + keeps cooked_fish NPC rate (failure/edge)", () => {
    const fresh = registerUser(
      `cl583f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;
    ensureLandKind(other, "city");
    const early = claimTutorialQuest(other, "animal_hunter");
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.questNotReady);

    expect(getVendorPrices("city").sell.cooked_fish).toBe(4);
    expect(getVendorPrices("city").sell.iron_ore).toBe(1);
  });
});
