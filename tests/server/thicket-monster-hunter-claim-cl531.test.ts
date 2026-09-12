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
  `game-cl531-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
 * CL53.1 — Explore edge_thicket loot → City Monster Hunter tutor claim.
 * Choice: assert-only claim e2e (objective still hold_boar_tusk) over new tutor ids.
 */
describe("CityLands CL53.1 Explore thicket → Monster Hunter tutor claim", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl531_${Date.now().toString(36)}`,
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

  it("hunts Explore thicket then claims Monster Hunter at City (happy)", () => {
    expect(TUTORIAL_NPCS.monster_hunter.quest.objective).toBe("hold_boar_tusk");
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "monster_hunter")!.quest.status,
    ).toBe("active");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const thicket = explore.buildings.find((b) => b.type === "edge_thicket")!;
    expect(thicket).toBeTruthy();

    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();

    const monsterBefore = explore.monsterHunterXp;
    const animalBefore = explore.animalHunterXp;
    const hunt = huntTrail(userId, thicket.id, buildingPos(thicket));
    expect(hunt.ok).toBe(true);
    expect(hunt.encounter?.won).toBe(true);
    expect(hunt.encounter!.tusks).toBeGreaterThan(0);

    const afterHunt = getPlayerState(userId)!;
    expect(afterHunt.monsterHunterXp).toBeGreaterThan(monsterBefore);
    expect(afterHunt.animalHunterXp).toBe(animalBefore);
    expect(afterHunt.inventory.some((s) => s.itemId === "boar_tusk")).toBe(
      true,
    );
    expect(
      getTutorialNpcForPlayer(userId, "monster_hunter")!.quest.status,
    ).toBe("ready");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "monster_hunter");
    expect(claim.ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "monster_hunter")!.quest.status,
    ).toBe("claimed");
  });

  it("trail leather does not ready Monster Hunter tutor (edge)", () => {
    const fresh = registerUser(
      `cl531e_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "explore").ok).toBe(true);
    const explore = getPlayerState(other)!;
    const trail = explore.buildings.find((b) => b.type === "game_trail")!;
    expect(trail).toBeTruthy();
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, other))
      .run();

    expect(huntTrail(other, trail.id, buildingPos(trail)).ok).toBe(true);
    expect(
      getPlayerState(other)!.inventory.some((s) => s.itemId === "leather"),
    ).toBe(true);
    expect(
      getTutorialNpcForPlayer(other, "monster_hunter")!.quest.status,
    ).toBe("active");
    expect(
      getTutorialNpcForPlayer(other, "animal_hunter")!.quest.status,
    ).toBe("ready");
  });

  it("refuses claim before thicket loot (failure)", () => {
    const fresh = registerUser(
      `cl531f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(other, "monster_hunter")!.quest.status,
    ).toBe("active");
    const early = claimTutorialQuest(other, "monster_hunter");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "monster_hunter");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }

    // Reason: cooldown clear unused here — assert far thicket still refuses.
    expect(travelToLandKind(other, "explore").ok).toBe(true);
    const thicket = getPlayerState(other)!.buildings.find(
      (b) => b.type === "edge_thicket",
    )!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, thicket.id))
      .run();
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, other))
      .run();
    const far = huntTrail(other, thicket.id, { x: 99, z: 99 });
    expect(far.ok).toBe(false);
    if (!far.ok) expect(far.error).toBe(ACTION_ERROR.tooFar);
  });
});
