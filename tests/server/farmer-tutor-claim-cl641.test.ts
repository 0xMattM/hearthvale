import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, TUTORIAL_NPCS, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl641-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { plantCrop, harvestCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
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

/**
 * Clears plant_crop proxies so Farmer stays active until a live land plant/harvest.
 * Reason: objective also checks wheat/flour qty + farmerXp + planted plots on active land.
 */
function clearFarmerObjectiveMats(uid: string) {
  const state = getPlayerState(uid)!;
  for (const id of ["wheat", "flour"] as const) {
    const qty = state.inventory
      .filter((s) => s.itemId === id)
      .reduce((n, s) => n + s.qty, 0);
    if (qty > 0) removeItem(state.playerId, id, qty);
  }
  db.update(players)
    .set({ farmerXp: 0 })
    .where(eq(players.id, state.playerId))
    .run();
}

/**
 * CL64.1 — Farmer tutor claim after land plant/harvest still green.
 * Choice: land crop_plot plant→harvest → City claim (assert-only objective plant_crop).
 */
describe("CityLands CL64.1 Farmer tutor claim after land plant/harvest", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl641_${Date.now().toString(36)}`,
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

  it("plants and harvests on land then claims Farmer at City (happy)", () => {
    expect(TUTORIAL_NPCS.farmer.quest.objective).toBe("farm_starter_loop");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(claimTutorialQuest(userId, "mayor").ok).toBe(true);
    clearFarmerObjectiveMats(userId);
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "active",
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, farmerXp: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "wheat_seed", 1);
    expect(placeLandStation(userId, "crop_plot", boardPos(home)).ok).toBe(true);

    clearFarmerObjectiveMats(userId);
    const land = getPlayerState(userId)!;
    const plot = land.buildings.find((b) => b.type === "crop_plot")!;
    expect(plot).toBeTruthy();
    db.update(players)
      .set({ energy: 100, farmerXp: 0 })
      .where(eq(players.id, land.playerId))
      .run();
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "active",
    );

    const farmerBefore = getPlayerState(userId)!.farmerXp;
    expect(
      plantCrop(userId, plot.id, "wheat_seed", buildingPos(plot)).ok,
    ).toBe(true);
    const afterPlant = getPlayerState(userId)!;
    expect(afterPlant.farmerXp).toBeGreaterThan(farmerBefore);
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "active",
    );

    const planted = afterPlant.buildings.find((b) => b.id === plot.id)!;
    db.update(buildings)
      .set({ readyAt: Date.now() - 1000 })
      .where(eq(buildings.id, planted.id))
      .run();
    const farmerMid = getPlayerState(userId)!.farmerXp;
    expect(harvestCrop(userId, plot.id, buildingPos(plot)).ok).toBe(true);
    const afterHarvest = getPlayerState(userId)!;
    expect(afterHarvest.farmerXp).toBeGreaterThan(farmerMid);
    expect(afterHarvest.inventory.some((s) => s.itemId === "wheat")).toBe(
      true,
    );
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "ready",
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const claim = claimTutorialQuest(userId, "farmer");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps fisher inactive after plant/harvest-only (edge)", () => {
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "active",
    );
  });

  it("refuses claim before land plant/harvest (failure)", () => {
    const fresh = registerUser(
      `cl641f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    expect(claimTutorialQuest(other, "mayor").ok).toBe(true);
    clearFarmerObjectiveMats(other);
    expect(getTutorialNpcForPlayer(other, "farmer")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "farmer");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const again = claimTutorialQuest(userId, "farmer");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});
