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
  `game-cl582-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/**
 * CL58.2 — Land saw_planks → City Carpenter tutor claim.
 * Choice: assert-only claim e2e (objective still craft_plank) over new tutor ids.
 */
describe("CityLands CL58.2 Carpenter tutor claim after land saw", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl582_${Date.now().toString(36)}`,
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

  it("saws planks on land workshop then claims Carpenter at City (happy)", () => {
    expect(TUTORIAL_NPCS.carpenter.quest.objective).toBe("craft_plank");
    expect(getRecipe("saw_planks")!.profession).toBe("carpenter");
    expect(getRecipe("saw_planks")!.station).toBe("workshop");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "carpenter")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "plank", 2);

    const atBoard = boardPos(home);
    expect(placeLandStation(userId, "workshop", atBoard).ok).toBe(true);
    const land = getPlayerState(userId)!;
    const workshop = land.buildings.find((b) => b.type === "workshop")!;
    expect(workshop).toBeTruthy();

    // Reason: clear place leftovers; feed saw with fresh wood only.
    for (const id of ["wood", "plank"] as const) {
      const qty = getPlayerState(userId)!
        .inventory.filter((s) => s.itemId === id)
        .reduce((n, s) => n + s.qty, 0);
      if (qty > 0) removeItem(land.playerId, id, qty);
    }
    db.update(players)
      .set({ carpenterXp: 0, energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    addItem(land.playerId, "wood", 2);
    expect(getTutorialNpcForPlayer(userId, "carpenter")!.quest.status).toBe(
      "active",
    );

    const carpenterBefore = getPlayerState(userId)!.carpenterXp;
    expect(craftRecipeComplete(userId, "saw_planks", buildingPos(workshop)).ok).toBe(
      true,
    );
    const afterSaw = getPlayerState(userId)!;
    expect(afterSaw.carpenterXp).toBeGreaterThan(carpenterBefore);
    expect(afterSaw.inventory.some((s) => s.itemId === "plank")).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "carpenter")!.quest.status).toBe(
      "ready",
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "carpenter");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "carpenter")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps saw_planks as carpenter craft_plank path (edge)", () => {
    expect(TUTORIAL_NPCS.carpenter.basics).toMatch(/assemble_wood_crate/i);
    expect(getRecipe("saw_planks")!.output.itemId).toBe("plank");
  });

  it("refuses claim before land saw (failure)", () => {
    const fresh = registerUser(
      `cl582f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(other, "carpenter")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "carpenter");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "carpenter");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
