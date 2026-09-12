import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-ach-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { bumpAchievement, listAchievements } = await import(
  "../../apps/server/src/game/achievements.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

describe("achievements F13.3", () => {
  let userId = "";
  let playerId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `ach_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    playerId = db.select().from(players).where(eq(players.userId, userId)).get()!
      .id;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("lists stubs and unlocks when counter hits target (happy)", () => {
    const before = listAchievements(userId);
    expect(before.length).toBeGreaterThanOrEqual(6);
    const plant = before.find((a) => a.id === "plant_crops")!;
    expect(plant.unlocked).toBe(false);
    expect(plant.counter).toBe(0);

    for (let i = 0; i < 5; i += 1) bumpAchievement(playerId, "plant_crops");
    const after = listAchievements(userId);
    const unlocked = after.find((a) => a.id === "plant_crops")!;
    expect(unlocked.counter).toBeGreaterThanOrEqual(5);
    expect(unlocked.unlocked).toBe(true);
  });

  it("derives level achievement from characterXp (edge)", () => {
    db.update(players)
      .set({ characterXp: 280 })
      .where(eq(players.id, playerId))
      .run();
    const rows = listAchievements(userId);
    const lvl = rows.find((a) => a.id === "reach_level_5")!;
    expect(lvl.counter).toBeGreaterThanOrEqual(5);
    expect(lvl.unlocked).toBe(true);
  });

  it("ignores bumps on derived achievements (failure)", () => {
    const before = listAchievements(userId).find(
      (a) => a.id === "quests_complete",
    )!;
    bumpAchievement(playerId, "quests_complete", 99);
    const after = listAchievements(userId).find(
      (a) => a.id === "quests_complete",
    )!;
    expect(after.counter).toBe(before.counter);
  });
});
