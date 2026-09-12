import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl242-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { gatherOre } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function equipHammer(uid: string) {
  const pid = db.select().from(players).where(eq(players.userId, uid)).get()!.id;
  addItem(pid, "iron_hammer", 1);
  const hammer = getPlayerState(uid)!.inventory.find(
    (i) => i.itemId === "iron_hammer",
  )!;
  db.update(players)
    .set({ equippedToolInventoryId: hammer.id })
    .where(eq(players.id, pid))
    .run();
}

describe("CityLands CL24.2 Explore mines → miner XP", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl242_${Date.now().toString(36)}`, "password123");
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

  it("grants miner XP (not blacksmith) on Explore ore_node (happy)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.landKind).toBe("explore");
    const node = state.buildings.find((b) => b.type === "ore_node");
    expect(node).toBeTruthy();
    equipHammer(userId);

    const minerBefore = getPlayerState(userId)!.minerXp;
    const smithBefore = getPlayerState(userId)!.blacksmithXp;
    expect(gatherOre(userId, node!.id, buildingPos(node!)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.minerXp).toBeGreaterThan(minerBefore);
    expect(after.blacksmithXp).toBe(smithBefore);
    expect(after.inventory.some((s) => s.itemId === "iron_ore")).toBe(true);
  });

  it("still requires hammer on Explore ore (edge)", () => {
    const state = getPlayerState(userId)!;
    const node = state.buildings.find((b) => b.type === "ore_node")!;
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, node.id))
      .run();
    db.update(players)
      .set({ equippedToolInventoryId: null })
      .where(eq(players.id, pid))
      .run();
    const result = gatherOre(userId, node.id, buildingPos(node));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.needHammer);
    }
  });

  it("rejects Explore ore chip when too far (failure)", () => {
    const state = getPlayerState(userId)!;
    const node = state.buildings.find((b) => b.type === "ore_node")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, node.id))
      .run();
    equipHammer(userId);
    const result = gatherOre(userId, node.id, { x: 99, z: 99 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.tooFar);
    }
  });
});
