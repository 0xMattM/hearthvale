import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl361-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL36.1 carpenter wood crate plank sink", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl361_${Date.now().toString(36)}`, "password123");
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

  it("assembles wood crate at workshop and grants carpenter XP (happy)", () => {
    const recipe = getRecipe("assemble_wood_crate")!;
    expect(recipe.profession).toBe("carpenter");
    expect(recipe.station).toBe("workshop");
    expect(recipe.inputs).toEqual([{ itemId: "plank", qty: 2 }]);
    expect(recipe.output.itemId).toBe("wood_crate");
    expect(recipe.minProfessionXp).toBe(0);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const workshop = city.buildings.find((b) => b.type === "workshop")!;
    expect(workshop).toBeTruthy();

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    addItem(city.playerId, "plank", 2);
    const carpenterBefore = city.carpenterXp;
    const weaverBefore = city.weaverXp;

    expect(
      craftRecipeComplete(userId, "assemble_wood_crate", buildingPos(workshop)).ok,
    ).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.carpenterXp).toBeGreaterThan(carpenterBefore);
    expect(after.weaverXp).toBe(weaverBefore);
    expect(
      after.inventory.some((s) => s.itemId === "wood_crate" && s.qty >= 1),
    ).toBe(true);
    expect(after.inventory.some((s) => s.itemId === "plank" && s.qty >= 1)).toBe(
      false,
    );
  });

  it("keeps saw_planks and craft_wooden_hoe alongside crate (edge)", () => {
    const saw = getRecipe("saw_planks")!;
    const hoe = getRecipe("craft_wooden_hoe")!;
    const crate = getRecipe("assemble_wood_crate")!;
    expect(saw.station).toBe("workshop");
    expect(hoe.station).toBe("workshop");
    expect(crate.station).toBe("workshop");
    expect(saw.profession).toBe("carpenter");
    expect(hoe.profession).toBe("carpenter");
    expect(crate.profession).toBe("carpenter");
    expect(saw.output.itemId).toBe("plank");
    expect(crate.inputs[0]?.itemId).toBe("plank");
  });

  it("rejects crate craft without planks (failure)", () => {
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    const workshop = city.buildings.find((b) => b.type === "workshop")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    const plankQty = city.inventory
      .filter((s) => s.itemId === "plank")
      .reduce((n, s) => n + s.qty, 0);
    expect(plankQty).toBe(0);

    const result = craftRecipeComplete(
      userId,
      "assemble_wood_crate",
      buildingPos(workshop),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.missingMaterials);
  });
});
