import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  WOOD_STUMP,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl831-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { gatherWood } = await import(
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

/**
 * CL83.1 — Explore wood → land saw_planks still green.
 * Choice: assert-only fidelity (parity with CL71.1; no Content Lock retune).
 */
describe("CityLands CL83.1 Explore wood → land saw_planks still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl831_${Date.now().toString(36)}`,
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

  it("chops Explore wood then saws planks on land workshop (happy)", () => {
    const recipe = getRecipe("saw_planks")!;
    expect(recipe.profession).toBe("carpenter");
    expect(recipe.station).toBe("workshop");
    expect(recipe.inputs).toEqual([{ itemId: "wood", qty: 2 }]);
    expect(recipe.output.itemId).toBe("plank");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.landKind).toBe("explore");
    const stumps = explore.buildings.filter((b) => b.type === "tree_stump");
    expect(stumps.length).toBeGreaterThanOrEqual(2);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    // Reason: e2e asserts live Explore chop → saw — clear starter wood first.
    const leftoverWood = explore.inventory
      .filter((s) => s.itemId === "wood")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverWood > 0) removeItem(explore.playerId, "wood", leftoverWood);

    const foresterBefore = getPlayerState(userId)!.foresterXp;
    expect(gatherWood(userId, stumps[0]!.id, buildingPos(stumps[0]!)).ok).toBe(
      true,
    );
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    expect(gatherWood(userId, stumps[1]!.id, buildingPos(stumps[1]!)).ok).toBe(
      true,
    );
    const afterChop = getPlayerState(userId)!;
    const woodQty = afterChop.inventory
      .filter((s) => s.itemId === "wood")
      .reduce((n, s) => n + s.qty, 0);
    expect(woodQty).toBeGreaterThanOrEqual(2);
    expect(afterChop.foresterXp).toBe(foresterBefore + WOOD_STUMP.xp * 2);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    // Reason: workshop place mats are separate from Explore wood under test.
    addItem(home.playerId, "wood", 4);
    addItem(home.playerId, "plank", 2);

    expect(placeLandStation(userId, "workshop", boardPos(home)).ok).toBe(true);
    const land = getPlayerState(userId)!;
    const workshop = land.buildings.find((b) => b.type === "workshop")!;
    expect(workshop).toBeTruthy();

    // Reason: clear place leftover wood so saw inputs are Explore chops only.
    const woodAfterPlace = land.inventory
      .filter((s) => s.itemId === "wood")
      .reduce((n, s) => n + s.qty, 0);
    if (woodAfterPlace > woodQty) {
      removeItem(land.playerId, "wood", woodAfterPlace - woodQty);
    }
    const plankLeftover = land.inventory
      .filter((s) => s.itemId === "plank")
      .reduce((n, s) => n + s.qty, 0);
    if (plankLeftover > 0) removeItem(land.playerId, "plank", plankLeftover);

    const carpenterBefore = getPlayerState(userId)!.carpenterXp;
    const foresterMid = getPlayerState(userId)!.foresterXp;
    expect(craftRecipeComplete(userId, "saw_planks", buildingPos(workshop)).ok).toBe(
      true,
    );
    const afterSaw = getPlayerState(userId)!;
    expect(afterSaw.carpenterXp).toBeGreaterThan(carpenterBefore);
    expect(afterSaw.foresterXp).toBe(foresterMid);
    expect(
      afterSaw.inventory.some((s) => s.itemId === "plank" && s.qty >= 1),
    ).toBe(true);
  });

  it("keeps saw_planks as carpenter craft not forester (edge)", () => {
    expect(getRecipe("saw_planks")!.profession).toBe("carpenter");
    expect(getRecipe("saw_planks")!.profession).not.toBe("forester");
    const land = getPlayerState(userId)!;
    expect(land.landKind).toBe("player_land");
    expect(land.buildings.some((b) => b.type === "workshop")).toBe(true);
  });

  it("refuses land saw_planks without wood (failure)", () => {
    const land = getPlayerState(userId)!;
    expect(land.landKind).toBe("player_land");
    const workshop = land.buildings.find((b) => b.type === "workshop")!;
    expect(workshop).toBeTruthy();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    const woodQty = land.inventory
      .filter((s) => s.itemId === "wood")
      .reduce((n, s) => n + s.qty, 0);
    if (woodQty > 0) removeItem(land.playerId, "wood", woodQty);

    const result = craftRecipeComplete(userId, "saw_planks", buildingPos(workshop));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
