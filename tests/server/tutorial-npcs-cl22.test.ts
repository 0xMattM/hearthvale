import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CITY_BUILDINGS,
  SEEDED_CITY_NPCS,
  SEEDED_CITY_TUTORIAL_NPCS,
  WORLD,
} from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl22-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { db } = await import("../../apps/server/src/db/client.ts");
const { buildings } = await import("../../apps/server/src/db/schema.ts");
const { eq } = await import("drizzle-orm");
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
  listTutorialNpcs,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL2.2 tutorial NPC framework", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl22_${Date.now().toString(36)}`, "password123");
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

  it("seeds ≥3 profession tutors on the city hub (happy)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const tutors = state.buildings.filter((b) => b.type === "tutorial_npc");
    expect(tutors.length).toBeGreaterThanOrEqual(3);
    expect(SEEDED_CITY_TUTORIAL_NPCS).toContain("farmer");
    expect(SEEDED_CITY_TUTORIAL_NPCS).toContain("forester");
    expect(SEEDED_CITY_TUTORIAL_NPCS).toContain("carpenter");
    for (const id of SEEDED_CITY_NPCS) {
      expect(tutors.some((t) => t.tutorialNpcId === id)).toBe(true);
    }
    expect(
      CITY_BUILDINGS.filter((b) => b.type === "tutorial_npc").length,
    ).toBe(SEEDED_CITY_NPCS.length);

    const listed = listTutorialNpcs(userId);
    expect(listed).toHaveLength(SEEDED_CITY_NPCS.length);
    expect(listed.find((n) => n.id === "mayor")!.quest.status).toBe("ready");
    expect(listed.find((n) => n.id === "farmer")!.quest.status).toBe("locked");
    expect(listed.find((n) => n.id === "forester")!.quest.status).toBe("active");
    expect(listed.find((n) => n.id === "carpenter")!.quest.status).toBe("active");

    expect(claimTutorialQuest(userId, "mayor").ok).toBe(true);
    const farmer = getTutorialNpcForPlayer(userId, "farmer")!;
    expect(farmer.basics.length).toBeGreaterThan(0);
    expect(farmer.toolsNeeded.length).toBeGreaterThan(0);
    expect(farmer.buildingsNeeded.length).toBeGreaterThan(0);

    const plot = state.buildings.find((b) => b.type === "crop_plot")!;
    addItem(getPlayerState(userId)!.playerId, "wheat_seed", 1);
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

    const coinsBefore = getPlayerState(userId)!.softCurrency;
    const claim = claimTutorialQuest(userId, "farmer");
    expect(claim.ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coinsBefore + 6);
    expect(getTutorialNpcForPlayer(userId, "farmer")!.quest.status).toBe(
      "claimed",
    );
  });

  it("rejects claim when objective not met (edge)", () => {
    const result = claimTutorialQuest(userId, "carpenter");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.questNotReady);
  });

  it("rejects unknown profession and double-claim (failure)", () => {
    expect(claimTutorialQuest(userId, "not_a_profession").ok).toBe(false);
    const again = claimTutorialQuest(userId, "farmer");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);

    // CL27.3 — Animal Breeder seeded; claim blocked until land pen feed
    const breeder = getTutorialNpcForPlayer(userId, "animal_breeder");
    expect(breeder?.seededOnCity).toBe(true);
    expect(breeder?.quest.status).toBe("active");
    expect(claimTutorialQuest(userId, "animal_breeder").ok).toBe(false);
  });
});

