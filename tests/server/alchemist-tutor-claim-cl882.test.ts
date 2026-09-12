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
  `game-cl882-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
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

/** Clears hold_herbal_tonic proxies so Alchemist stays active until a live land brew. */
function clearAlchemistObjectiveMats(uid: string) {
  const state = getPlayerState(uid)!;
  const tonicQty = state.inventory
    .filter((s) => s.itemId === "herbal_tonic")
    .reduce((n, s) => n + s.qty, 0);
  if (tonicQty > 0) removeItem(state.playerId, "herbal_tonic", tonicQty);
}

/**
 * CL88.2 — Alchemist tutor claim after land brew still green.
 * Choice: assert-only claim fidelity (parity with CL64.3; no Content Lock retune).
 */
describe("CityLands CL88.2 Alchemist tutor claim after land brew still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl882_${Date.now().toString(36)}`,
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

  it("brews tonic on land bench then claims Alchemist at City (happy)", () => {
    expect(TUTORIAL_NPCS.alchemist.quest.objective).toBe("hold_herbal_tonic");
    const recipe = getRecipe("brew_herbal_tonic")!;
    expect(recipe.profession).toBe("alchemist");
    expect(recipe.station).toBe("alchemy_bench");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    clearAlchemistObjectiveMats(userId);
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
        alchemistXp: 0,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "iron_ore", 1);
    addItem(home.playerId, "wheat", 2);
    addItem(home.playerId, "leather", 1);
    expect(
      placeLandStation(userId, "alchemy_bench", boardPos(home)).ok,
    ).toBe(true);

    clearAlchemistObjectiveMats(userId);
    const land = getPlayerState(userId)!;
    const bench = land.buildings.find((b) => b.type === "alchemy_bench")!;
    expect(bench).toBeTruthy();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "active",
    );

    const alchemistBefore = getPlayerState(userId)!.alchemistXp;
    const cookBefore = getPlayerState(userId)!.cookXp;
    expect(
      craftRecipeComplete(userId, "brew_herbal_tonic", buildingPos(bench)).ok,
    ).toBe(true);
    const afterBrew = getPlayerState(userId)!;
    expect(afterBrew.alchemistXp).toBeGreaterThan(alchemistBefore);
    expect(afterBrew.cookXp).toBe(cookBefore);
    expect(afterBrew.inventory.some((s) => s.itemId === "herbal_tonic")).toBe(
      true,
    );
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "ready",
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "alchemist");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps cook inactive after brew-only (edge)", () => {
    // Reason: brew ≠ kitchen cook; clear any stew/bread/cooked_meat proxies.
    const state = getPlayerState(userId)!;
    for (const id of ["bread", "cooked_meat", "stew"] as const) {
      const qty = state.inventory
        .filter((s) => s.itemId === id)
        .reduce((n, s) => n + s.qty, 0);
      if (qty > 0) removeItem(state.playerId, id, qty);
    }
    db.update(players)
      .set({ cookXp: 0 })
      .where(eq(players.id, state.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "cook")!.quest.status).toBe(
      "active",
    );
  });

  it("refuses claim before land brew (failure)", () => {
    const fresh = registerUser(
      `cl882f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    clearAlchemistObjectiveMats(other);
    expect(getTutorialNpcForPlayer(other, "alchemist")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "alchemist");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "alchemist");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
