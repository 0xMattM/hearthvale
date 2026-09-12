import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CANONICAL_LAND_KINDS,
  LAND_DESTINATIONS,
  TRAVEL,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl502-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { players } = await import("../../apps/server/src/db/schema.ts");

/**
 * CL50.2 — four-map free travel still green after CL47–CL50 economy work.
 * Choice: assert-only reverse circuit (fare-free holds) over changing travel rules.
 */
describe("CityLands CL50.2 four-map free travel still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl502_${Date.now().toString(36)}`,
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

  it("circuits warrior ↔ explore ↔ land ↔ city instantly with no fare (happy)", () => {
    const before = getPlayerState(userId)!;
    const coins = before.softCurrency;
    const pid = before.playerId;
    addItem(pid, "travel_ration", 3);
    addItem(pid, "bread", 1);

    const circuit = [
      "warrior",
      "explore",
      "player_land",
      "city",
      "warrior",
    ] as const;
    for (const kind of circuit) {
      expect(travelToLandKind(userId, kind).ok).toBe(true);
      const state = getPlayerState(userId)!;
      expect(state.landKind).toBe(kind);
      expect(state.travelArriveAt).toBeNull();
      expect(state.travelDestinationKind).toBeNull();
      expect(state.softCurrency).toBe(coins);
    }

    const inv = getPlayerState(userId)!.inventory;
    expect(inv.some((i) => i.itemId === "travel_ration" && i.qty >= 3)).toBe(
      true,
    );
    expect(inv.some((i) => i.itemId === "bread" && i.qty >= 1)).toBe(true);
  });

  it("keeps destination book + caravan constants unused for map hops (edge)", () => {
    expect(LAND_DESTINATIONS.map((d) => d.kind)).toEqual([
      ...CANONICAL_LAND_KINDS,
    ]);
    expect(TRAVEL.durationMs).toBeGreaterThan(0);
    expect(TRAVEL.coinCost).toBeGreaterThan(0);

    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(0);
    expect(getPlayerState(userId)!.travelArriveAt).toBeNull();
  });

  it("refuses already-here travel (failure)", () => {
    expect(getPlayerState(userId)!.landKind).toBe("city");
    const again = travelToLandKind(userId, "city");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
  });
});
