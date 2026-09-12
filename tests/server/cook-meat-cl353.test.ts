import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  FOOD_RESTORE,
  WORLD,
  cityNoticeBoardTips,
  getRecipe,
  meatToKitchenTip,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl353-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL35.3 cook meat assert", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl353_${Date.now().toString(36)}`, "password123");
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

  it("cooks raw meat at kitchen with cook XP + meat_to_kitchen tip (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "meat_to_kitchen");
    expect(tip).toBeTruthy();
    expect(tip!.body).toBe(meatToKitchenTip());
    expect(tip!.body.toLowerCase()).toMatch(/meat|kitchen|cook/);

    const recipe = getRecipe("cook_meat")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.station).toBe("kitchen");
    expect(FOOD_RESTORE.cooked_meat).toBeGreaterThan(0);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    expect(kitchen).toBeTruthy();

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    addItem(city.playerId, "raw_meat", 1);
    const cookBefore = city.cookXp;
    const farmerBefore = city.farmerXp;

    expect(craftRecipeComplete(userId, "cook_meat", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const after = getPlayerState(userId)!;
    expect(after.cookXp).toBeGreaterThan(cookBefore);
    expect(after.farmerXp).toBe(farmerBefore);
    expect(
      after.inventory.some((s) => s.itemId === "cooked_meat" && s.qty >= 1),
    ).toBe(true);
    expect(after.inventory.some((s) => s.itemId === "raw_meat")).toBe(false);
  });

  it("keeps meat_to_kitchen tip id unique (edge)", () => {
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "meat_to_kitchen")).toHaveLength(1);
  });

  it("rejects cook_meat without raw meat (failure)", () => {
    // Happy path already left us on City — stay put (travelAlreadyHere if re-called).
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    const meatQty = city.inventory
      .filter((s) => s.itemId === "raw_meat")
      .reduce((n, s) => n + s.qty, 0);
    if (meatQty > 0) removeItem(city.playerId, "raw_meat", meatQty);

    const result = craftRecipeComplete(userId, "cook_meat", buildingPos(kitchen));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
