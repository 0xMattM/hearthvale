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
  `game-cl731-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/**
 * CL73.1 — Animal Hunter claim after trail still green.
 * Choice: assert-only Explore trail → City claim (parity with CL55.1 / CL71.3; no retune).
 */
describe("CityLands CL73.1 Animal Hunter claim after trail still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl731_${Date.now().toString(36)}`,
      "password123",
    );
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

  it("hunts Explore trail then claims Animal Hunter at City (happy)", () => {
    expect(TUTORIAL_NPCS.animal_hunter.quest.objective).toBe("hold_leather");
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_hunter")!.quest.status,
    ).toBe("active");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const trail = explore.buildings.find((b) => b.type === "game_trail")!;
    expect(trail).toBeTruthy();

    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();

    const animalBefore = explore.animalHunterXp;
    const monsterBefore = explore.monsterHunterXp;
    const hunt = huntTrail(userId, trail.id, buildingPos(trail));
    expect(hunt.ok).toBe(true);
    expect(hunt.encounter?.won).toBe(true);

    const afterHunt = getPlayerState(userId)!;
    expect(afterHunt.animalHunterXp).toBeGreaterThan(animalBefore);
    expect(afterHunt.monsterHunterXp).toBe(monsterBefore);
    expect(afterHunt.inventory.some((s) => s.itemId === "leather")).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_hunter")!.quest.status,
    ).toBe("ready");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "animal_hunter");
    expect(claim.ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_hunter")!.quest.status,
    ).toBe("claimed");
  });

  it("thicket tusks do not ready Animal Hunter tutor (edge)", () => {
    const fresh = registerUser(
      `cl731e_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "explore").ok).toBe(true);
    const explore = getPlayerState(other)!;
    const thicket = explore.buildings.find((b) => b.type === "edge_thicket")!;
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, other))
      .run();

    expect(huntTrail(other, thicket.id, buildingPos(thicket)).ok).toBe(true);
    expect(
      getPlayerState(other)!.inventory.some((s) => s.itemId === "boar_tusk"),
    ).toBe(true);
    expect(
      getTutorialNpcForPlayer(other, "animal_hunter")!.quest.status,
    ).toBe("active");
    expect(
      getTutorialNpcForPlayer(other, "monster_hunter")!.quest.status,
    ).toBe("ready");
  });

  it("refuses claim before trail loot (failure)", () => {
    const fresh = registerUser(
      `cl731f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(other, "animal_hunter")!.quest.status,
    ).toBe("active");
    const early = claimTutorialQuest(other, "animal_hunter");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "animal_hunter");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }

    expect(travelToLandKind(other, "explore").ok).toBe(true);
    const trail = getPlayerState(other)!.buildings.find(
      (b) => b.type === "game_trail",
    )!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, trail.id))
      .run();
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, other))
      .run();
    const far = huntTrail(other, trail.id, { x: 99, z: 99 });
    expect(far.ok).toBe(false);
    if (!far.ok) expect(far.error).toBe(ACTION_ERROR.tooFar);
  });
});
