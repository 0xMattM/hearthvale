import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl241-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherWood } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { buildings } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL24.1 Explore woodland → forester XP", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl241_${Date.now().toString(36)}`, "password123");
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

  it("grants forester XP (not carpenter) on Explore tree_stump (happy)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("explore");
    const stump = state.buildings.find((b) => b.type === "tree_stump");
    expect(stump).toBeTruthy();
    expect(state.buildings.filter((b) => b.type === "tree_stump").length).toBeGreaterThanOrEqual(
      1,
    );

    const foresterBefore = state.foresterXp;
    const carpenterBefore = state.carpenterXp;
    expect(gatherWood(userId, stump!.id, buildingPos(stump!)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.foresterXp).toBeGreaterThan(foresterBefore);
    expect(after.carpenterXp).toBe(carpenterBefore);
    expect(after.inventory.some((s) => s.itemId === "wood")).toBe(true);
  });

  it("keeps Explore stump on cooldown after chop (edge)", () => {
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("explore");
    const stump = state.buildings.find((b) => b.type === "tree_stump")!;
    const again = gatherWood(userId, stump.id, buildingPos(stump));
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.woodStumpCooldown);
    }
  });

  it("rejects Explore chop when too far (failure)", () => {
    const state = getPlayerState(userId)!;
    const stump = state.buildings.find((b) => b.type === "tree_stump")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, stump.id))
      .run();
    const result = gatherWood(userId, stump.id, { x: 99, z: 99 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.tooFar);
    }
  });
});
