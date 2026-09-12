import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CHARACTER_LEVEL_THRESHOLDS,
  HOUSING_DECOR,
  WORLD,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl413-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
);
const { placeHousingDecor } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL41.3 housing decor place smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl413_${Date.now().toString(36)}`,
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

  it("places planter on land decor_pad without combat change (happy)", () => {
    const travel = travelToLandKind(userId, "player_land");
    if (!travel.ok) {
      expect(travel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    // Reason: CL41.3 — CityLands empty land has no STARTER pads; L5 soft-unlocks one.
    db.update(players)
      .set({
        softCurrency: 100,
        characterXp: CHARACTER_LEVEL_THRESHOLDS[5]!,
      })
      .where(eq(players.id, home.playerId))
      .run();

    const before = getPlayerState(userId)!;
    const pad = before.buildings.find((b) => b.type === "decor_pad");
    expect(pad).toBeTruthy();
    const coins = before.softCurrency;
    const dmg = before.damage;
    const def = before.defense;
    const hp = before.health;

    const result = placeHousingDecor(
      userId,
      pad!.id,
      "planter",
      buildingPos(pad!),
    );
    expect(result.ok).toBe(true);

    const after = getPlayerState(userId)!;
    expect(after.softCurrency).toBe(coins - HOUSING_DECOR.planter.coinCost);
    expect(after.buildings.find((b) => b.id === pad!.id)?.type).toBe(
      "decor_planter",
    );
    expect(after.damage).toBe(dmg);
    expect(after.defense).toBe(def);
    expect(after.health).toBe(hp);
  });

  it("keeps decor coin-only (no combat stats on catalog) (edge)", () => {
    expect(HOUSING_DECOR.planter.coinCost).toBeGreaterThan(0);
    expect(HOUSING_DECOR.banner.coinCost).toBeGreaterThan(0);
    expect("damage" in HOUSING_DECOR.planter).toBe(false);
    expect("defense" in HOUSING_DECOR.banner).toBe(false);
  });

  it("refuses housing decor on city (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const near = city.buildings[0]!;
    const result = placeHousingDecor(
      userId,
      near.id,
      "banner",
      buildingPos(near),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.decorStarterOnly);
    }
  });
});
