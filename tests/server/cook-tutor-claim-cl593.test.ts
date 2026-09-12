import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  TUTORIAL_NPCS,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl593-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
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

/** Clears bake_bread proxies so Cook stays active until a live kitchen craft. */
function clearCookObjectiveMats(uid: string) {
  const state = getPlayerState(uid)!;
  for (const id of ["bread", "cooked_meat", "stew"] as const) {
    const qty = state.inventory
      .filter((s) => s.itemId === id)
      .reduce((n, s) => n + s.qty, 0);
    if (qty > 0) removeItem(state.playerId, id, qty);
  }
}

/**
 * CL59.3 — Land cook_meat → City Cook tutor claim.
 * Choice: cook_meat over cook_fish — objective lists cooked_meat explicitly
 * (cook_fish relies on cookXp proxy only); objective id stays bake_bread.
 */
describe("CityLands CL59.3 Cook tutor claim after land cook", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl593_${Date.now().toString(36)}`,
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

  it("cooks meat on land kitchen then claims Cook at City (happy)", () => {
    expect(TUTORIAL_NPCS.cook.quest.objective).toBe("bake_bread");
    expect(getRecipe("cook_meat")!.profession).toBe("cook");
    expect(getRecipe("cook_meat")!.station).toBe("kitchen");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    clearCookObjectiveMats(userId);
    db.update(players)
      .set({ cookXp: 0 })
      .where(eq(players.id, getPlayerState(userId)!.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "cook")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, cookXp: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "iron_ore", 1);
    expect(placeLandStation(userId, "kitchen", boardPos(home)).ok).toBe(true);

    clearCookObjectiveMats(userId);
    const land = getPlayerState(userId)!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    expect(kitchen).toBeTruthy();
    // Reason: kitchen place leftover ore is unrelated; feed cook_meat with fresh meat.
    const leftoverOre = land.inventory
      .filter((s) => s.itemId === "iron_ore")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverOre > 0) removeItem(land.playerId, "iron_ore", leftoverOre);
    db.update(players)
      .set({ energy: 100, cookXp: 0 })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "raw_meat", 1);
    expect(getTutorialNpcForPlayer(userId, "cook")!.quest.status).toBe(
      "active",
    );

    const cookBefore = getPlayerState(userId)!.cookXp;
    expect(craftRecipeComplete(userId, "cook_meat", buildingPos(kitchen)).ok).toBe(
      true,
    );
    const afterCook = getPlayerState(userId)!;
    expect(afterCook.cookXp).toBeGreaterThan(cookBefore);
    expect(afterCook.inventory.some((s) => s.itemId === "cooked_meat")).toBe(
      true,
    );
    expect(getTutorialNpcForPlayer(userId, "cook")!.quest.status).toBe(
      "ready",
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "cook");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "cook")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps blacksmith inactive after cook-only (edge)", () => {
    expect(getTutorialNpcForPlayer(userId, "blacksmith")!.quest.status).toBe(
      "active",
    );
  });

  it("refuses claim before land cook (failure)", () => {
    const fresh = registerUser(
      `cl593f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    clearCookObjectiveMats(other);
    db.update(players)
      .set({ cookXp: 0 })
      .where(eq(players.id, getPlayerState(other)!.playerId))
      .run();
    expect(getTutorialNpcForPlayer(other, "cook")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "cook");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "cook");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
