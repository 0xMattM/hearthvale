import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, isCityLandKind } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl872-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { gatherWood, gatherOre } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { isCityStationContendedByOther } = await import(
  "../../apps/server/src/game/stationContention.ts"
);
const {
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
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

/**
 * CL87.2 — City scarce tree/ore gather contention still green.
 * Choice: assert-only soft presence lock (parity with CL79.2 / CL60.1 / CL60.2; no qty caps).
 */
describe("CityLands CL87.2 city scarce tree/ore gather contention still green", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl872a_${stamp}`;
    bobName = `cl872b_${stamp}`;
    const a = registerUser(aliceName, "password123");
    const b = registerUser(bobName, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    aliceId = userIdFromToken(a.token)!;
    bobId = userIdFromToken(b.token)!;
    expect(travelToLandKind(aliceId, "city").ok).toBe(true);
    expect(travelToLandKind(bobId, "city").ok).toBe(true);
    cityLandId = getPlayerState(aliceId)!.landId;
    expect(getPlayerState(bobId)!.landId).toBe(cityLandId);
    expect(isCityLandKind(getPlayerState(aliceId)!.landKind)).toBe(true);
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

  it("second gatherer at scarce city stump and ore gets stationBusy (happy)", () => {
    const city = getPlayerState(aliceId)!;
    const stump = city.buildings.find((b) => b.type === "tree_stump")!;
    const node = city.buildings.find((b) => b.type === "ore_node")!;
    expect(stump).toBeTruthy();
    expect(node).toBeTruthy();

    const stumpPos = buildingPos(stump);
    reportPresence({
      userId: aliceId,
      username: aliceName,
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
        bobId,
      ),
    ).toBe(true);

    const blockedWood = gatherWood(bobId, stump.id, stumpPos);
    expect(blockedWood.ok).toBe(false);
    if (!blockedWood.ok) {
      expect(blockedWood.error).toBe(ACTION_ERROR.stationBusy);
      expect(blockedWood.error).toMatch(/wait/i);
    }

    resetPresence();
    const orePos = buildingPos(node);
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: cityLandId,
      x: orePos.x,
      z: orePos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        node.x,
        node.z,
        bobId,
      ),
    ).toBe(true);
    equipHammer(bobId);
    const blockedOre = gatherOre(bobId, node.id, orePos);
    expect(blockedOre.ok).toBe(false);
    if (!blockedOre.ok) {
      expect(blockedOre.error).toBe(ACTION_ERROR.stationBusy);
    }
  });

  it("alone at city stump chops OK; land stump ignores peer presence (edge)", () => {
    const city = getPlayerState(aliceId)!;
    const stump = city.buildings.find((b) => b.type === "tree_stump")!;
    const pos = buildingPos(stump);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.userId, aliceId))
      .run();
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        stump.x,
        stump.z,
        aliceId,
      ),
    ).toBe(false);
    expect(gatherWood(aliceId, stump.id, pos).ok).toBe(true);

    expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    const home = getPlayerState(aliceId)!;
    db.update(players)
      .set({ softCurrency: 100, energy: 100 })
      .where(eq(players.userId, aliceId))
      .run();
    addItem(home.playerId, "wood", 1);
    if (!getPlayerState(aliceId)!.buildings.some((b) => b.type === "tree_stump")) {
      expect(
        placeLandStation(aliceId, "tree_stump", boardPos(getPlayerState(aliceId)!))
          .ok,
      ).toBe(true);
    }
    const landStump = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "tree_stump",
    )!;
    const landPos = buildingPos(landStump);

    reportPresence({
      userId: bobId,
      username: bobName,
      landId: getPlayerState(aliceId)!.landId,
      x: landPos.x,
      z: landPos.z,
    });
    expect(
      isCityStationContendedByOther(
        "player_land",
        getPlayerState(aliceId)!.landId,
        landStump.x,
        landStump.z,
        aliceId,
      ),
    ).toBe(false);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.userId, aliceId))
      .run();
    expect(gatherWood(aliceId, landStump.id, landPos).ok).toBe(true);
  });

  it("refuses city ore chip while peer occupies station (failure)", () => {
    if (getPlayerState(aliceId)!.landKind !== "city") {
      expect(travelToLandKind(aliceId, "city").ok).toBe(true);
    }
    if (getPlayerState(bobId)!.landKind !== "city") {
      expect(travelToLandKind(bobId, "city").ok).toBe(true);
    }
    const node = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "ore_node",
    )!;
    const pos = buildingPos(node);
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: cityLandId,
      x: pos.x,
      z: pos.z,
    });
    equipHammer(bobId);
    const blocked = gatherOre(bobId, node.id, pos);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toBe(ACTION_ERROR.stationBusy);
    }
  });
});
