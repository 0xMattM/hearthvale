import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, ITEMS } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-pl251-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { repairTool } = await import(
  "../../apps/server/src/game/actions/repair.ts"
);
const { inventory, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

/**
 * PL25.1 — server repair restores max durability for TOOL.repairMats cost.
 */
describe("CityLands PL25.1 repair tool action", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`pl251_${Date.now().toString(36)}`, "password123");
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

  it("restores wooden hoe to max for 1 wood (happy)", () => {
    const state = getPlayerState(userId)!;
    const hoe = state.inventory.find((s) => s.itemId === "wooden_hoe");
    expect(hoe).toBeTruthy();
    const max = ITEMS.wooden_hoe.maxDurability!;
    db.update(inventory)
      .set({ durability: 5 })
      .where(eq(inventory.id, hoe!.id))
      .run();
    addItem(state.playerId, "wood", 1);

    const woodBefore =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "wood")?.qty ??
      0;
    expect(repairTool(userId, hoe!.id).ok).toBe(true);
    const after = getPlayerState(userId)!;
    const repaired = after.inventory.find((s) => s.id === hoe!.id)!;
    expect(repaired.durability).toBe(max);
    const woodAfter =
      after.inventory.find((s) => s.itemId === "wood")?.qty ?? 0;
    expect(woodAfter).toBe(woodBefore - 1);
  });

  it("refuses when already full (edge)", () => {
    const state = getPlayerState(userId)!;
    const hoe = state.inventory.find((s) => s.itemId === "wooden_hoe")!;
    const max = ITEMS.wooden_hoe.maxDurability!;
    expect(hoe.durability).toBe(max);
    addItem(state.playerId, "wood", 1);
    const res = repairTool(userId, hoe.id);
    expect(res.ok).toBe(false);
    expect(res.error).toBe(ACTION_ERROR.toolAlreadyRepaired);
  });

  it("refuses when missing mats (failure)", () => {
    const state = getPlayerState(userId)!;
    const hoe = state.inventory.find((s) => s.itemId === "wooden_hoe")!;
    db.update(inventory)
      .set({ durability: 8 })
      .where(eq(inventory.id, hoe.id))
      .run();
    // Drain wood
    for (const row of db
      .select()
      .from(inventory)
      .where(eq(inventory.playerId, state.playerId))
      .all()
      .filter((r) => r.itemId === "wood")) {
      db.delete(inventory).where(eq(inventory.id, row.id)).run();
    }
    const res = repairTool(userId, hoe.id);
    expect(res.ok).toBe(false);
    expect(res.error).toBe(
      ACTION_ERROR.needMatsRepair(1, ITEMS.wood.name),
    );
    // Leave hoe worn for cleanliness — re-full via direct set
    db.update(inventory)
      .set({ durability: ITEMS.wooden_hoe.maxDurability! })
      .where(eq(inventory.id, hoe.id))
      .run();
    void players;
  });
});
