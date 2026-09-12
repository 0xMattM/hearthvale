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
  `game-cl561-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL56.1 Explore ore chip → land smelt e2e", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl561_${Date.now().toString(36)}`,
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

  it("chips Explore ore then smelts iron_bar on land forge with blacksmith XP (happy)", () => {
    const recipe = getRecipe("smelt_iron_bar")!;
    expect(recipe.profession).toBe("blacksmith");
    expect(recipe.station).toBe("forge");
    expect(recipe.inputs).toEqual([{ itemId: "iron_ore", qty: 2 }]);
    expect(recipe.output.itemId).toBe("iron_bar");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.landKind).toBe("explore");
    const nodes = explore.buildings.filter((b) => b.type === "ore_node");
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    // Reason: e2e asserts live Explore chip → smelt — clear starter ore first.
    const leftoverOre = explore.inventory
      .filter((s) => s.itemId === "iron_ore")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverOre > 0) removeItem(explore.playerId, "iron_ore", leftoverOre);

    equipHammer(userId);
    const minerBefore = getPlayerState(userId)!.minerXp;
    expect(gatherOre(userId, nodes[0]!.id, buildingPos(nodes[0]!)).ok).toBe(
      true,
    );
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    expect(gatherOre(userId, nodes[1]!.id, buildingPos(nodes[1]!)).ok).toBe(
      true,
    );
    const afterChip = getPlayerState(userId)!;
    const oreQty = afterChip.inventory
      .filter((s) => s.itemId === "iron_ore")
      .reduce((n, s) => n + s.qty, 0);
    expect(oreQty).toBeGreaterThanOrEqual(2);
    expect(afterChip.minerXp).toBe(minerBefore + ORE_NODE.xp * 2);

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
    // Reason: forge place mats are separate from Explore ore under test.
    addItem(home.playerId, "iron_bar", 2);
    addItem(home.playerId, "wood", 2);

    expect(placeLandStation(userId, "forge", boardPos(home)).ok).toBe(true);
    const land = getPlayerState(userId)!;
    const forge = land.buildings.find((b) => b.type === "forge")!;
    expect(forge).toBeTruthy();

    const smithBefore = land.blacksmithXp;
    const minerMid = land.minerXp;
    const barsBefore = land.inventory
      .filter((s) => s.itemId === "iron_bar")
      .reduce((n, s) => n + s.qty, 0);

    expect(craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge)).ok).toBe(
      true,
    );
    const afterSmelt = getPlayerState(userId)!;
    expect(afterSmelt.blacksmithXp).toBeGreaterThan(smithBefore);
    expect(afterSmelt.minerXp).toBe(minerMid);
    expect(
      afterSmelt.inventory
        .filter((s) => s.itemId === "iron_bar")
        .reduce((n, s) => n + s.qty, 0),
    ).toBe(barsBefore + 1);
  });

  it("keeps homestead ore chip path OK (edge)", () => {
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({ softCurrency: 100, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "iron_ore", 1);

    expect(
      placeLandStation(userId, "ore_node", boardPos(getPlayerState(userId)!))
        .ok,
    ).toBe(true);
    const land = getPlayerState(userId)!;
    const node = land.buildings.find((b) => b.type === "ore_node")!;
    expect(node).toBeTruthy();

    equipHammer(userId);
    const minerBefore = land.minerXp;
    const smithBefore = land.blacksmithXp;
    expect(gatherOre(userId, node.id, buildingPos(node)).ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.minerXp).toBe(minerBefore + ORE_NODE.xp);
    expect(after.blacksmithXp).toBe(smithBefore);
    expect(after.inventory.some((s) => s.itemId === "iron_ore")).toBe(true);
  });

  it("refuses land smelt without iron_ore (failure)", () => {
    const land = getPlayerState(userId)!;
    expect(land.landKind).toBe("player_land");
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

    const result = craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
