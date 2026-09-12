import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-gbank-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { createGuild, joinGuildByInvite } = await import(
  "../../apps/server/src/game/guilds.ts"
);
const {
  depositGuildBank,
  listGuildBank,
  withdrawGuildBank,
} = await import("../../apps/server/src/game/guildBank.ts");
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");
const { db } = await import("../../apps/server/src/db/client.ts");
const { eq } = await import("drizzle-orm");

describe("guild bank F12.2", () => {
  let userId = "";
  let playerId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `gbank_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    playerId = db.select().from(players).where(eq(players.userId, userId)).get()!
      .id;
    const created = createGuild(userId, `vault_${Date.now().toString(36)}`);
    expect(created.ok).toBe(true);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("deposits and withdraws stackables (happy)", () => {
    addItem(playerId, "wheat", 5);
    const before = getPlayerState(userId)!;
    const wheatBefore =
      before.inventory.find((i) => i.itemId === "wheat")?.qty ?? 0;

    const dep = depositGuildBank(userId, "wheat", 3);
    expect(dep.ok).toBe(true);
    expect(listGuildBank(userId)).toEqual([{ itemId: "wheat", qty: 3 }]);
    const mid = getPlayerState(userId)!;
    expect(mid.inventory.find((i) => i.itemId === "wheat")?.qty ?? 0).toBe(
      wheatBefore - 3,
    );

    const wd = withdrawGuildBank(userId, "wheat", 2);
    expect(wd.ok).toBe(true);
    expect(listGuildBank(userId)).toEqual([{ itemId: "wheat", qty: 1 }]);
    const after = getPlayerState(userId)!;
    expect(after.inventory.find((i) => i.itemId === "wheat")?.qty ?? 0).toBe(
      wheatBefore - 1,
    );
  });

  it("rejects tools (edge)", () => {
    const result = depositGuildBank(userId, "wooden_hoe", 1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.guildBankNotStackable);
    }
  });

  it("rejects empty withdraw (failure)", () => {
    const result = withdrawGuildBank(userId, "iron_ore", 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.guildBankEmpty);
  });

  it("rejects a member withdrawing the vault (HACK-4)", () => {
    const stamp = Date.now().toString(36);
    const ownerReg = registerUser(`gbo_${stamp}`, "password123");
    const memberReg = registerUser(`gbm_${stamp}`, "password123");
    expect(ownerReg.ok && memberReg.ok).toBe(true);
    if (!ownerReg.ok || !memberReg.ok) throw new Error("register failed");
    const ownerId = userIdFromToken(ownerReg.token)!;
    const memberId = userIdFromToken(memberReg.token)!;
    const created = createGuild(ownerId, `vault2_${stamp}`);
    expect(created.ok).toBe(true);
    expect(joinGuildByInvite(memberId, created.inviteCode!).ok).toBe(true);
    const memberPlayer = db
      .select()
      .from(players)
      .where(eq(players.userId, memberId))
      .get()!;
    addItem(memberPlayer.id, "wood", 2);
    expect(depositGuildBank(memberId, "wood", 2).ok).toBe(true);
    const denied = withdrawGuildBank(memberId, "wood", 1);
    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.error).toBe(ACTION_ERROR.guildBankWithdrawForbidden);
    }
    expect(withdrawGuildBank(ownerId, "wood", 1).ok).toBe(true);
  });
});
