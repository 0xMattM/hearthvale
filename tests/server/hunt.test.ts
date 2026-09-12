import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-hunt-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("huntTrail encounter F9.2 / CL4.2 on explore", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `hunt_${Date.now().toString(36)}`,
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

  it("wins trail fight and grants leather/meat (happy)", () => {
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("explore");
    const trail = state.buildings.find((b) => b.type === "game_trail");
    expect(trail).toBeTruthy();
    const result = huntTrail(userId, trail!.id, buildingPos(trail!));
    expect(result.ok).toBe(true);
    expect(result.encounter?.won).toBe(true);
    expect(result.encounter!.leather).toBeGreaterThan(0);
    const after = getPlayerState(userId)!;
    expect(after.inventory.some((i) => i.itemId === "leather")).toBe(true);
    expect(after.inventory.some((i) => i.itemId === "raw_meat")).toBe(true);
  });

  it("rejects hunt while on cooldown (edge)", () => {
    const state = getPlayerState(userId)!;
    const trail = state.buildings.find((b) => b.type === "game_trail")!;
    const result = huntTrail(userId, trail.id, buildingPos(trail));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.huntCooldown);
  });

  it("rejects hunt when too far (failure)", () => {
    const state = getPlayerState(userId)!;
    const trail = state.buildings.find((b) => b.type === "game_trail")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, trail.id))
      .run();
    const tooFar = huntTrail(userId, trail.id, { x: 99, z: 99 });
    expect(tooFar.ok).toBe(false);
    expect(tooFar.error).toBe(ACTION_ERROR.tooFar);
  });

  it("edge thicket grants boar tusks on win (F9.3)", () => {
    const state = getPlayerState(userId)!;
    const edge = state.buildings.find((b) => b.type === "edge_thicket");
    expect(edge).toBeTruthy();
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, edge!.id))
      .run();
    // Full HP for a clean win.
    db.update(players)
      .set({ health: 100 })
      .where(eq(players.userId, userId))
      .run();
    const result = huntTrail(userId, edge!.id, buildingPos(edge!));
    expect(result.ok).toBe(true);
    expect(result.encounter?.won).toBe(true);
    expect(result.encounter!.tusks).toBeGreaterThan(0);
    const after = getPlayerState(userId)!;
    expect(after.inventory.some((i) => i.itemId === "boar_tusk")).toBe(true);
  });
});
