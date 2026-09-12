import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  CITY_BUILDINGS,
  PLAYER_LAND_STATIONS,
  WORLD,
  getRecipe,
  isPlayerLandStationType,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl91-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

function loomPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const loom = state.buildings.find((b) => b.type === "loom")!;
  return { x: WORLD.GRID * loom.x, z: WORLD.GRID * loom.z };
}

describe("CityLands CL9.1 buildable loom station", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl91_${Date.now().toString(36)}`,
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

  it("lists loom on build catalog and places unlimited looms (happy)", () => {
    expect(isPlayerLandStationType("loom")).toBe(true);
    expect(PLAYER_LAND_STATIONS.loom.kitItemId).toBe("loom_kit");
    expect(getRecipe("weave_cloth")?.station).toBe("loom");
    expect(getRecipe("weave_cloth")?.output.itemId).toBe("cloth");

    const home = getPlayerState(userId)!;
    const pos = boardPos(home);
    db.update(players)
      .set({ softCurrency: 200, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 20);
    addItem(home.playerId, "plank", 10);

    expect(placeLandStation(userId, "loom", pos).ok).toBe(true);
    expect(placeLandStation(userId, "loom", pos).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.buildings.filter((b) => b.type === "loom").length).toBe(2);

    addItem(after.playerId, "leather", 4);
    const woven = craftRecipeComplete(userId, "weave_cloth", loomPos(after));
    expect(woven.ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(
      state.inventory.some((s) => s.itemId === "cloth" && s.qty >= 1),
    ).toBe(true);
  });

  it("keeps city loom scarce (exactly one; CL13.2) (edge)", () => {
    expect(CITY_BUILDINGS.filter((b) => b.type === "loom")).toHaveLength(1);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.buildings.filter((b) => b.type === "loom")).toHaveLength(1);
  });

  it("blocks placing loom on city (failure)", () => {
    // Edge test may already leave us on city — travel or stay both OK for place refuse.
    const travel = travelToLandKind(userId, "city");
    if (!travel.ok) {
      expect(travel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const near = city.buildings[0]!;
    const result = placeLandStation(userId, "loom", {
      x: WORLD.GRID * near.x,
      z: WORLD.GRID * near.z,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
  });
});
