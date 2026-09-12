import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  FISHING_DOCK,
  WORLD,
  stationMinBuilderXp,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl442-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { gatherFish } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

describe("CityLands CL44.2 land fishing_dock catch after builder gate", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl442_${Date.now().toString(36)}`,
      "password123",
    );
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

  it("places land dock with builder XP then catches fish for fisher XP (happy)", () => {
    expect(stationMinBuilderXp("fishing_dock")).toBe(BUILDER_PLACE_XP);
    expect(FISHING_DOCK.xp).toBe(5);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "plank", 4);

    expect(placeLandStation(userId, "fishing_dock", boardPos(home)).ok).toBe(
      true,
    );
    const land = getPlayerState(userId)!;
    const dock = land.buildings.find((b) => b.type === "fishing_dock")!;
    expect(dock).toBeTruthy();

    const fisherBefore = land.fisherXp;
    const cookBefore = land.cookXp;
    expect(gatherFish(userId, dock.id, buildingPos(dock)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.fisherXp).toBe(fisherBefore + FISHING_DOCK.xp);
    expect(after.cookXp).toBe(cookBefore);
    expect(
      after.inventory.some((s) => s.itemId === "fish" && s.qty >= 1),
    ).toBe(true);
  });

  it("keeps land dock catch separate from city scarce dock (edge)", () => {
    const land = getPlayerState(userId)!;
    expect(land.landKind).toBe("player_land");
    expect(
      land.buildings.filter((b) => b.type === "fishing_dock"),
    ).toHaveLength(1);
  });

  it("refuses second catch while land dock on cooldown (failure)", () => {
    const land = getPlayerState(userId)!;
    const dock = land.buildings.find((b) => b.type === "fishing_dock")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    const result = gatherFish(userId, dock.id, buildingPos(dock));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.fishingDockCooldown);
    }
  });
});
