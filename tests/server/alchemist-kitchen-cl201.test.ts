import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CITY_PRACTICE_STATIONS,
  TUTORIAL_NPCS,
  cityNoticeBoardTips,
  cityPracticeStationsFor,
  getRecipe,
} from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl201-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");

/**
 * Historical CL20.1–CL20.2 Kitchen stand-in — superseded by CL28.3 bench practice.
 * Kept as a regression that cook stew stays cook and Alchemist no longer claims via stew.
 */
describe("CityLands CL20.1 Kitchen stand-in (superseded by CL28.3)", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl201_${Date.now().toString(36)}`, "password123");
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

  it("keeps cook stew on kitchen; Alchemist practice is bench (happy)", () => {
    expect(CITY_PRACTICE_STATIONS.cook).toEqual(["kitchen"]);
    expect(CITY_PRACTICE_STATIONS.alchemist).toEqual(["alchemy_bench"]);
    expect(cityPracticeStationsFor("alchemist")).toEqual(["alchemy_bench"]);
    expect(TUTORIAL_NPCS.alchemist.quest.objective).toBe("hold_herbal_tonic");

    const stew = getRecipe("cook_stew")!;
    expect(stew.profession).toBe("cook");
    expect(stew.station).toBe("kitchen");
    expect(stew.output.itemId).toBe("stew");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    addItem(city.playerId, "herbal_tonic", 1);
    expect(claimTutorialQuest(userId, "alchemist").ok).toBe(true);
  });

  it("tip mentions alchemy bench; stew alone does not ready Alchemist (edge)", () => {
    const tip = cityNoticeBoardTips().find(
      (t) => t.id === "fisher_alchemist_practice",
    );
    expect(tip).toBeDefined();
    expect(tip!.body.toLowerCase()).toMatch(/alchemy bench/);
    expect(tip!.body.toLowerCase()).toMatch(/no alchemy combat/);

    const fresh = registerUser(
      `cl201e_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;
    expect(travelToLandKind(other, "city").ok).toBe(true);
    addItem(getPlayerState(other)!.playerId, "stew", 1);
    expect(getTutorialNpcForPlayer(other, "alchemist")!.quest.status).toBe(
      "active",
    );
  });

  it("rejects double-claim (failure)", () => {
    const again = claimTutorialQuest(userId, "alchemist");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
  });
});
