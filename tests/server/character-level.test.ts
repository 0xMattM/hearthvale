import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CHARACTER_LEVEL } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-level-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

describe("character level soft unlocks F13.1", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `lvl_${Date.now().toString(36)}`,
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

  it("exposes level fields and unlocks decor pad at threshold (happy)", () => {
    const before = getPlayerState(userId)!;
    expect(before.characterLevel).toBe(1);
    expect(before.characterTitle).toBe("Newcomer");
    expect(
      before.buildings.some(
        (b) => b.slotIndex === CHARACTER_LEVEL.extraDecorPad.slotIndex,
      ),
    ).toBe(false);

    db.update(players)
      .set({ characterXp: 280 })
      .where(eq(players.userId, userId))
      .run();

    const after = getPlayerState(userId)!;
    expect(after.characterLevel).toBe(5);
    expect(after.characterTitle).toBe("Homesteader");
    expect(
      after.buildings.some(
        (b) =>
          b.slotIndex === CHARACTER_LEVEL.extraDecorPad.slotIndex &&
          b.type === "decor_pad",
      ),
    ).toBe(true);
    // Combat unchanged by level unlock
    expect(after.damage).toBe(before.damage);
    expect(after.defense).toBe(before.defense);
  });
});
