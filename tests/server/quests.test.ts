import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, MAYOR_NPC } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-quests-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { claimQuest, listQuests } = await import(
  "../../apps/server/src/game/quests.ts"
);
const { getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);

describe("onboarding quest log (Q board)", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `quest_${Date.now().toString(36)}`,
      "password123",
    );
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

  it("lists the Governor intro as the first visible quest (happy)", () => {
    const before = listQuests(userId);
    expect(before[0]?.id).toBe(MAYOR_NPC.quest.id);
    expect(before[0]?.status).toBe("ready");
    expect(before[0]?.claimAtNpc).toBe("Governor");
    expect(before).toHaveLength(1);
    expect(getPlayerState(userId)!.softCurrency).toBeGreaterThanOrEqual(0);
  });

  it("refuses claim from the quest board (edge)", () => {
    const result = claimQuest(userId, MAYOR_NPC.quest.id);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.questClaimAtNpc);
  });

  it("refuses unknown and board claims (failure)", () => {
    expect(claimQuest(userId, "nope").ok).toBe(false);
    expect(claimQuest(userId, "first_plant").ok).toBe(false);
    const again = claimQuest(userId, MAYOR_NPC.quest.id);
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.questClaimAtNpc);
  });
});
