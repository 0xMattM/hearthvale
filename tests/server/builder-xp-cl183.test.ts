import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  meetsRecipeXpGate,
  getRecipe,
} from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl183-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
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

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL18.3 Builder XP on placeLandStation", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl183_${Date.now().toString(36)}`, "password123");
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

  it("grants builder XP when placeLandStation succeeds (happy)", () => {
    // Bootstrap already spawns on empty player_land (travel to same map fails).
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    expect(home.builderXp).toBe(0);
    const board = home.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
    addItem(home.playerId, "wood", 4);

    expect(
      placeLandStation(userId, "crop_plot", buildingPos(board)).ok,
    ).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.builderXp).toBe(BUILDER_PLACE_XP);
    expect(after.buildings.some((b) => b.type === "crop_plot")).toBe(true);
  });

  it("city place stays blocked and grants no builder XP (failure)", () => {
    const fresh = registerUser(
      `cl183f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    const before = getPlayerState(other)!.builderXp;
    const cityPlace = placeLandStation(other, "crop_plot", { x: 0, z: 0 });
    expect(cityPlace.ok).toBe(false);
    if (!cityPlace.ok) {
      expect(cityPlace.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }
    expect(getPlayerState(other)!.builderXp).toBe(before);
  });

  it("builder XP gate is separate from craft professions (edge)", () => {
    const recipe = getRecipe("smelt_iron_bar")!;
    const gated = {
      ...recipe,
      profession: "builder" as const,
      minProfessionXp: BUILDER_PLACE_XP,
    };
    expect(meetsRecipeXpGate(gated, 0, 99, 0, 0, 0, 0, 0, 0, 0)).toBe(false);
    expect(
      meetsRecipeXpGate(gated, 0, 0, 0, 0, 0, 0, 0, 0, BUILDER_PLACE_XP),
    ).toBe(true);
  });
});
