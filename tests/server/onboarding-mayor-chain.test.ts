import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, MAYOR_NPC, TUTORIAL_NPCS, WORLD } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-onboard-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { plantCrop, harvestCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { claimQuest, listQuests } = await import(
  "../../apps/server/src/game/quests.ts"
);
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
const { buildings } = await import("../../apps/server/src/db/schema.ts");
const { db } = await import("../../apps/server/src/db/client.ts");
const { eq } = await import("drizzle-orm");
const { claimMayorIntro } = await import("./helpers/claim-mayor.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("onboarding mayor → farmer chain", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`mayor_${Date.now().toString(36)}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    expect(travelToLandKind(userId, "city").ok).toBe(true);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("lists Governor first and claims at the NPC, not the board (happy)", () => {
    const log = listQuests(userId);
    expect(log[0]?.id).toBe(MAYOR_NPC.quest.id);
    expect(log[0]?.claimAtNpc).toBe("Governor");
    expect(log[0]?.status).toBe("ready");
    expect(log.some((q) => q.id === TUTORIAL_NPCS.farmer.quest.id)).toBe(false);

    expect(claimQuest(userId, MAYOR_NPC.quest.id).ok).toBe(false);
    expect(claimQuest(userId, MAYOR_NPC.quest.id).error).toBe(
      ACTION_ERROR.questClaimAtNpc,
    );

    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(claimTutorialQuest(userId, "mayor").ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coinsBefore + 4);
    expect(getTutorialNpcForPlayer(userId, "mayor")!.quest.status).toBe(
      "claimed",
    );

    const after = listQuests(userId);
    expect(after.some((q) => q.id === TUTORIAL_NPCS.farmer.quest.id)).toBe(true);
    expect(
      after.find((q) => q.id === TUTORIAL_NPCS.farmer.quest.id)?.status,
    ).toBe("active");
  });

  it("locks Farmer until the Governor intro is claimed (edge)", () => {
    const fresh = registerUser(
      `mayor2_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;
    expect(travelToLandKind(other, "city").ok).toBe(true);
    expect(getTutorialNpcForPlayer(other, "farmer")!.quest.status).toBe(
      "locked",
    );
    const early = claimTutorialQuest(other, "farmer");
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.questLocked);
  });

  it("Farmer quest needs plant + harvest (failure)", () => {
    claimMayorIntro(claimTutorialQuest, userId);
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "active",
    );
    const state = getPlayerState(userId)!;
    const plot = state.buildings.find((b) => b.type === "crop_plot")!;
    addItem(state.playerId, "wheat_seed", 1);
    expect(plantCrop(userId, plot.id, "wheat_seed", buildingPos(plot)).ok).toBe(
      true,
    );
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "active",
    );
    db.update(buildings)
      .set({ readyAt: Date.now() - 1000 })
      .where(eq(buildings.id, plot.id))
      .run();
    expect(harvestCrop(userId, plot.id, buildingPos(plot)).ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "ready",
    );
    expect(claimTutorialQuest(userId, "farmer").ok).toBe(true);
  });
});
