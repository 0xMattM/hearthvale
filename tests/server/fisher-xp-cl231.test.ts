import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  FISHING_DOCK,
  WORLD,
  meetsRecipeXpGate,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl231-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherFish } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL23.1 Fisher XP column", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl231_${Date.now().toString(36)}`, "password123");
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

  it("grants fisher XP on successful gatherFish (happy)", () => {
    expect(FISHING_DOCK.xp).toBe(5);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.fisherXp).toBe(0);
    const cookBefore = city.cookXp;
    const dock = city.buildings.find((b) => b.type === "fishing_dock")!;
    expect(dock).toBeTruthy();

    expect(gatherFish(userId, dock.id, buildingPos(dock)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.fisherXp).toBe(FISHING_DOCK.xp);
    expect(after.cookXp).toBe(cookBefore);
    expect(
      after.inventory.some((s) => s.itemId === "fish" && s.qty >= 1),
    ).toBe(true);
  });

  it("keeps fisher gate separate from cook XP (edge)", () => {
    const stew = getRecipe("cook_stew")!;
    const gated = {
      ...stew,
      profession: "fisher" as const,
      minProfessionXp: 10,
    };
    expect(meetsRecipeXpGate(gated, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0)).toBe(
      false,
    );
    expect(meetsRecipeXpGate(gated, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10)).toBe(true);
  });

  it("rejects catch when too far (failure)", () => {
    const state = getPlayerState(userId)!;
    const dock = state.buildings.find((b) => b.type === "fishing_dock")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, dock.id))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    const result = gatherFish(userId, dock.id, { x: 99, z: 99 });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.tooFar);
  });
});
