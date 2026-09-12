import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, HOUSING_DECOR, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-decor-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { placeHousingDecor } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { getPlayerState, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("housing decor F11.5", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `decor_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    ensureStarterYardBuildings(getPlayerState(userId)!.landId);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("places planter on empty pad without changing combat (happy)", () => {
    const before = getPlayerState(userId)!;
    const pads = before.buildings.filter((b) => b.type === "decor_pad");
    expect(pads.length).toBeGreaterThanOrEqual(2);
    const pad = pads[0]!;
    const coins = before.softCurrency;
    const dmg = before.damage;
    const def = before.defense;
    const hp = before.health;

    const result = placeHousingDecor(
      userId,
      pad.id,
      "planter",
      buildingPos(pad),
    );
    expect(result.ok).toBe(true);

    const after = getPlayerState(userId)!;
    expect(after.softCurrency).toBe(coins - HOUSING_DECOR.planter.coinCost);
    expect(after.buildings.find((b) => b.id === pad.id)?.type).toBe(
      "decor_planter",
    );
    expect(after.damage).toBe(dmg);
    expect(after.defense).toBe(def);
    expect(after.health).toBe(hp);
  });

  it("rejects placing on already decorated pad (edge)", () => {
    const state = getPlayerState(userId)!;
    const planter = state.buildings.find((b) => b.type === "decor_planter");
    expect(planter).toBeTruthy();
    const result = placeHousingDecor(
      userId,
      planter!.id,
      "banner",
      buildingPos(planter!),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.decorPadMissing);
  });

  it("rejects decor when broke (failure)", () => {
    const state = getPlayerState(userId)!;
    const pad = state.buildings.find((b) => b.type === "decor_pad");
    expect(pad).toBeTruthy();
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    db.update(players)
      .set({ softCurrency: 1 })
      .where(eq(players.id, pid))
      .run();
    const result = placeHousingDecor(
      userId,
      pad!.id,
      "banner",
      buildingPos(pad!),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(
        ACTION_ERROR.needCoinsDecor(HOUSING_DECOR.banner.coinCost),
      );
    }
  });
});
