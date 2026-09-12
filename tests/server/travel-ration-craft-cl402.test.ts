import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ENERGY,
  FOOD_RESTORE,
  TRAVEL,
  WORLD,
  cityNoticeBoardTips,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl402-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete, eatFood } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function playerId(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!.id;
}

describe("CityLands CL40.2 Travel ration craft assert", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl402_${Date.now().toString(36)}`, "password123");
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

  it("packs travel_ration at kitchen for cook XP and eats for energy (happy)", () => {
    const recipe = getRecipe("pack_travel_ration")!;
    expect(recipe.profession).toBe("cook");
    expect(recipe.station).toBe("kitchen");
    expect(recipe.output.itemId).toBe("travel_ration");
    expect(recipe.minProfessionXp).toBe(25);
    expect(FOOD_RESTORE.travel_ration).toBe(ENERGY.rationRestore);
    expect(ENERGY.rationRestore).toBeGreaterThan(ENERGY.stewRestore);
    expect(TRAVEL.rationItemId).toBe("travel_ration");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    expect(kitchen).toBeTruthy();

    const pid = playerId(userId);
    db.update(players)
      .set({ cookXp: 25, energy: 100 })
      .where(eq(players.id, pid))
      .run();
    // Clear leftovers so craft inputs are exactly what we grant.
    const prior = getPlayerState(userId)!;
    for (const id of ["bread", "cooked_meat", "travel_ration"] as const) {
      const qty =
        prior.inventory.find((s) => s.itemId === id)?.qty ?? 0;
      if (qty > 0) removeItem(pid, id, qty);
    }
    addItem(pid, "bread", 1);
    addItem(pid, "cooked_meat", 1);
    const cookBefore = getPlayerState(userId)!.cookXp;
    const farmerBefore = getPlayerState(userId)!.farmerXp;

    expect(
      craftRecipeComplete(userId, "pack_travel_ration", buildingPos(kitchen)).ok,
    ).toBe(true);

    const afterCraft = getPlayerState(userId)!;
    expect(afterCraft.cookXp).toBe(cookBefore + 8);
    expect(afterCraft.farmerXp).toBe(farmerBefore);
    expect(
      afterCraft.inventory.some(
        (s) => s.itemId === "travel_ration" && s.qty >= 1,
      ),
    ).toBe(true);
    expect(
      afterCraft.inventory.find((s) => s.itemId === "bread")?.qty ?? 0,
    ).toBe(0);
    expect(
      afterCraft.inventory.find((s) => s.itemId === "cooked_meat")?.qty ?? 0,
    ).toBe(0);

    db.update(players).set({ energy: 10 }).where(eq(players.id, pid)).run();
    const beforeEat = getPlayerState(userId)!;
    expect(beforeEat.energy).toBe(10);
    const health = beforeEat.health;
    const damage = beforeEat.damage;
    const defense = beforeEat.defense;
    const cookXp = beforeEat.cookXp;

    expect(eatFood(userId, "travel_ration").ok).toBe(true);
    const afterEat = getPlayerState(userId)!;
    expect(afterEat.energy).toBe(
      Math.min(afterEat.maxEnergy, 10 + ENERGY.rationRestore),
    );
    expect(afterEat.inventory.some((s) => s.itemId === "travel_ration")).toBe(
      false,
    );
    // Reason: ration is energy food only — free travel (CL1.2) never spends it.
    expect(afterEat.cookXp).toBe(cookXp);
    expect(afterEat.health).toBe(health);
    expect(afterEat.damage).toBe(damage);
    expect(afterEat.defense).toBe(defense);
  });

  it("keeps free travel fare-free while ration stays craftable food (edge)", () => {
    const travelTip = cityNoticeBoardTips().find((t) => t.id === "travel_circuit");
    expect(travelTip).toBeTruthy();
    expect(travelTip!.body.toLowerCase()).toMatch(/no fare|travel ration/);
    expect(getRecipe("pack_travel_ration")!.inputs.map((i) => i.itemId).sort()).toEqual(
      ["bread", "cooked_meat"],
    );
  });

  it("rejects pack_travel_ration without materials (failure)", () => {
    const here = getPlayerState(userId)!;
    if (here.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const city = getPlayerState(userId)!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    db.update(players)
      .set({ cookXp: 25, energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    for (const id of ["bread", "cooked_meat"] as const) {
      const qty =
        getPlayerState(userId)!.inventory.find((s) => s.itemId === id)?.qty ??
        0;
      if (qty > 0) removeItem(city.playerId, id, qty);
    }
    expect(
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "bread")
        ?.qty ?? 0,
    ).toBe(0);

    const result = craftRecipeComplete(
      userId,
      "pack_travel_ration",
      buildingPos(kitchen),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
