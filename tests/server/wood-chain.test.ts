import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-wood-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { gatherWood } = await import(
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

describe("carpenter wood chain F10.2", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `wood_${Date.now().toString(36)}`,
      "password123",
    );
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

  it("chops wood and grants forester XP (happy / CL18.1)", () => {
    const state = getPlayerState(userId)!;
    const stump = state.buildings.find((b) => b.type === "tree_stump");
    expect(stump).toBeTruthy();
    const carpenterBefore = state.carpenterXp;
    const result = gatherWood(userId, stump!.id, buildingPos(stump!));
    expect(result.ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.inventory.some((i) => i.itemId === "wood")).toBe(true);
    expect(after.foresterXp).toBeGreaterThan(0);
    expect(after.carpenterXp).toBe(carpenterBefore);
  });

  it("saws planks at workshop (edge)", () => {
    const state = getPlayerState(userId)!;
    const workshop = state.buildings.find((b) => b.type === "workshop")!;
    addItem(
      db.select().from(players).where(eq(players.userId, userId)).get()!.id,
      "wood",
      4,
    );
    const result = craftRecipeComplete(userId, "saw_planks", buildingPos(workshop));
    expect(result.ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.some((i) => i.itemId === "plank"),
    ).toBe(true);
  });

  it("rejects stump chop when too far (failure)", () => {
    const state = getPlayerState(userId)!;
    const stump = state.buildings.find((b) => b.type === "tree_stump")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, stump.id))
      .run();
    const result = gatherWood(userId, stump.id, { x: 99, z: 99 });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.tooFar);
  });
});
