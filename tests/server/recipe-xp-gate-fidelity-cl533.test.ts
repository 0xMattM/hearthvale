import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl533-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem, removeItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
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

/**
 * CL53.3 — recipe XP gate fidelity for pack_travel_ration / forge_iron_hammer.
 * Choice: assert-only existing gates (cook 25 / blacksmith 20) over retuning.
 */
describe("CityLands CL53.3 recipe XP gate fidelity smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl533_${Date.now().toString(36)}`,
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

  it("refuses under-gated ration and hammer; succeeds with enough XP (happy)", () => {
    const ration = getRecipe("pack_travel_ration")!;
    const hammer = getRecipe("forge_iron_hammer")!;
    expect(ration.minProfessionXp).toBe(25);
    expect(ration.profession).toBe("cook");
    expect(hammer.minProfessionXp).toBe(20);
    expect(hammer.profession).toBe("blacksmith");

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
        cookXp: 0,
        blacksmithXp: 0,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "iron_bar", 4);
    addItem(home.playerId, "iron_ore", 1);

    const pos = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "kitchen", pos).ok).toBe(true);
    expect(placeLandStation(userId, "forge", pos).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    const forge = land.buildings.find((b) => b.type === "forge")!;
    expect(kitchen).toBeTruthy();
    expect(forge).toBeTruthy();

    addItem(land.playerId, "bread", 1);
    addItem(land.playerId, "cooked_meat", 1);
    addItem(land.playerId, "iron_bar", 2);

    const underRation = craftRecipeComplete(
      userId,
      "pack_travel_ration",
      buildingPos(kitchen),
    );
    expect(underRation.ok).toBe(false);
    if (!underRation.ok) {
      expect(underRation.error).toBe(ACTION_ERROR.needsXp("Cook", 25));
    }

    const underHammer = craftRecipeComplete(
      userId,
      "forge_iron_hammer",
      buildingPos(forge),
    );
    expect(underHammer.ok).toBe(false);
    if (!underHammer.ok) {
      expect(underHammer.error).toBe(
        ACTION_ERROR.needsXp("Blacksmith", 20),
      );
    }

    db.update(players)
      .set({ cookXp: 25, blacksmithXp: 20, energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();

    expect(
      craftRecipeComplete(userId, "pack_travel_ration", buildingPos(kitchen)).ok,
    ).toBe(true);
    expect(
      craftRecipeComplete(userId, "forge_iron_hammer", buildingPos(forge)).ok,
    ).toBe(true);
    const after = getPlayerState(userId)!;
    expect(
      after.inventory.some((s) => s.itemId === "travel_ration"),
    ).toBe(true);
    expect(after.inventory.some((s) => s.itemId === "iron_hammer")).toBe(
      true,
    );
  });

  it("keeps ungated bake_bread / smelt_iron_bar at 0 XP (edge)", () => {
    expect(getRecipe("bake_bread")!.minProfessionXp).toBe(0);
    expect(getRecipe("smelt_iron_bar")!.minProfessionXp).toBe(0);
    expect(getRecipe("pack_travel_ration")!.minProfessionXp).toBe(25);
    expect(getRecipe("forge_iron_hammer")!.minProfessionXp).toBe(20);
  });

  it("refuses pack_travel_ration under XP even with materials (failure)", () => {
    const fresh = registerUser(
      `cl533f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    const city = getPlayerState(other)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ cookXp: 24, energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    for (const id of ["bread", "cooked_meat", "travel_ration"] as const) {
      const qty =
        getPlayerState(other)!.inventory.find((s) => s.itemId === id)?.qty ??
        0;
      if (qty > 0) removeItem(city.playerId, id, qty);
    }
    addItem(city.playerId, "bread", 1);
    addItem(city.playerId, "cooked_meat", 1);

    const result = craftRecipeComplete(
      other,
      "pack_travel_ration",
      buildingPos(kitchen),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.needsXp("Cook", 25));
    }
  });
});
