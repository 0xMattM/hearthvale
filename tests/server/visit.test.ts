import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-mvp-visit-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getVisitLand } = await import("../../apps/server/src/game/visit.ts");
const { getPlayerState, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);

describe("visit land P4.1", () => {
  let aliceId = "";
  let aliceName = "";
  let bobName = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now();
    aliceName = `visa_${stamp}`;
    bobName = `visb_${stamp}`;
    const a = registerUser(aliceName, "testpass");
    const b = registerUser(bobName, "testpass");
    expect(a.ok && b.ok).toBe(true);
    aliceId = userIdFromToken(a.token!)!;
    const bobId = userIdFromToken(b.token!)!;
    // Visit still works on empty land; seed Bob so buildings assertions hold.
    ensureStarterYardBuildings(getPlayerState(bobId)!.landId);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("loads another player's homestead buildings (happy)", () => {
    const res = getVisitLand(aliceId, bobName);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.land.ownerUsername).toBe(bobName);
    expect(res.land.buildings.some((b) => b.type === "crop_plot")).toBe(true);
    expect(res.land.buildings.some((b) => b.type === "mill")).toBe(true);
  });

  it("rejects visiting your own land (failure)", () => {
    const res = getVisitLand(aliceId, aliceName);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("own land");
  });

  it("rejects unknown player (edge)", () => {
    const res = getVisitLand(aliceId, "nobody_here_xyz");
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe(ACTION_ERROR.tradePlayerMissing);
  });
});
