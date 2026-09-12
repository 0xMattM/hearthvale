import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, LAND_DEED, walletNeverGatesCombat } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-deed-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { claimLandDeed, listLandDeeds } = await import(
  "../../apps/server/src/game/deeds.ts"
);
const { getPlayerState } = await import("../../apps/server/src/game/player.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

describe("land deeds F15.2", () => {
  let userId = "";
  let playerId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`deed_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    playerId = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!.id;
    db.update(players)
      .set({ softCurrency: LAND_DEED.claimCostCoins + 10 })
      .where(eq(players.id, playerId))
      .run();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("claims an off-chain deed without combat bonus (happy)", () => {
    const before = getPlayerState(userId)!;
    expect(before.deeds).toEqual([]);
    const combatBefore = {
      health: before.health,
      maxHealth: before.maxHealth,
      damage: before.damage,
      defense: before.defense,
      energy: before.energy,
      maxEnergy: before.maxEnergy,
    };
    const claim = claimLandDeed(userId);
    expect(claim.ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.deeds).toHaveLength(1);
    expect(after.deeds[0]!.title).toBe(LAND_DEED.title);
    expect(after.deeds[0]!.landKind).toBe("explore");
    expect(after.softCurrency).toBe(before.softCurrency - LAND_DEED.claimCostCoins);
    expect(
      walletNeverGatesCombat(combatBefore, {
        health: after.health,
        maxHealth: after.maxHealth,
        damage: after.damage,
        defense: after.defense,
        energy: after.energy,
        maxEnergy: after.maxEnergy,
      }),
    ).toBe(true);
    expect(listLandDeeds(playerId)).toHaveLength(1);
  });

  it("rejects a second deed for the same land (edge)", () => {
    db.update(players)
      .set({ softCurrency: LAND_DEED.claimCostCoins + 5 })
      .where(eq(players.id, playerId))
      .run();
    const again = claimLandDeed(userId);
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.deedAlreadyOwned);
  });

  it("fails when coins are insufficient (failure)", () => {
    const stamp = Date.now().toString(36);
    const reg = registerUser(`poor_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    const poorId = userIdFromToken(reg.token)!;
    const poorPlayer = db
      .select()
      .from(players)
      .where(eq(players.userId, poorId))
      .get()!;
    db.update(players)
      .set({ softCurrency: 0 })
      .where(eq(players.id, poorPlayer.id))
      .run();
    const res = claimLandDeed(poorId);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe(ACTION_ERROR.notEnoughCoins);
  });
});
