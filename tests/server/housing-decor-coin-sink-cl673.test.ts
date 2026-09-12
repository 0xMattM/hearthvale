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
  `game-cl673-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/**
 * CL67.3 — housing decor coin sink still green: land pad place + broke refuse.
 * Choice: assert-only planter sink (broke refuse) over inventing new SKUs.
 */
describe("CityLands CL67.3 housing decor coin sink still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl673_${Date.now().toString(36)}`,
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

  it("places planter on land decor_pad as coin sink (happy)", () => {
    const travel = travelToLandKind(userId, "player_land");
    if (!travel.ok) {
      expect(travel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    // Reason: L5 soft-unlocks decor_pad; planter is first catalog coin sink.
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
    expect(HOUSING_DECOR.planter.coinCost).toBe(12);
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

  it("keeps planter and banner coin-only catalog costs (edge)", () => {
    expect(HOUSING_DECOR.planter.coinCost).toBe(12);
    expect(HOUSING_DECOR.banner.coinCost).toBe(18);
    expect(HOUSING_DECOR.banner.coinCost).toBeGreaterThan(
      HOUSING_DECOR.planter.coinCost,
    );
    expect("damage" in HOUSING_DECOR.planter).toBe(false);
    expect("defense" in HOUSING_DECOR.banner).toBe(false);
  });

  it("refuses housing decor when broke (failure)", () => {
    const fresh = registerUser(
      `cl673b_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const brokeId = userIdFromToken(fresh.token)!;

    const travel = travelToLandKind(brokeId, "player_land");
    if (!travel.ok) {
      expect(travel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const home = getPlayerState(brokeId)!;
    db.update(players)
      .set({
        softCurrency: 0,
        characterXp: CHARACTER_LEVEL_THRESHOLDS[5]!,
      })
      .where(eq(players.id, home.playerId))
      .run();

    const pad = getPlayerState(brokeId)!.buildings.find(
      (b) => b.type === "decor_pad",
    );
    expect(pad).toBeTruthy();

    const result = placeHousingDecor(
      brokeId,
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
    expect(
      getPlayerState(brokeId)!.buildings.find((b) => b.id === pad!.id)?.type,
    ).toBe("decor_pad");
  });
});
