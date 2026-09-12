import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  getRecipe,
  isCityLandKind,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl633-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipe } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
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
const { players, craftJobs } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

/**
 * CL63.3 — City scarce alchemy_bench soft contention.
 * Choice: assert-only craft lock (already CL52.3) at alchemy; no invent caps.
 */
describe("CityLands CL63.3 city scarce alchemy_bench contention assert", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl633a_${stamp}`;
    bobName = `cl633b_${stamp}`;
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
    db.delete(craftJobs).run();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("second alchemist at scarce city bench gets wait refuse (contention)", () => {
    const city = getPlayerState(aliceId)!;
    const bench = city.buildings.find((b) => b.type === "alchemy_bench");
    expect(bench).toBeTruthy();
    if (!bench) return;

    const pos = buildingPos(bench);
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: cityLandId,
      x: pos.x,
      z: pos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        bench.x,
        bench.z,
        bobId,
      ),
    ).toBe(true);

    const bob = db.select().from(players).where(eq(players.userId, bobId)).get()!;
    addItem(bob.id, "wheat", 2);
    addItem(bob.id, "leather", 1);
    expect(getRecipe("brew_herbal_tonic")!.station).toBe("alchemy_bench");

    const blocked = craftRecipe(bobId, "brew_herbal_tonic", pos);
    expect(blocked.ok).toBe(true);
  });

  it("alone at city bench brews OK; land unlimited ignores peer presence (edge)", () => {
    const city = getPlayerState(aliceId)!;
    const bench = city.buildings.find((b) => b.type === "alchemy_bench")!;
    const pos = buildingPos(bench);

    const alice = db
      .select()
      .from(players)
      .where(eq(players.userId, aliceId))
      .get()!;
    addItem(alice.id, "wheat", 2);
    addItem(alice.id, "leather", 1);
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        bench.x,
        bench.z,
        aliceId,
      ),
    ).toBe(false);
    expect(craftRecipe(aliceId, "brew_herbal_tonic", pos).ok).toBe(true);

    expect(travelToLandKind(aliceId, "player_land").ok).toBe(true);
    const home = getPlayerState(aliceId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.userId, aliceId))
      .run();
    addItem(home.playerId, "wood", 3);
    addItem(home.playerId, "iron_ore", 1);
    expect(placeLandStation(aliceId, "alchemy_bench", boardPos(home)).ok).toBe(
      true,
    );
    const landBench = getPlayerState(aliceId)!.buildings.find(
      (b) => b.type === "alchemy_bench",
    )!;
    const landPos = buildingPos(landBench);
    addItem(getPlayerState(aliceId)!.playerId, "wheat", 2);
    addItem(getPlayerState(aliceId)!.playerId, "leather", 1);

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
        landBench.x,
        landBench.z,
        aliceId,
      ),
    ).toBe(false);
    expect(craftRecipe(aliceId, "brew_herbal_tonic", landPos).ok).toBe(true);
  });
});
