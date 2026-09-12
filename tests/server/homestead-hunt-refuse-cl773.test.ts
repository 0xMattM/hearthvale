import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl773-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

/**
 * CL77.3 — homestead hunt refuse still green; Explore trail/thicket OK.
 * Choice: assert-only huntExploreOnly hold (parity with CL55.3; no land hunt invent).
 */
describe("CityLands CL77.3 homestead hunt refuse still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl773_${Date.now().toString(36)}`,
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

  it("Explore trail and thicket hunts succeed (happy)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.landKind).toBe("explore");
    const trail = explore.buildings.find((b) => b.type === "game_trail")!;
    const thicket = explore.buildings.find((b) => b.type === "edge_thicket")!;
    expect(trail).toBeTruthy();
    expect(thicket).toBeTruthy();

    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    expect(huntTrail(userId, trail.id, buildingPos(trail)).ok).toBe(true);

    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    expect(huntTrail(userId, thicket.id, buildingPos(thicket)).ok).toBe(true);
  });

  it("empty player land has no hunt nodes (edge)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    expect(home.buildings.some((b) => b.type === "game_trail")).toBe(false);
    expect(home.buildings.some((b) => b.type === "edge_thicket")).toBe(false);
  });

  it("refuses hunt on homestead building with huntExploreOnly (failure)", () => {
    const homeTravel = travelToLandKind(userId, "player_land");
    if (!homeTravel.ok) {
      expect(homeTravel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const home = getPlayerState(userId)!;
    const fake = home.buildings[0];
    expect(fake ?? { id: "missing" }).toBeTruthy();
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
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
});
