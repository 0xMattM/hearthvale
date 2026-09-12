import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  TUTORIAL_NPCS,
  WORLD,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl302-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL30.2 Explore thicket → Monster Hunter XP", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl302_${Date.now().toString(36)}`, "password123");
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

  it("grants hunter XP + boar_tusk on Explore edge_thicket; tutor objective holds (happy)", () => {
    expect(TUTORIAL_NPCS.monster_hunter.quest.objective).toBe("hold_boar_tusk");
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("explore");
    const thicket = state.buildings.find((b) => b.type === "edge_thicket");
    expect(thicket).toBeTruthy();
    expect(
      state.buildings.filter((b) => b.type === "edge_thicket").length,
    ).toBeGreaterThanOrEqual(1);

    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();

    const animalBefore = state.animalHunterXp;
    const monsterBefore = state.monsterHunterXp;
    const cookBefore = state.cookXp;
    const result = huntTrail(userId, thicket!.id, buildingPos(thicket!));
    expect(result.ok).toBe(true);
    expect(result.encounter?.won).toBe(true);
    expect(result.encounter!.tusks).toBeGreaterThan(0);

    const after = getPlayerState(userId)!;
    expect(after.monsterHunterXp).toBeGreaterThan(monsterBefore);
    expect(after.animalHunterXp).toBe(animalBefore);
    expect(after.cookXp).toBe(cookBefore);
    expect(after.inventory.some((s) => s.itemId === "boar_tusk")).toBe(true);
    expect(after.inventory.some((s) => s.itemId === "raw_meat")).toBe(true);

    // Tutor objective still hold_boar_tusk — thicket loot completes it
    expect(
      getTutorialNpcForPlayer(userId, "monster_hunter")!.quest.status,
    ).toBe("ready");
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(claimTutorialQuest(userId, "monster_hunter").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "monster_hunter")!.quest.status,
    ).toBe("claimed");
  });

  it("refuses homestead thicket hunt unchanged (edge)", () => {
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

  it("rejects Explore thicket hunt when too far (failure)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const thicket = state.buildings.find((b) => b.type === "edge_thicket")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, thicket.id))
      .run();
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    const beforeMonster = getPlayerState(userId)!.monsterHunterXp;
    const result = huntTrail(userId, thicket.id, { x: 99, z: 99 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.tooFar);
    }
    expect(getPlayerState(userId)!.monsterHunterXp).toBe(beforeMonster);
  });
});
