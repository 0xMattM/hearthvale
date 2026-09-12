import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl362-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

describe("CityLands CL36.2 blacksmith forge hammer / hoe smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl362_${Date.now().toString(36)}`, "password123");
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

  it("forges iron hammer on land forge with blacksmith XP not miner (happy)", () => {
    const hammer = getRecipe("forge_iron_hammer")!;
    const hoe = getRecipe("forge_iron_hoe")!;
    expect(hammer.profession).toBe("blacksmith");
    expect(hammer.station).toBe("forge");
    expect(hoe.profession).toBe("blacksmith");
    expect(hoe.station).toBe("forge");

    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: 8,
        blacksmithXp: 20,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "iron_bar", 4);
    addItem(home.playerId, "wood", 4);
    expect(placeLandStation(userId, "forge", boardPos(home)).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const forge = land.buildings.find((b) => b.type === "forge")!;
    expect(forge).toBeTruthy();
    const smithBefore = land.blacksmithXp;
    const minerBefore = land.minerXp;

    expect(
      craftRecipeComplete(userId, "forge_iron_hammer", buildingPos(forge)).ok,
    ).toBe(true);
    const afterHammer = getPlayerState(userId)!;
    expect(afterHammer.blacksmithXp).toBeGreaterThan(smithBefore);
    expect(afterHammer.minerXp).toBe(minerBefore);
    expect(
      afterHammer.inventory.some((s) => s.itemId === "iron_hammer"),
    ).toBe(true);

    addItem(afterHammer.playerId, "iron_bar", 2);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterHammer.playerId))
      .run();
    const smithMid = getPlayerState(userId)!.blacksmithXp;
    expect(craftRecipeComplete(userId, "forge_iron_hoe", buildingPos(forge)).ok).toBe(
      true,
    );
    const afterHoe = getPlayerState(userId)!;
    expect(afterHoe.blacksmithXp).toBeGreaterThan(smithMid);
    expect(afterHoe.minerXp).toBe(minerBefore);
    expect(afterHoe.inventory.some((s) => s.itemId === "iron_hoe")).toBe(true);
  });

  it("keeps smelt_iron_bar on forge for blacksmith bootstrap (edge)", () => {
    const smelt = getRecipe("smelt_iron_bar")!;
    expect(smelt.profession).toBe("blacksmith");
    expect(smelt.station).toBe("forge");
    expect(smelt.minProfessionXp).toBe(0);
    expect(getRecipe("forge_iron_hammer")!.minProfessionXp).toBe(20);
  });

  it("rejects forge hammer without iron bars (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const forge = city.buildings.find((b) => b.type === "forge")!;
    db.update(players)
      .set({ energy: 100, blacksmithXp: 20 })
      .where(eq(players.id, city.playerId))
      .run();
    const bars = city.inventory
      .filter((s) => s.itemId === "iron_bar")
      .reduce((n, s) => n + s.qty, 0);
    expect(bars).toBe(0);

    const result = craftRecipeComplete(
      userId,
      "forge_iron_hammer",
      buildingPos(forge),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.missingMaterials);
  });
});
