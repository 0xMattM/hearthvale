import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, meetsRecipeXpGate, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl182-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
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
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL18.2 Miner XP column", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl182_${Date.now().toString(36)}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    ensureStarterYardBuildings(getPlayerState(userId)!.landId);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("routes ore gather through miner XP (happy)", () => {
    const state = getPlayerState(userId)!;
    const node = state.buildings.find((b) => b.type === "ore_node");
    expect(node).toBeTruthy();
    expect(state.minerXp).toBe(0);
    const smithBefore = state.blacksmithXp;

    const pid = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!.id;
    addItem(pid, "iron_hammer", 1);
    const hammer = getPlayerState(userId)!.inventory.find(
      (i) => i.itemId === "iron_hammer",
    )!;
    db.update(players)
      .set({ equippedToolInventoryId: hammer.id })
      .where(eq(players.id, pid))
      .run();

    expect(gatherOre(userId, node!.id, buildingPos(node!)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.minerXp).toBeGreaterThan(0);
    expect(after.blacksmithXp).toBe(smithBefore);
    expect(after.inventory.some((i) => i.itemId === "iron_ore")).toBe(true);
  });

  it("keeps smelt_iron_bar on blacksmith XP; miner gate is separate (edge)", () => {
    const state = getPlayerState(userId)!;
    const forge = state.buildings.find((b) => b.type === "forge")!;
    const pid = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!.id;
    addItem(pid, "iron_ore", 4);
    const beforeSmith = getPlayerState(userId)!.blacksmithXp;
    const beforeMiner = getPlayerState(userId)!.minerXp;

    expect(craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge)).ok).toBe(
      true,
    );
    const after = getPlayerState(userId)!;
    expect(after.blacksmithXp).toBeGreaterThan(beforeSmith);
    expect(after.minerXp).toBe(beforeMiner);

    const bar = getRecipe("smelt_iron_bar")!;
    const gated = { ...bar, profession: "miner" as const, minProfessionXp: 10 };
    expect(meetsRecipeXpGate(gated, 0, 99, 0, 0, 0, 0, 0, 0)).toBe(false);
    expect(meetsRecipeXpGate(gated, 0, 0, 0, 0, 0, 0, 0, 10)).toBe(true);
  });

  it("rejects ore gather when too far (failure)", () => {
    const state = getPlayerState(userId)!;
    const node = state.buildings.find((b) => b.type === "ore_node")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, node.id))
      .run();
    const result = gatherOre(userId, node.id, { x: 99, z: 99 });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.tooFar);
  });
});
