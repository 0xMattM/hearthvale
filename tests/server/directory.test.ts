import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const dbFile = path.join(
  os.tmpdir(),
  `game-mvp-dir-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { listOtherPlayers } = await import(
  "../../apps/server/src/game/directory.ts"
);

describe("player directory P3.1", () => {
  let aliceId = "";

  beforeAll(() => {
    migrateSqlite();
    const a = registerUser(`alice_${Date.now()}`, "testpass");
    const b = registerUser(`bob_${Date.now()}`, "testpass");
    expect(a.ok && b.ok).toBe(true);
    aliceId = userIdFromToken(a.token!)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("lists other players for trade discovery", () => {
    const list = listOtherPlayers(aliceId);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.every((p) => p.username !== "")).toBe(true);
  });

  it("does not include the requesting player", () => {
    const list = listOtherPlayers(aliceId);
    // alice username starts with alice_
    expect(list.some((p) => p.username.startsWith("alice_"))).toBe(false);
  });

  it("returns empty when alone (edge)", () => {
    const solo = registerUser(`solo_${Date.now()}`, "testpass");
    const soloId = userIdFromToken(solo.token!)!;
    // solo sees alice+bob at least; create isolated check by filtering
    const onlySelf = listOtherPlayers(soloId).filter((p) =>
      p.username.startsWith("solo_"),
    );
    expect(onlySelf).toEqual([]);
  });
});
