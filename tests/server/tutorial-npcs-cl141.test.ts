import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CITY_BUILDINGS,
  CITY_PRACTICE_STATIONS,
  ECONOMY_PROFESSIONS,
  SEEDED_CITY_NPCS,
  SEEDED_CITY_TUTORIAL_NPCS,
  TUTORIAL_NPCS,
  cityNoticeBoardTips,
  cityPracticeStationsFor,
} from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl141-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
  listTutorialNpcs,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");

/** CL14.1 batch — Fisher + Alchemist tutors. */
const CL141_BATCH = ["fisher", "alchemist"] as const;

describe("CityLands CL14.1 Fisher + Alchemist tutors", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl141_${Date.now().toString(36)}`, "password123");
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

  it("seeds Fisher + Alchemist on City with walk-up claims (happy)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const tutors = state.buildings.filter((b) => b.type === "tutorial_npc");

    for (const id of CL141_BATCH) {
      expect(SEEDED_CITY_TUTORIAL_NPCS).toContain(id);
      expect(TUTORIAL_NPCS[id].seededOnCity).toBe(true);
      expect(TUTORIAL_NPCS[id].quest.objective).not.toBe("stub");
      expect(tutors.some((t) => t.tutorialNpcId === id)).toBe(true);
    }

    expect(TUTORIAL_NPCS.fisher.quest.objective).toBe("hold_fish");
    expect(TUTORIAL_NPCS.alchemist.quest.objective).toBe("hold_herbal_tonic");
    expect(
      CITY_BUILDINGS.filter((b) => b.type === "tutorial_npc"),
    ).toHaveLength(SEEDED_CITY_NPCS.length);
    expect(listTutorialNpcs(userId).map((n) => n.id)).toEqual([
      ...SEEDED_CITY_NPCS,
    ]);

    const pid = state.playerId;
    addItem(pid, "fish", 1);
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "ready",
    );
    const fisherClaim = claimTutorialQuest(userId, "fisher");
    expect(fisherClaim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "claimed",
    );

    addItem(pid, "herbal_tonic", 1);
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "ready",
    );
    expect(claimTutorialQuest(userId, "alchemist").ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "alchemist")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps warrior off the ladder; fisher dock + alchemist bench practice (edge)", () => {
    expect((ECONOMY_PROFESSIONS as readonly string[]).includes("warrior")).toBe(
      false,
    );
    expect(SEEDED_CITY_TUTORIAL_NPCS).not.toContain("warrior");
    expect(
      CITY_BUILDINGS.some((b) => b.tutorialNpcId === "warrior"),
    ).toBe(false);

    // CL19.2 — fisher dock; CL28.3 — alchemist bench practice.
    expect(CITY_PRACTICE_STATIONS.fisher).toEqual(["fishing_dock"]);
    expect(CITY_PRACTICE_STATIONS.alchemist).toEqual(["alchemy_bench"]);
    expect(cityPracticeStationsFor("fisher")).toEqual(["fishing_dock"]);
    expect(cityPracticeStationsFor("alchemist")).toEqual(["alchemy_bench"]);

    const tip = cityNoticeBoardTips().find(
      (t) => t.id === "fisher_alchemist_practice",
    );
    expect(tip).toBeDefined();
    expect(tip!.body.toLowerCase()).toMatch(
      /fishing dock|fish|alchemy bench|herbal tonic/,
    );
    expect(tip!.body.toLowerCase()).not.toMatch(/deferred forever/);
  });

  it("rejects claim before objective and double-claim (failure)", () => {
    const fresh = registerUser(
      `cl141b_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;
    expect(travelToLandKind(other, "city").ok).toBe(true);

    expect(getTutorialNpcForPlayer(other, "fisher")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "fisher");
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.questNotReady);

    const again = claimTutorialQuest(userId, "fisher");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);

    // CL27.3 — Animal Breeder seeded; claim blocked until land pen feed
    const breeder = getTutorialNpcForPlayer(other, "animal_breeder");
    expect(breeder?.seededOnCity).toBe(true);
    expect(breeder?.quest.status).toBe("active");
    expect(claimTutorialQuest(other, "animal_breeder").ok).toBe(false);
  });
});
