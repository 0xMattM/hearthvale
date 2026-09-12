import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, ORE_NODES, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-multi-ore-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("multi-ore explore mines", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`more_${Date.now().toString(36)}`, "password123");
    expect(reg.ok).toBe(true);
    userId = userIdFromToken(reg.token!)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("chips copper from a copper rock (happy)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const copper = state.buildings.find(
      (b) => b.type === "ore_node" && b.cropId === "copper",
    );
    expect(copper).toBeTruthy();
    equipHammer(userId);
    const before =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "copper_ore")
        ?.qty ?? 0;
    expect(gatherOre(userId, copper!.id, buildingPos(copper!)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    const qty =
      after.inventory.find((i) => i.itemId === "copper_ore")?.qty ?? 0;
    expect(qty).toBe(before + ORE_NODES.copper.yieldQty);
    const node = after.buildings.find((b) => b.id === copper!.id)!;
    expect(node.readyAt).toBeGreaterThan(
      Date.now() + ORE_NODES.copper.cooldownMs - 5_000,
    );
  });

  it("chips gold on a longer cooldown than copper (edge)", () => {
    const gold = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "ore_node" && b.cropId === "gold",
    );
    expect(gold).toBeTruthy();
    const before =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "gold_ore")
        ?.qty ?? 0;
    expect(gatherOre(userId, gold!.id, buildingPos(gold!)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(
      after.inventory.find((i) => i.itemId === "gold_ore")?.qty ?? 0,
    ).toBe(before + ORE_NODES.gold.yieldQty);
    const node = after.buildings.find((b) => b.id === gold!.id)!;
    const copper = after.buildings.find(
      (b) => b.type === "ore_node" && b.cropId === "copper",
    )!;
    expect(node.readyAt!).toBeGreaterThan(copper.readyAt!);
  });

  it("still refuses a copper rock without a hammer (failure)", () => {
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!
      .id;
    db.update(players)
      .set({ equippedToolInventoryId: null })
      .where(eq(players.id, pid))
      .run();
    const copper = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "ore_node" && b.cropId === "copper",
    )!;
    db.update(buildings)
      .set({ readyAt: Date.now() - 1 })
      .where(eq(buildings.id, copper.id))
      .run();
    const result = gatherOre(userId, copper.id, buildingPos(copper));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.needHammer);
  });
});
