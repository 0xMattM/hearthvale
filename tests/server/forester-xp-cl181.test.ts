import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, meetsRecipeXpGate, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl181-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL18.1 Forester XP column", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl181_${Date.now().toString(36)}`, "password123");
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

  it("routes tree chop through forester XP (happy)", () => {
    const state = getPlayerState(userId)!;
    const stump = state.buildings.find((b) => b.type === "tree_stump");
    expect(stump).toBeTruthy();
    expect(state.foresterXp).toBe(0);
    const carpenterBefore = state.carpenterXp;

    expect(gatherWood(userId, stump!.id, buildingPos(stump!)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.foresterXp).toBeGreaterThan(0);
    expect(after.carpenterXp).toBe(carpenterBefore);
    expect(after.inventory.some((i) => i.itemId === "wood")).toBe(true);
  });

  it("keeps saw_planks on carpenter XP; forester gate is separate (edge)", () => {
    const state = getPlayerState(userId)!;
    const workshop = state.buildings.find((b) => b.type === "workshop")!;
    const pid = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!.id;
    addItem(pid, "wood", 4);
    const beforeCarpenter = getPlayerState(userId)!.carpenterXp;
    const beforeForester = getPlayerState(userId)!.foresterXp;

    expect(craftRecipeComplete(userId, "saw_planks", buildingPos(workshop)).ok).toBe(
      true,
    );
    const after = getPlayerState(userId)!;
    expect(after.carpenterXp).toBeGreaterThan(beforeCarpenter);
    expect(after.foresterXp).toBe(beforeForester);

    const plank = getRecipe("saw_planks")!;
    const gated = { ...plank, profession: "forester" as const, minProfessionXp: 10 };
    expect(meetsRecipeXpGate(gated, 0, 0, 0, 0, 99, 0, 0)).toBe(false);
    expect(meetsRecipeXpGate(gated, 0, 0, 0, 0, 0, 0, 10)).toBe(true);
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
