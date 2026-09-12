import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  ORE_NODE,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl563-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherOre } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

function equipHammer(uid: string) {
  const pid = db.select().from(players).where(eq(players.userId, uid)).get()!
    .id;
  addItem(pid, "iron_hammer", 1);
  const hammer = getPlayerState(uid)!.inventory.find(
    (i) => i.itemId === "iron_hammer",
  )!;
  db.update(players)
    .set({ equippedToolInventoryId: hammer.id })
    .where(eq(players.id, pid))
    .run();
}

describe("CityLands CL56.3 Miner XP stays on chip not smelt", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl563_${Date.now().toString(36)}`,
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

  it("grants miner on Explore/land chip and blacksmith on smelt only (happy)", () => {
    const recipe = getRecipe("smelt_iron_bar")!;
    expect(recipe.profession).toBe("blacksmith");
    expect(recipe.minProfessionXp ?? 0).toBe(0);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const exploreNode = explore.buildings.find((b) => b.type === "ore_node")!;
    expect(exploreNode).toBeTruthy();

    db.update(players)
      .set({ energy: 100, minerXp: 0, blacksmithXp: 0 })
      .where(eq(players.id, explore.playerId))
      .run();
    equipHammer(userId);

    expect(
      gatherOre(userId, exploreNode.id, buildingPos(exploreNode)).ok,
    ).toBe(true);
    const afterExplore = getPlayerState(userId)!;
    expect(afterExplore.minerXp).toBe(ORE_NODE.xp);
    expect(afterExplore.blacksmithXp).toBe(0);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "iron_ore", 1);
    expect(placeLandStation(userId, "ore_node", boardPos(home)).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const landNode = land.buildings.find((b) => b.type === "ore_node")!;
    expect(landNode).toBeTruthy();
    equipHammer(userId);
    const minerAfterExplore = land.minerXp;
    const smithStillZero = land.blacksmithXp;
    expect(smithStillZero).toBe(0);

    expect(gatherOre(userId, landNode.id, buildingPos(landNode)).ok).toBe(
      true,
    );
    const afterLandChip = getPlayerState(userId)!;
    expect(afterLandChip.minerXp).toBe(minerAfterExplore + ORE_NODE.xp);
    expect(afterLandChip.blacksmithXp).toBe(0);

    addItem(afterLandChip.playerId, "iron_bar", 2);
    addItem(afterLandChip.playerId, "wood", 2);
    // Reason: need ≥2 ore for smelt; chips may leave 1 — top up from bag for craft only.
    const oreNow = afterLandChip.inventory
      .filter((s) => s.itemId === "iron_ore")
      .reduce((n, s) => n + s.qty, 0);
    if (oreNow < 2) addItem(afterLandChip.playerId, "iron_ore", 2 - oreNow);

    expect(
      placeLandStation(userId, "forge", boardPos(getPlayerState(userId)!)).ok,
    ).toBe(true);
    const withForge = getPlayerState(userId)!;
    const forge = withForge.buildings.find((b) => b.type === "forge")!;
    expect(forge).toBeTruthy();

    const minerBeforeSmelt = withForge.minerXp;
    const smithBeforeSmelt = withForge.blacksmithXp;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, withForge.playerId))
      .run();
    expect(craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge)).ok).toBe(
      true,
    );
    const afterSmelt = getPlayerState(userId)!;
    expect(afterSmelt.minerXp).toBe(minerBeforeSmelt);
    expect(afterSmelt.blacksmithXp).toBeGreaterThan(smithBeforeSmelt);
    // Reason: XP columns stay distinct — chip never credits blacksmith; smelt never miner.
    expect(afterSmelt.minerXp).toBe(ORE_NODE.xp * 2);
  });

  it("still requires hammer on chip (edge)", () => {
    const land = getPlayerState(userId)!;
    const node = land.buildings.find((b) => b.type === "ore_node")!;
    expect(node).toBeTruthy();
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, node.id))
      .run();
    db.update(players)
      .set({ equippedToolInventoryId: null, energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();

    const result = gatherOre(userId, node.id, buildingPos(node));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.needHammer);
    }
  });

  it("refuses smelt without ore while miner XP unchanged (failure)", () => {
    const land = getPlayerState(userId)!;
    const forge = land.buildings.find((b) => b.type === "forge")!;
    expect(forge).toBeTruthy();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    const oreQty = land.inventory
      .filter((s) => s.itemId === "iron_ore")
      .reduce((n, s) => n + s.qty, 0);
    if (oreQty > 0) removeItem(land.playerId, "iron_ore", oreQty);

    const minerBefore = getPlayerState(userId)!.minerXp;
    const smithBefore = getPlayerState(userId)!.blacksmithXp;
    const result = craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
    const after = getPlayerState(userId)!;
    expect(after.minerXp).toBe(minerBefore);
    expect(after.blacksmithXp).toBe(smithBefore);
  });
});
