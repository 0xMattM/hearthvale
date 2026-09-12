import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl311-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
);
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL31.1 dual Animal / Monster Hunter XP", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl311_${Date.now().toString(36)}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("trail grants animal_hunter XP; thicket grants monster_hunter XP (happy)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const trail = state.buildings.find((b) => b.type === "game_trail")!;
    const thicket = state.buildings.find((b) => b.type === "edge_thicket")!;

    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();

    const animalBefore = state.animalHunterXp;
    const monsterBefore = state.monsterHunterXp;
    const cookBefore = state.cookXp;

    const trailWin = huntTrail(userId, trail.id, buildingPos(trail));
    expect(trailWin.ok).toBe(true);
    expect(trailWin.encounter?.won).toBe(true);

    const afterTrail = getPlayerState(userId)!;
    expect(afterTrail.animalHunterXp).toBeGreaterThan(animalBefore);
    expect(afterTrail.monsterHunterXp).toBe(monsterBefore);
    expect(afterTrail.hunterXp).toBe(afterTrail.animalHunterXp);
    expect(afterTrail.cookXp).toBe(cookBefore);

    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, thicket.id))
      .run();
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();

    const animalMid = afterTrail.animalHunterXp;
    const monsterMid = afterTrail.monsterHunterXp;
    const thicketWin = huntTrail(userId, thicket.id, buildingPos(thicket));
    expect(thicketWin.ok).toBe(true);
    expect(thicketWin.encounter?.won).toBe(true);
    expect(thicketWin.encounter!.tusks).toBeGreaterThan(0);

    const afterThicket = getPlayerState(userId)!;
    expect(afterThicket.monsterHunterXp).toBeGreaterThan(monsterMid);
    expect(afterThicket.animalHunterXp).toBe(animalMid);
    expect(afterThicket.hunterXp).toBe(afterThicket.animalHunterXp);
  });

  it("refuses homestead hunt unchanged (edge)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    const fake = home.buildings[0];
    const beforeAnimal = home.animalHunterXp;
    const beforeMonster = home.monsterHunterXp;
    const refused = huntTrail(
      userId,
      fake?.id ?? "missing",
      fake ? { x: WORLD.GRID * fake.x, z: WORLD.GRID * fake.z } : { x: 0, z: 0 },
    );
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe(ACTION_ERROR.huntExploreOnly);
    }
    const after = getPlayerState(userId)!;
    expect(after.animalHunterXp).toBe(beforeAnimal);
    expect(after.monsterHunterXp).toBe(beforeMonster);
  });

  it("rejects Explore trail hunt when too far without XP (failure)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const trail = state.buildings.find((b) => b.type === "game_trail")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, trail.id))
      .run();
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    const beforeAnimal = getPlayerState(userId)!.animalHunterXp;
    const beforeMonster = getPlayerState(userId)!.monsterHunterXp;
    const result = huntTrail(userId, trail.id, { x: 99, z: 99 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.tooFar);
    }
    expect(getPlayerState(userId)!.animalHunterXp).toBe(beforeAnimal);
    expect(getPlayerState(userId)!.monsterHunterXp).toBe(beforeMonster);
  });
});
