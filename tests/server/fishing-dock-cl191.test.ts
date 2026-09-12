import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  FISHING_DOCK,
  ITEMS,
  PLAYER_LAND_STATIONS,
  WORLD,
  isPlayerLandStationType,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl191-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { gatherFish } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

function dockPos(state: {
  buildings: Array<{ type: string; x: number; z: number; id?: string }>;
}) {
  const dock = state.buildings.find((b) => b.type === "fishing_dock")!;
  return { x: WORLD.GRID * dock.x, z: WORLD.GRID * dock.z, id: dock.id! };
}

describe("CityLands CL19.1 fish item + fishing dock on player land", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl191_${Date.now().toString(36)}`,
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

  it("lists dock on build catalog, places unlimited, catches fish (happy)", () => {
    expect(ITEMS.fish.name).toBe("Fish");
    expect(isPlayerLandStationType("fishing_dock")).toBe(true);
    expect(PLAYER_LAND_STATIONS.fishing_dock.kitItemId).toBe("fishing_dock_kit");
    expect(FISHING_DOCK.yieldItemId).toBe("fish");

    const home = getPlayerState(userId)!;
    const pos = boardPos(home);
    db.update(players)
      .set({ softCurrency: 200, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 20);
    addItem(home.playerId, "plank", 10);

    expect(placeLandStation(userId, "fishing_dock", pos).ok).toBe(true);
    expect(placeLandStation(userId, "fishing_dock", pos).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(
      after.buildings.filter((b) => b.type === "fishing_dock").length,
    ).toBe(2);

    const dock = dockPos(after);
    expect(gatherFish(userId, dock.id, { x: dock.x, z: dock.z }).ok).toBe(
      true,
    );
    const state = getPlayerState(userId)!;
    expect(
      state.inventory.some((s) => s.itemId === "fish" && s.qty >= 1),
    ).toBe(true);
  });

  it("blocks catch while dock is on cooldown (edge)", () => {
    const state = getPlayerState(userId)!;
    const dock = state.buildings.find((b) => b.type === "fishing_dock")!;
    const again = gatherFish(userId, dock.id, {
      x: WORLD.GRID * dock.x,
      z: WORLD.GRID * dock.z,
    });
    expect(again.ok).toBe(false);
    expect(again.error).toBe(ACTION_ERROR.fishingDockCooldown);
  });

  it("blocks placing fishing dock on city (failure)", () => {
    const travel = travelToLandKind(userId, "city");
    if (!travel.ok) {
      expect(travel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const near = city.buildings[0]!;
    const result = placeLandStation(userId, "fishing_dock", {
      x: WORLD.GRID * near.x,
      z: WORLD.GRID * near.z,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
  });
});
