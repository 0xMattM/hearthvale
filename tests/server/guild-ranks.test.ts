import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-guild-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const {
  createGuild,
  joinGuildByInvite,
  listGuildMembers,
  regenerateInviteCode,
  setGuildMemberRank,
} = await import("../../apps/server/src/game/guilds.ts");
const { getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
);

describe("guild ranks + invite codes F12.1", () => {
  let ownerId = "";
  let memberId = "";
  let inviteCode = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const ownerReg = registerUser(`g_own_${stamp}`, "password123");
    const memberReg = registerUser(`g_mem_${stamp}`, "password123");
    expect(ownerReg.ok).toBe(true);
    expect(memberReg.ok).toBe(true);
    if (!ownerReg.ok || !memberReg.ok) throw new Error("register failed");
    ownerId = userIdFromToken(ownerReg.token)!;
    memberId = userIdFromToken(memberReg.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("creates guild as owner with invite code (happy)", () => {
    const result = createGuild(ownerId, `oaks_${Date.now().toString(36)}`);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("create failed");
    expect(result.inviteCode).toBeTruthy();
    inviteCode = result.inviteCode!;

    const state = getPlayerState(ownerId)!;
    expect(state.guildName).toBeTruthy();
    expect(state.guildRank).toBe("owner");
    expect(state.guildInviteCode).toBe(inviteCode);
  });

  it("joins via invite as member; code hidden from members (edge)", () => {
    const result = joinGuildByInvite(memberId, inviteCode);
    expect(result.ok).toBe(true);

    const state = getPlayerState(memberId)!;
    expect(state.guildName).toBeTruthy();
    expect(state.guildRank).toBe("member");
    expect(state.guildInviteCode).toBeNull();

    const members = listGuildMembers(ownerId);
    expect(members.some((m) => m.rank === "owner")).toBe(true);
    expect(members.some((m) => m.rank === "member")).toBe(true);
  });

  it("rejects bad invite and member promoting (failure)", () => {
    const stamp = Date.now().toString(36);
    const outsider = registerUser(`g_out_${stamp}`, "password123");
    expect(outsider.ok).toBe(true);
    if (!outsider.ok) throw new Error("register failed");
    const outsiderId = userIdFromToken(outsider.token)!;

    const bad = joinGuildByInvite(outsiderId, "ZZZZZZ");
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBe(ACTION_ERROR.guildInviteInvalid);

    const forbidden = setGuildMemberRank(
      memberId,
      getPlayerState(ownerId)!.username,
      "officer",
    );
    expect(forbidden.ok).toBe(false);
    if (!forbidden.ok) {
      expect(forbidden.error).toBe(ACTION_ERROR.guildRankForbidden);
    }

    const promote = setGuildMemberRank(
      ownerId,
      getPlayerState(memberId)!.username,
      "officer",
    );
    expect(promote.ok).toBe(true);
    expect(getPlayerState(memberId)!.guildRank).toBe("officer");
    expect(getPlayerState(memberId)!.guildInviteCode).toBeTruthy();

    const regen = regenerateInviteCode(memberId);
    expect(regen.ok).toBe(true);
    if (regen.ok) expect(regen.inviteCode).not.toBe(inviteCode);
  });
});
