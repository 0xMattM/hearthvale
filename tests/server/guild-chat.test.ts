import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-gchat-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { createGuild } = await import("../../apps/server/src/game/guilds.ts");
const { postChat, listChat } = await import(
  "../../apps/server/src/game/chat.ts"
);
const {
  listGuildChat,
  postGuildChat,
  resetGuildChat,
} = await import("../../apps/server/src/game/guildChat.ts");

describe("guild chat F12.5", () => {
  let memberId = "";
  let outsiderId = "";

  beforeAll(() => {
    migrateSqlite();
    resetGuildChat();
    const stamp = Date.now().toString(36);
    const a = registerUser(`gc_a_${stamp}`, "password123");
    const b = registerUser(`gc_b_${stamp}`, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    memberId = userIdFromToken(a.token)!;
    outsiderId = userIdFromToken(b.token)!;
    expect(createGuild(memberId, `talk_${stamp}`).ok).toBe(true);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("posts to guild channel without polluting world chat (happy)", () => {
    const worldBefore = listChat().length;
    const result = postGuildChat(memberId, "Rally at the grove");
    expect(result.ok).toBe(true);

    const listed = listGuildChat(memberId);
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.messages.some((m) => m.text === "Rally at the grove")).toBe(
        true,
      );
    }
    expect(listChat().length).toBe(worldBefore);

    postChat("npc", "World hello");
    expect(listChat().some((m) => m.text === "World hello")).toBe(true);
    const guildAgain = listGuildChat(memberId);
    if (guildAgain.ok) {
      expect(guildAgain.messages.some((m) => m.text === "World hello")).toBe(
        false,
      );
    }
  });

  it("rejects empty guild message (edge)", () => {
    const result = postGuildChat(memberId, "   ");
    expect(result.ok).toBe(false);
  });

  it("rejects outsiders not in a guild (failure)", () => {
    const result = postGuildChat(outsiderId, "Spy message");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.guildNotIn);

    const listed = listGuildChat(outsiderId);
    expect(listed.ok).toBe(false);
    if (!listed.ok) expect(listed.error).toBe(ACTION_ERROR.guildNotIn);
  });
});
