import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CITY_BUILDINGS,
  FOREST_BUILDINGS,
  LAND_DESTINATIONS,
  WARRIOR_BUILDINGS,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-travel-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { lands, players } = await import("../../apps/server/src/db/schema.ts");

describe("CityLands free travel CL1.2", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `trav_${Date.now().toString(16)}`,
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

  it("arrives instantly at explore with no coin/ration spend (happy)", () => {
    const before = getPlayerState(userId)!;
    expect(before.landKind).toBe("player_land");
    const coins = before.softCurrency;
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    addItem(pid, "travel_ration", 1);

    const result = travelToLandKind(userId, "explore", Date.now());
    expect(result.ok).toBe(true);

    const after = getPlayerState(userId)!;
    expect(after.landKind).toBe("explore");
    expect(after.travelArriveAt).toBeNull();
    expect(after.travelDestinationKind).toBeNull();
    expect(after.softCurrency).toBe(coins);
    expect(after.inventory.some((i) => i.itemId === "travel_ration")).toBe(
      true,
    );
    expect(after.buildings.some((b) => b.type === "portal")).toBe(false);
    expect(after.buildings.length).toBe(FOREST_BUILDINGS.length);
  });

  it("creates city + warrior stubs and completes a four-map circuit (edge)", () => {
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    const coins = getPlayerState(userId)!.softCurrency;

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.landKind).toBe("city");
    expect(city.buildings).toHaveLength(CITY_BUILDINGS.length);
    expect(city.softCurrency).toBe(coins);

    expect(travelToLandKind(userId, "warrior").ok).toBe(true);
    const arena = getPlayerState(userId)!;
    expect(arena.landKind).toBe("warrior");
    expect(arena.buildings).toHaveLength(WARRIOR_BUILDINGS.length);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    expect(getPlayerState(userId)!.landKind).toBe("player_land");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    expect(getPlayerState(userId)!.landKind).toBe("explore");

    const ownedKinds = db
      .select()
      .from(lands)
      .where(eq(lands.playerId, pid))
      .all()
      .map((l) => l.kind)
      .sort();
    // City may be the shared hub owned by the first visitor (this user).
    expect(ownedKinds).toContain("explore");
    expect(ownedKinds).toContain("player_land");
    expect(ownedKinds).toContain("warrior");
    expect(ownedKinds).toContain("city");
    expect(city.buildings.length).toBe(CITY_BUILDINGS.length);
  });

  it("rejects already-here and unknown destination; cancels stale caravan (failure)", () => {
    // Previous edge case may leave player on explore — ensure we are there.
    const onExplore = getPlayerState(userId)!.landKind === "explore";
    if (!onExplore) expect(travelToLandKind(userId, "explore").ok).toBe(true);

    const again = travelToLandKind(userId, "explore");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.travelAlreadyHere);

    expect(travelToLandKind(userId, "swamp").ok).toBe(false);

    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    const coins = getPlayerState(userId)!.softCurrency;
    db.update(players)
      .set({
        travelDestinationKind: "player_land",
        travelArriveAt: Date.now() + 60_000,
      })
      .where(eq(players.id, pid))
      .run();

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    expect(home.travelArriveAt).toBeNull();
    expect(home.softCurrency).toBe(coins);

    expect(LAND_DESTINATIONS.map((d) => d.kind)).toEqual([
      "city",
      "player_land",
      "explore",
      "warrior",
    ]);
  });
});
