import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BROKER_NPC, CLERK_NPC } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-civic-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");

/**
 * Civic talk tutors are claimable by walking up — wallet never required.
 */
describe("civic service tutor claims", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`civic_${Date.now().toString(36)}`, "password123");
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

  it("lets a newcomer claim Broker and Clerk talk lessons (happy)", () => {
    expect(getTutorialNpcForPlayer(userId, "broker")!.quest.status).toBe("ready");
    expect(getTutorialNpcForPlayer(userId, "clerk")!.quest.status).toBe("ready");
    const broker = claimTutorialQuest(userId, "broker");
    expect(broker.ok).toBe(true);
    expect(broker.rewardCoins).toBe(BROKER_NPC.quest.rewardCoins);
    expect(getTutorialNpcForPlayer(userId, "broker")!.quest.status).toBe(
      "claimed",
    );
    const clerk = claimTutorialQuest(userId, "clerk");
    expect(clerk.ok).toBe(true);
    expect(clerk.rewardCoins).toBe(CLERK_NPC.quest.rewardCoins);
    expect(getTutorialNpcForPlayer(userId, "clerk")!.quest.status).toBe(
      "claimed",
    );
  });

  it("refuses a second claim (edge)", () => {
    const again = claimTutorialQuest(userId, "broker");
    expect(again.ok).toBe(false);
    expect(getTutorialNpcForPlayer(userId, "broker")!.quest.status).toBe(
      "claimed",
    );
  });

  it("does not invent a warrior or unknown civic tutor (failure)", () => {
    expect(getTutorialNpcForPlayer(userId, "warrior")).toBeNull();
    expect(claimTutorialQuest(userId, "wallet_npc").ok).toBe(false);
    expect(getTutorialNpcForPlayer(userId, "")).toBeNull();
  });
});
