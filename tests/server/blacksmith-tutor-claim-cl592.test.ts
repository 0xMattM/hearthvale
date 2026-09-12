import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  TUTORIAL_NPCS,
  WORLD,
  getRecipe,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl592-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/** Clears smelt_iron_bar proxies so Blacksmith stays active until a live smelt. */
function clearBlacksmithObjectiveMats(uid: string) {
  const state = getPlayerState(uid)!;
  for (const id of ["iron_bar", "iron_hoe", "iron_hammer"] as const) {
    const qty = state.inventory
      .filter((s) => s.itemId === id)
      .reduce((n, s) => n + s.qty, 0);
    if (qty > 0) removeItem(state.playerId, id, qty);
  }
  if (state.equippedToolInventoryId) {
    db.update(players)
      .set({ equippedToolInventoryId: null })
      .where(eq(players.id, state.playerId))
      .run();
  }
}

/**
 * CL59.2 — Land smelt_iron_bar → City Blacksmith tutor claim.
 * Choice: assert-only claim e2e (objective still smelt_iron_bar) over new tutor ids.
 */
describe("CityLands CL59.2 Blacksmith tutor claim after land smelt", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl592_${Date.now().toString(36)}`,
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

  it("smelts iron_bar on land forge then claims Blacksmith at City (happy)", () => {
    expect(TUTORIAL_NPCS.blacksmith.quest.objective).toBe("smelt_iron_bar");
    expect(getRecipe("smelt_iron_bar")!.profession).toBe("blacksmith");
    expect(getRecipe("smelt_iron_bar")!.station).toBe("forge");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    clearBlacksmithObjectiveMats(userId);
    expect(getTutorialNpcForPlayer(userId, "blacksmith")!.quest.status).toBe(
      "active",
    );

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
    // Reason: forge place consumes 2 bars — leave none so claim waits on live smelt.
    addItem(home.playerId, "iron_bar", 2);
    addItem(home.playerId, "wood", 2);
    expect(placeLandStation(userId, "forge", boardPos(home)).ok).toBe(true);

    clearBlacksmithObjectiveMats(userId);
    const land = getPlayerState(userId)!;
    const forge = land.buildings.find((b) => b.type === "forge")!;
    expect(forge).toBeTruthy();
    db.update(players)
      .set({ energy: 100, blacksmithXp: 0 })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "iron_ore", 2);
    expect(getTutorialNpcForPlayer(userId, "blacksmith")!.quest.status).toBe(
      "active",
    );

    const smithBefore = getPlayerState(userId)!.blacksmithXp;
    expect(craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge)).ok).toBe(
      true,
    );
    const afterSmelt = getPlayerState(userId)!;
    expect(afterSmelt.blacksmithXp).toBeGreaterThan(smithBefore);
    expect(afterSmelt.inventory.some((s) => s.itemId === "iron_bar")).toBe(
      true,
    );
    expect(getTutorialNpcForPlayer(userId, "blacksmith")!.quest.status).toBe(
      "ready",
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "blacksmith");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "blacksmith")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps carpenter inactive after smelt-only (edge)", () => {
    // Reason: starter bread readies Cook; carpenter needs plank / carpenterXp.
    expect(getTutorialNpcForPlayer(userId, "carpenter")!.quest.status).toBe(
      "active",
    );
  });

  it("refuses claim before land smelt (failure)", () => {
    const fresh = registerUser(
      `cl592f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    clearBlacksmithObjectiveMats(other);
    expect(getTutorialNpcForPlayer(other, "blacksmith")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "blacksmith");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "blacksmith");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
