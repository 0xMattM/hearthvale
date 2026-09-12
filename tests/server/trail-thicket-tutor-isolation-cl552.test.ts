import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, TUTORIAL_NPCS, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl552-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getTutorialNpcForPlayer } = await import(
  "../../apps/server/src/game/tutorial-npcs.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

/**
 * CL55.2 — trail readies Animal Hunter only; thicket Monster Hunter only.
 * Choice: assert-only isolation (objectives hold_leather / hold_boar_tusk) over shared tutor.
 */
describe("CityLands CL55.2 trail vs thicket tutor isolation", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl552_${Date.now().toString(36)}`,
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

  it("trail readies Animal Hunter; Monster Hunter stays active (happy)", () => {
    expect(TUTORIAL_NPCS.animal_hunter.quest.objective).toBe("hold_leather");
    expect(TUTORIAL_NPCS.monster_hunter.quest.objective).toBe("hold_boar_tusk");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const trail = explore.buildings.find((b) => b.type === "game_trail")!;
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();

    expect(huntTrail(userId, trail.id, buildingPos(trail)).ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_hunter")!.quest.status,
    ).toBe("ready");
    expect(
      getTutorialNpcForPlayer(userId, "monster_hunter")!.quest.status,
    ).toBe("active");
  });

  it("thicket readies Monster Hunter; Animal Hunter stays active (edge)", () => {
    const fresh = registerUser(
      `cl552e_${Date.now().toString(36)}`,
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
      getTutorialNpcForPlayer(other, "monster_hunter")!.quest.status,
    ).toBe("ready");
    expect(
      getTutorialNpcForPlayer(other, "animal_hunter")!.quest.status,
    ).toBe("active");
  });

  it("both stay active before any Explore hunt (failure)", () => {
    const fresh = registerUser(
      `cl552f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(other, "animal_hunter")!.quest.status,
    ).toBe("active");
    expect(
      getTutorialNpcForPlayer(other, "monster_hunter")!.quest.status,
    ).toBe("active");

    expect(travelToLandKind(other, "explore").ok).toBe(true);
    const trail = getPlayerState(other)!.buildings.find(
      (b) => b.type === "game_trail",
    )!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, trail.id))
      .run();
    const far = huntTrail(other, trail.id, { x: 99, z: 99 });
    expect(far.ok).toBe(false);
    if (!far.ok) expect(far.error).toBe(ACTION_ERROR.tooFar);
    expect(
      getTutorialNpcForPlayer(other, "animal_hunter")!.quest.status,
    ).toBe("active");
  });
});
