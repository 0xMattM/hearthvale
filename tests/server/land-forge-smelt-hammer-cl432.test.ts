import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, BUILDER_PLACE_XP, WORLD, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl432-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem, removeItem } = await import(
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

describe("CityLands CL43.2 land forge smelt → hammer smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl432_${Date.now().toString(36)}`,
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

  it("smelts bars then forges hammer on land with blacksmith XP not miner (happy)", () => {
    const smelt = getRecipe("smelt_iron_bar")!;
    const hammer = getRecipe("forge_iron_hammer")!;
    expect(smelt.profession).toBe("blacksmith");
    expect(smelt.station).toBe("forge");
    expect(hammer.profession).toBe("blacksmith");
    expect(hammer.station).toBe("forge");
    expect(hammer.minProfessionXp).toBe(20);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
        blacksmithXp: 20,
      })
      .where(eq(players.id, home.playerId))
      .run();
    // forge place mats + ore for two smelts (2 bars) → hammer
    addItem(home.playerId, "iron_bar", 2);
    addItem(home.playerId, "wood", 2);
    addItem(home.playerId, "iron_ore", 4);

    expect(placeLandStation(userId, "forge", boardPos(home)).ok).toBe(true);
    const land = getPlayerState(userId)!;
    const forge = land.buildings.find((b) => b.type === "forge")!;
    expect(forge).toBeTruthy();

    const smithBefore = land.blacksmithXp;
    const minerBefore = land.minerXp;

    expect(craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge)).ok).toBe(
      true,
    );
    expect(craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge)).ok).toBe(
      true,
    );
    const afterSmelt = getPlayerState(userId)!;
    expect(afterSmelt.blacksmithXp).toBeGreaterThan(smithBefore);
    expect(afterSmelt.minerXp).toBe(minerBefore);
    expect(
      afterSmelt.inventory.some((s) => s.itemId === "iron_bar" && s.qty >= 2),
    ).toBe(true);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterSmelt.playerId))
      .run();
    const smithMid = getPlayerState(userId)!.blacksmithXp;
    expect(
      craftRecipeComplete(userId, "forge_iron_hammer", buildingPos(forge)).ok,
    ).toBe(true);
    const afterHammer = getPlayerState(userId)!;
    expect(afterHammer.blacksmithXp).toBeGreaterThan(smithMid);
    expect(afterHammer.minerXp).toBe(minerBefore);
    expect(
      afterHammer.inventory.some((s) => s.itemId === "iron_hammer"),
    ).toBe(true);
  });

  it("refuses forge hammer without iron bars on land forge (failure)", () => {
    const land = getPlayerState(userId)!;
    const forge = land.buildings.find((b) => b.type === "forge")!;
    expect(forge).toBeTruthy();
    db.update(players)
      .set({ energy: 100, blacksmithXp: 20 })
      .where(eq(players.id, land.playerId))
      .run();
    const bars = land.inventory
      .filter((s) => s.itemId === "iron_bar")
      .reduce((n, s) => n + s.qty, 0);
    if (bars > 0) removeItem(land.playerId, "iron_bar", bars);

    const result = craftRecipeComplete(
      userId,
      "forge_iron_hammer",
      buildingPos(forge),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.missingMaterials);
  });

  it("refuses smelt without ore on land forge (edge)", () => {
    const land = getPlayerState(userId)!;
    const forge = land.buildings.find((b) => b.type === "forge")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    const ore = land.inventory
      .filter((s) => s.itemId === "iron_ore")
      .reduce((n, s) => n + s.qty, 0);
    if (ore > 0) removeItem(land.playerId, "iron_ore", ore);

    const result = craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.missingMaterials);
  });
});
