import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  FOOD_RESTORE,
  WORLD,
  cityNoticeBoardTips,
  fishToKitchenTip,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl293-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
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

function kitchenPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const kitchen = state.buildings.find((b) => b.type === "kitchen")!;
  return { x: WORLD.GRID * kitchen.x, z: WORLD.GRID * kitchen.z };
}

describe("CityLands CL29.3 cook fish tip + stew sink assert", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl293_${Date.now().toString(36)}`, "password123");
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

  it("keeps fish_to_kitchen tip + cook_fish / cook_stew sinks green (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "fish_to_kitchen");
    expect(tip).toBeTruthy();
    expect(tip!.body).toBe(fishToKitchenTip());
    expect(tip!.body.toLowerCase()).toMatch(/fish|kitchen|cook/);

    const cookFish = getRecipe("cook_fish")!;
    const stew = getRecipe("cook_stew")!;
    expect(cookFish.profession).toBe("cook");
    expect(cookFish.station).toBe("kitchen");
    expect(stew.profession).toBe("cook");
    expect(stew.station).toBe("kitchen");
    expect(FOOD_RESTORE.cooked_fish).toBeGreaterThan(0);
    expect(FOOD_RESTORE.stew).toBeGreaterThan(FOOD_RESTORE.cooked_fish);

    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, cookXp: 20 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 20);
    addItem(home.playerId, "plank", 10);
    expect(placeLandStation(userId, "kitchen", boardPos(home)).ok).toBe(true);

    const built = getPlayerState(userId)!;
    addItem(built.playerId, "fish", 1);
    addItem(built.playerId, "flour", 1);
    addItem(built.playerId, "raw_meat", 1);
    const cookBefore = built.cookXp;

    expect(craftRecipeComplete(userId, "cook_fish", kitchenPos(built)).ok).toBe(true);
    expect(craftRecipeComplete(userId, "cook_stew", kitchenPos(built)).ok).toBe(true);

    const after = getPlayerState(userId)!;
    expect(after.cookXp).toBeGreaterThan(cookBefore);
    expect(
      after.inventory.some((s) => s.itemId === "cooked_fish" && s.qty >= 1),
    ).toBe(true);
    expect(after.inventory.some((s) => s.itemId === "stew" && s.qty >= 1)).toBe(
      true,
    );
  });

  it("keeps fish tip id unique on notice board (edge)", () => {
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "fish_to_kitchen")).toHaveLength(1);
  });

  it("rejects stew without mats (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ cookXp: 20, energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    // No flour/raw_meat granted — stew must refuse.
    const result = craftRecipeComplete(userId, "cook_stew", {
      x: WORLD.GRID * kitchen.x,
      z: WORLD.GRID * kitchen.z,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.missingMaterials);
  });
});
