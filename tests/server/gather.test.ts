import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, ORE_NODE, WORLD } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-mvp-gather-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { gatherOre } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { getPlayerState, addItem, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { db } = await import("../../apps/server/src/db/client.ts");
const { buildings, players } = await import("../../apps/server/src/db/schema.ts");
const { eq } = await import("drizzle-orm");

/** World-space position at a building's grid cell center. */
function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("ore gather P5.1", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now();
    const reg = registerUser(`gore_${stamp}`, "testpass");
    expect(reg.ok).toBe(true);
    userId = userIdFromToken(reg.token!)!;
    ensureStarterYardBuildings(getPlayerState(userId)!.landId);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("rejects gather without iron hammer in inventory (broken / missing)", () => {
    const state = getPlayerState(userId)!;
    const ore = state.buildings.find((b) => b.type === "ore_node");
    expect(ore).toBeTruthy();
    const result = gatherOre(userId, ore!.id, buildingPos(ore!));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.needHammerBroken);
    expect(result.error).toContain("Iron Hammer");
  });

  it("chips ore with hammer and starts cooldown (happy)", () => {
    const state = getPlayerState(userId)!;
    const player = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!;
    // Give bars + forge hammer via inventory cheat for test isolation
    addItem(player.id, "iron_bar", 4);
    addItem(player.id, "iron_hammer", 1);
    const afterGrant = getPlayerState(userId)!;
    const hammer = afterGrant.inventory.find((i) => i.itemId === "iron_hammer");
    expect(hammer).toBeTruthy();
    db.update(players)
      .set({ equippedToolInventoryId: hammer!.id, blacksmithXp: 25 })
      .where(eq(players.id, player.id))
      .run();

    const oreBefore =
      afterGrant.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0;
    const node = afterGrant.buildings.find((b) => b.type === "ore_node")!;
    const result = gatherOre(userId, node.id, buildingPos(node));
    expect(result.ok).toBe(true);

    const after = getPlayerState(userId)!;
    const oreAfter =
      after.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0;
    expect(oreAfter).toBe(oreBefore + ORE_NODE.yieldQty);
    const nodeAfter = after.buildings.find((b) => b.type === "ore_node")!;
    expect(nodeAfter.readyAt).toBeTruthy();
    expect(nodeAfter.readyAt!).toBeGreaterThan(Date.now());
  });

  it("names Iron Hammer when unequipped but still in inventory (edge)", () => {
    const state = getPlayerState(userId)!;
    const player = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!;
    const node = state.buildings.find((b) => b.type === "ore_node")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, node.id))
      .run();
    db.update(players)
      .set({ equippedToolInventoryId: null })
      .where(eq(players.id, player.id))
      .run();
    expect(
      getPlayerState(userId)!.inventory.some((i) => i.itemId === "iron_hammer"),
    ).toBe(true);
    const result = gatherOre(userId, node.id, buildingPos(node));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.needHammer);
    expect(result.error).toContain("Iron Hammer");

    // Reason: restore equip + cooldown so the following cooldown edge stays valid.
    const hammer = getPlayerState(userId)!.inventory.find(
      (i) => i.itemId === "iron_hammer",
    )!;
    db.update(players)
      .set({ equippedToolInventoryId: hammer.id })
      .where(eq(players.id, player.id))
      .run();
    db.update(buildings)
      .set({ readyAt: Date.now() + 60_000 })
      .where(eq(buildings.id, node.id))
      .run();
  });

  it("rejects gather during cooldown (edge)", () => {
    const state = getPlayerState(userId)!;
    const node = state.buildings.find((b) => b.type === "ore_node")!;
    const result = gatherOre(userId, node.id, buildingPos(node));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.oreNodeCooldown);
  });

  it("bakes bread at kitchen from flour (happy)", () => {
    const player = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!;
    addItem(player.id, "flour", 2);
    const breadBefore =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "bread")?.qty ??
      0;
    const kitchen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    const result = craftRecipeComplete(userId, "bake_bread", buildingPos(kitchen));
    expect(result.ok).toBe(true);
    const breadAfter =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "bread")?.qty ??
      0;
    expect(breadAfter).toBe(breadBefore + 1);
  });
});
