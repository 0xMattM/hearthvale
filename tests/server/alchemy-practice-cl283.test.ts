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
  `game-cl283-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL28.3 Alchemist practice → alchemy bench", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl283_${Date.now().toString(36)}`,
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

  it("wires practice to alchemy_bench and claims herbal tonic (happy)", () => {
    expect(CITY_PRACTICE_STATIONS.alchemist).toEqual(["alchemy_bench"]);
    expect(cityPracticeStationsFor("alchemist")).toEqual(["alchemy_bench"]);
    expect(CITY_PRACTICE_STATIONS.cook).toEqual(["kitchen"]);
    expect(TUTORIAL_NPCS.alchemist.quest.objective).toBe("hold_herbal_tonic");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.buildings.some((b) => b.type === "alchemy_bench")).toBe(true);

    addItem(city.playerId, "herbal_tonic", 1);
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "ready",
    );
    expect(claimTutorialQuest(userId, "alchemist").ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps cook stew on kitchen; tip/tutor mention bench (edge)", () => {
    const tip = cityNoticeBoardTips().find(
      (t) => t.id === "fisher_alchemist_practice",
    );
    expect(tip).toBeDefined();
    expect(tip!.body.toLowerCase()).toMatch(/alchemy bench/);
    expect(tip!.body.toLowerCase()).toMatch(/herbal tonic/);
    expect(tip!.body.toLowerCase()).toMatch(/no alchemy combat/);
    expect(tip!.body.toLowerCase()).toMatch(/cook craft|kitchen/);

    const npc = TUTORIAL_NPCS.alchemist;
    expect(npc.basics.toLowerCase()).toMatch(/alchemy bench/);
    expect(npc.buildingsNeeded.toLowerCase()).toMatch(/alchemy bench/);
    expect(npc.quest.blurb.toLowerCase()).toMatch(/herbal tonic/);

    const stew = getRecipe("cook_stew")!;
    expect(stew.profession).toBe("cook");
    expect(stew.station).toBe("kitchen");
    expect(stew.output.itemId).toBe("stew");
    const brew = getRecipe("brew_herbal_tonic")!;
    expect(brew.station).toBe("alchemy_bench");
    expect(brew.profession).toBe("alchemist");
  });

  it("rejects claim before tonic and double-claim (failure)", () => {
    const fresh = registerUser(
      `cl283b_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;
    expect(travelToLandKind(other, "city").ok).toBe(true);

    expect(getTutorialNpcForPlayer(other, "alchemist")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "alchemist");
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.questNotReady);

    // Stew alone no longer completes Alchemist (CL28.3).
    addItem(getPlayerState(other)!.playerId, "stew", 1);
    expect(getTutorialNpcForPlayer(other, "alchemist")!.quest.status).toBe(
      "active",
    );

    const again = claimTutorialQuest(userId, "alchemist");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
  });
});
