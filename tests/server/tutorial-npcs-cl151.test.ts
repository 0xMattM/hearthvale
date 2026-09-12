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
} from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl151-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
  listTutorialNpcs,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");

/** CL15.1 batch — Animal Hunter + Monster Hunter tutors. */
const CL151_BATCH = ["animal_hunter", "monster_hunter"] as const;

describe("CityLands CL15.1 Animal + Monster Hunter tutors", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl151_${Date.now().toString(36)}`, "password123");
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

  it("seeds Animal + Monster Hunter on City with explore loot claims (happy)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const tutors = state.buildings.filter((b) => b.type === "tutorial_npc");

    for (const id of CL151_BATCH) {
      expect(SEEDED_CITY_TUTORIAL_NPCS).toContain(id);
      expect(TUTORIAL_NPCS[id].seededOnCity).toBe(true);
      expect(TUTORIAL_NPCS[id].quest.objective).not.toBe("stub");
      expect(tutors.some((t) => t.tutorialNpcId === id)).toBe(true);
    }

    expect(TUTORIAL_NPCS.animal_hunter.quest.objective).toBe("hold_leather");
    expect(TUTORIAL_NPCS.monster_hunter.quest.objective).toBe("hold_boar_tusk");
    expect(
      CITY_BUILDINGS.filter((b) => b.type === "tutorial_npc"),
    ).toHaveLength(SEEDED_CITY_NPCS.length);
    expect(listTutorialNpcs(userId).map((n) => n.id)).toEqual([
      ...SEEDED_CITY_NPCS,
    ]);

    const pid = state.playerId;
    addItem(pid, "leather", 1);
    expect(
      getTutorialNpcForPlayer(userId, "animal_hunter")!.quest.status,
    ).toBe("ready");
    expect(claimTutorialQuest(userId, "animal_hunter").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "animal_hunter")!.quest.status,
    ).toBe("claimed");

    addItem(pid, "boar_tusk", 1);
    expect(
      getTutorialNpcForPlayer(userId, "monster_hunter")!.quest.status,
    ).toBe("ready");
    expect(claimTutorialQuest(userId, "monster_hunter").ok).toBe(true);
    expect(
      getTutorialNpcForPlayer(userId, "monster_hunter")!.quest.status,
    ).toBe("claimed");
  });

  it("keeps warrior off ladder; hunt refuses homestead; practice null (edge)", () => {
    expect((ECONOMY_PROFESSIONS as readonly string[]).includes("warrior")).toBe(
      false,
    );
    expect(SEEDED_CITY_TUTORIAL_NPCS).not.toContain("warrior");
    expect(
      CITY_BUILDINGS.some((b) => b.tutorialNpcId === "warrior"),
    ).toBe(false);

    expect(CITY_PRACTICE_STATIONS.animal_hunter).toBeNull();
    expect(CITY_PRACTICE_STATIONS.monster_hunter).toBeNull();

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    const fakeTrail = home.buildings[0];
    const homesteadHunt = huntTrail(userId, fakeTrail?.id ?? "missing", {
      x: 0,
      z: 0,
    });
    expect(homesteadHunt.ok).toBe(false);
    if (!homesteadHunt.ok) {
      expect(homesteadHunt.error).toBe(ACTION_ERROR.huntExploreOnly);
    }
  });

  it("rejects claim before objective and double-claim (failure)", () => {
    const fresh = registerUser(
      `cl151b_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;
    expect(travelToLandKind(other, "city").ok).toBe(true);

    expect(
      getTutorialNpcForPlayer(other, "animal_hunter")!.quest.status,
    ).toBe("active");
    const early = claimTutorialQuest(other, "animal_hunter");
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.questNotReady);

    const again = claimTutorialQuest(userId, "animal_hunter");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);

    const breeder = getTutorialNpcForPlayer(other, "animal_breeder");
    expect(breeder?.seededOnCity).toBe(true);
    expect(breeder?.quest.status).toBe("active");
    expect(claimTutorialQuest(other, "animal_breeder").ok).toBe(false);
  });
});
