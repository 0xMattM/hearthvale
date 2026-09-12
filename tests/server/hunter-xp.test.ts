import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-hunter-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
);
const { buildings } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("hunter XP F10.1 / CL4.2 explore", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `hunter_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("grants animal hunter XP on trail win, not farmer (happy)", () => {
    const state = getPlayerState(userId)!;
    const trail = state.buildings.find((b) => b.type === "game_trail")!;
    const beforeAnimal = state.animalHunterXp;
    const beforeFarmer = state.farmerXp;
    const result = huntTrail(userId, trail.id, buildingPos(trail));
    expect(result.ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.animalHunterXp).toBeGreaterThan(beforeAnimal);
    expect(after.hunterXp).toBe(after.animalHunterXp);
    expect(after.farmerXp).toBe(beforeFarmer);
  });

  it("rejects hunt when too far without granting XP (failure)", () => {
    const state = getPlayerState(userId)!;
    const trail = state.buildings.find((b) => b.type === "game_trail")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, trail.id))
      .run();
    const beforeAnimal = getPlayerState(userId)!.animalHunterXp;
    const result = huntTrail(userId, trail.id, { x: 99, z: 99 });
    expect(result.ok).toBe(false);
    expect(getPlayerState(userId)!.animalHunterXp).toBe(beforeAnimal);
  });
});
