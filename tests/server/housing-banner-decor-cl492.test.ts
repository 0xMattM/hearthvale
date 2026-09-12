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
  `game-cl492-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

describe("CityLands CL49.2 housing second decor place smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl492_${Date.now().toString(36)}`,
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

  it("places banner on land decor_pad coin-only (happy)", () => {
    const travel = travelToLandKind(userId, "player_land");
    if (!travel.ok) {
      expect(travel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    // Reason: CL41.3 / CL49.2 — L5 soft-unlocks decor_pad; banner is second catalog SKU.
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
    expect(HOUSING_DECOR.banner.buildingType).toBe("decor_banner");
    expect(HOUSING_DECOR.banner.coinCost).toBe(18);
    const coins = before.softCurrency;
    const dmg = before.damage;
    const def = before.defense;
    const hp = before.health;

    const result = placeHousingDecor(
      userId,
      pad!.id,
      "banner",
      buildingPos(pad!),
    );
    expect(result.ok).toBe(true);

    const after = getPlayerState(userId)!;
    expect(after.softCurrency).toBe(coins - HOUSING_DECOR.banner.coinCost);
    expect(after.buildings.find((b) => b.id === pad!.id)?.type).toBe(
      "decor_banner",
    );
    expect(after.damage).toBe(dmg);
    expect(after.defense).toBe(def);
    expect(after.health).toBe(hp);
  });

  it("keeps banner distinct from planter in catalog (edge)", () => {
    expect(HOUSING_DECOR.banner.coinCost).not.toBe(
      HOUSING_DECOR.planter.coinCost,
    );
    expect(HOUSING_DECOR.banner.buildingType).not.toBe(
      HOUSING_DECOR.planter.buildingType,
    );
    expect("damage" in HOUSING_DECOR.banner).toBe(false);
  });

  it("refuses housing banner on city (failure)", () => {
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
