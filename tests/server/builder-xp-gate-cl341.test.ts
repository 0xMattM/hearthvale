import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  PLAYER_LAND_STATIONS,
  WORLD,
  stationMinBuilderXp,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl341-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { players } = await import("../../apps/server/src/db/schema.ts");

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

describe("CityLands CL34.1 builder XP gate on loom", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl341_${Date.now().toString(36)}`,
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

  it("places loom after enough builder XP (happy)", () => {
    expect(PLAYER_LAND_STATIONS.loom.minBuilderXp).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("loom")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("kitchen")).toBe(0);
    expect(stationMinBuilderXp("forge")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("mill")).toBe(BUILDER_PLACE_XP);

    const home = getPlayerState(userId)!;
    const pos = boardPos(home);
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "plank", 4);

    expect(placeLandStation(userId, "loom", pos).ok).toBe(true);
    expect(
      getPlayerState(userId)!.buildings.some((b) => b.type === "loom"),
    ).toBe(true);
    expect(getPlayerState(userId)!.builderXp).toBe(BUILDER_PLACE_XP * 2);
  });

  it("keeps kitchen ungated at 0 builder XP (edge)", () => {
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 100, energy: 100, builderXp: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "iron_ore", 2);
    expect(placeLandStation(userId, "kitchen", boardPos(home)).ok).toBe(true);
  });

  it("refuses loom under builder XP gate (failure)", () => {
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "plank", 4);
    const result = placeLandStation(userId, "loom", boardPos(home));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(
        ACTION_ERROR.needsXp("builder", BUILDER_PLACE_XP),
      );
    }
  });
});
