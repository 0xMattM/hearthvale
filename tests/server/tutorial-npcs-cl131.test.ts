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
  `game-cl131-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL13.1 Weaver tutor", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl131_${Date.now().toString(36)}`, "password123");
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

  it("seeds Weaver on City with walk-up claim (happy)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const tutors = state.buildings.filter((b) => b.type === "tutorial_npc");

    expect(SEEDED_CITY_TUTORIAL_NPCS).toContain("weaver");
    expect(TUTORIAL_NPCS.weaver.seededOnCity).toBe(true);
    expect(TUTORIAL_NPCS.weaver.quest.objective).toBe("weave_cloth");
    expect(tutors.some((t) => t.tutorialNpcId === "weaver")).toBe(true);
    expect(
      CITY_BUILDINGS.filter((b) => b.type === "tutorial_npc"),
    ).toHaveLength(SEEDED_CITY_NPCS.length);
    expect(listTutorialNpcs(userId).map((n) => n.id)).toContain("weaver");

    const pid = state.playerId;
    addItem(pid, "cloth", 1);
    expect(getTutorialNpcForPlayer(userId, "weaver")!.quest.status).toBe(
      "ready",
    );
    const claim = claimTutorialQuest(userId, "weaver");
    expect(claim.ok).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "weaver")!.quest.status).toBe(
      "claimed",
    );
  });

  it("keeps warrior off the economy ladder (edge)", () => {
    expect((ECONOMY_PROFESSIONS as readonly string[]).includes("warrior")).toBe(
      false,
    );
    expect(SEEDED_CITY_TUTORIAL_NPCS).not.toContain("warrior");
    expect(
      CITY_BUILDINGS.some((b) => b.tutorialNpcId === "warrior"),
    ).toBe(false);
  });

  it("rejects claim before cloth and double-claim (failure)", () => {
    const fresh = registerUser(
      `cl131b_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;
    expect(travelToLandKind(other, "city").ok).toBe(true);

    expect(getTutorialNpcForPlayer(other, "weaver")!.quest.status).toBe(
      "active",
    );
    const early = claimTutorialQuest(other, "weaver");
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.questNotReady);

    const again = claimTutorialQuest(userId, "weaver");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.questAlreadyClaimed);
  });
});
