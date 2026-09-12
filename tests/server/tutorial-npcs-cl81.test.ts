import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CITY_BUILDINGS,
  ECONOMY_PROFESSIONS,
  SEEDED_CITY_NPCS,
  SEEDED_CITY_TUTORIAL_NPCS,
  TUTORIAL_NPCS,
} from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl81-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/** CL8.1 batch — next three economy tutors beyond CL2.2. */
const CL81_BATCH = ["miner", "blacksmith", "cook"] as const;

describe("CityLands CL8.1 next tutorial NPC batch", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl81_${Date.now().toString(36)}`, "password123");
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

  it("seeds ≥3 new tutors with walk-up claims (happy)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const tutors = state.buildings.filter((b) => b.type === "tutorial_npc");

    expect(SEEDED_CITY_TUTORIAL_NPCS.length).toBeGreaterThanOrEqual(6);
    for (const id of CL81_BATCH) {
      expect(SEEDED_CITY_TUTORIAL_NPCS).toContain(id);
      expect(TUTORIAL_NPCS[id].seededOnCity).toBe(true);
      expect(TUTORIAL_NPCS[id].quest.objective).not.toBe("stub");
      expect(tutors.some((t) => t.tutorialNpcId === id)).toBe(true);
    }

    expect(
      CITY_BUILDINGS.filter((b) => b.type === "tutorial_npc"),
    ).toHaveLength(SEEDED_CITY_NPCS.length);
    expect(listTutorialNpcs(userId).map((n) => n.id)).toEqual([
      ...SEEDED_CITY_NPCS,
    ]);

    const pid = getPlayerState(userId)!.playerId;
    addItem(pid, "iron_ore", 1);
    expect(getTutorialNpcForPlayer(userId, "miner")!.quest.status).toBe(
      "ready",
    );
    const minerClaim = claimTutorialQuest(userId, "miner");
    expect(minerClaim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "miner")!.quest.status).toBe(
      "claimed",
    );

    addItem(pid, "iron_bar", 1);
    expect(getTutorialNpcForPlayer(userId, "blacksmith")!.quest.status).toBe(
      "ready",
    );
    expect(claimTutorialQuest(userId, "blacksmith").ok).toBe(true);

    addItem(pid, "bread", 1);
    expect(getTutorialNpcForPlayer(userId, "cook")!.quest.status).toBe(
      "ready",
    );
    expect(claimTutorialQuest(userId, "cook").ok).toBe(true);
  });

  it("keeps warrior off the economy ladder (edge)", () => {
    expect((ECONOMY_PROFESSIONS as readonly string[]).includes("warrior")).toBe(
      false,
    );
    expect(SEEDED_CITY_TUTORIAL_NPCS).not.toContain("warrior");
    expect(
      CITY_BUILDINGS.some((b) => b.tutorialNpcId === "warrior"),
    ).toBe(false);
    expect(getTutorialNpcForPlayer(userId, "warrior")).toBeNull();
  });

  it("rejects claim before objective and double-claim (failure)", () => {
    // CL27.3 — Animal Breeder seeded; claim blocked until land pen feed
    const breeder = getTutorialNpcForPlayer(userId, "animal_breeder");
    expect(breeder?.seededOnCity).toBe(true);
    expect(breeder?.quest.status).toBe("active");
    expect(claimTutorialQuest(userId, "animal_breeder").ok).toBe(false);

    // Already claimed in happy path
    const again = claimTutorialQuest(userId, "miner");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);

    // Unrelated: carpenter objective not met for this user
    const carpenter = claimTutorialQuest(userId, "carpenter");
    expect(carpenter.ok).toBe(false);
    if (!carpenter.ok) expect(carpenter.error).toBe(ACTION_ERROR.questNotReady);
  });
});

