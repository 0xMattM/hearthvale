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
  `game-cl802-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/** Clears weave_cloth proxies so Weaver stays active until a live weave. */
function clearWeaverObjectiveMats(uid: string) {
  const state = getPlayerState(uid)!;
  const clothQty = state.inventory
    .filter((s) => s.itemId === "cloth")
    .reduce((n, s) => n + s.qty, 0);
  if (clothQty > 0) removeItem(state.playerId, "cloth", clothQty);
  db.update(players)
    .set({ weaverXp: 0 })
    .where(eq(players.id, state.playerId))
    .run();
}

/**
 * CL80.2 — Weaver tutor claim after land weave still green.
 * Choice: assert-only claim fidelity (parity with CL62.2; no Content Lock retune).
 */
describe("CityLands CL80.2 Weaver tutor claim after land weave still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl802_${Date.now().toString(36)}`,
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

  it("weaves cloth on land loom then claims Weaver at City (happy)", () => {
    expect(TUTORIAL_NPCS.weaver.quest.objective).toBe("weave_cloth");
    const recipe = getRecipe("weave_cloth")!;
    expect(recipe.profession).toBe("weaver");
    expect(recipe.station).toBe("loom");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    clearWeaverObjectiveMats(userId);
    expect(getTutorialNpcForPlayer(userId, "weaver")!.quest.status).toBe(
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
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "plank", 4);
    expect(placeLandStation(userId, "loom", boardPos(home)).ok).toBe(true);

    clearWeaverObjectiveMats(userId);
    const land = getPlayerState(userId)!;
    const loom = land.buildings.find((b) => b.type === "loom")!;
    expect(loom).toBeTruthy();
    addItem(land.playerId, "leather", 2);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "weaver")!.quest.status).toBe(
      "active",
    );

    const weaverBefore = getPlayerState(userId)!.weaverXp;
    expect(craftRecipeComplete(userId, "weave_cloth", buildingPos(loom)).ok).toBe(
      true,
    );
    const afterWeave = getPlayerState(userId)!;
    expect(afterWeave.weaverXp).toBeGreaterThan(weaverBefore);
    expect(afterWeave.inventory.some((s) => s.itemId === "cloth")).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "weaver")!.quest.status).toBe(
      "ready",
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "weaver");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "weaver")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps carpenter inactive after weave-only (edge)", () => {
    const state = getPlayerState(userId)!;
    const plankQty = state.inventory
      .filter((s) => s.itemId === "plank")
      .reduce((n, s) => n + s.qty, 0);
    if (plankQty > 0) removeItem(state.playerId, "plank", plankQty);
    db.update(players)
      .set({ carpenterXp: 0 })
      .where(eq(players.id, state.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "carpenter")!.quest.status).toBe(
      "active",
    );
  });

  it("refuses claim before land weave (failure)", () => {
    const fresh = registerUser(
      `cl802f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    clearWeaverObjectiveMats(other);
    expect(getTutorialNpcForPlayer(other, "weaver")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "weaver");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "weaver");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
