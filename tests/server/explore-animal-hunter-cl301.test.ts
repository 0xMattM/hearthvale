import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  WORLD,
  cityNoticeBoardTips,
  exploreMatsCraftChainTip,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl301-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL30.1 Explore trail → Animal Hunter XP", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl301_${Date.now().toString(36)}`, "password123");
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

  it("grants hunter XP (not cook) on Explore game_trail win (happy)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("explore");
    const trail = state.buildings.find((b) => b.type === "game_trail");
    expect(trail).toBeTruthy();
    expect(
      state.buildings.filter((b) => b.type === "game_trail").length,
    ).toBeGreaterThanOrEqual(1);

    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();

    const animalBefore = state.animalHunterXp;
    const monsterBefore = state.monsterHunterXp;
    const cookBefore = state.cookXp;
    const result = huntTrail(userId, trail!.id, buildingPos(trail!));
    expect(result.ok).toBe(true);
    expect(result.encounter?.won).toBe(true);

    const after = getPlayerState(userId)!;
    expect(after.animalHunterXp).toBeGreaterThan(animalBefore);
    expect(after.monsterHunterXp).toBe(monsterBefore);
    expect(after.hunterXp).toBe(after.animalHunterXp);
    expect(after.cookXp).toBe(cookBefore);
    expect(after.inventory.some((s) => s.itemId === "leather")).toBe(true);
    expect(after.inventory.some((s) => s.itemId === "raw_meat")).toBe(true);

    // Tip documents Animal Hunter XP (not Cook); id stays explore_mats_craft
    const tip = cityNoticeBoardTips().find((t) => t.id === "explore_mats_craft");
    expect(tip?.body).toBe(exploreMatsCraftChainTip());
    expect(tip!.body.toLowerCase()).toMatch(/animal hunter xp/);
    expect(tip!.body.toLowerCase()).toMatch(/not.*cook|neither.*cook|cook xp/);
  });

  it("refuses homestead hunt unchanged (edge)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    const fake = home.buildings[0];
    const refused = huntTrail(
      userId,
      fake?.id ?? "missing",
      fake ? buildingPos(fake) : { x: 0, z: 0 },
    );
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe(ACTION_ERROR.huntExploreOnly);
    }
  });

  it("rejects Explore trail hunt when too far (failure)", () => {
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
    const result = huntTrail(userId, trail.id, { x: 99, z: 99 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.tooFar);
    }
    expect(getPlayerState(userId)!.animalHunterXp).toBe(beforeAnimal);
  });
});
