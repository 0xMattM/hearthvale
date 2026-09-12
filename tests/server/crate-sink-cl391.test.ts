import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  MARKET,
  WORLD,
  getVendorPrices,
  type ItemId,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl391-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { createMarketListing, listMarket } = await import(
  "../../apps/server/src/game/actions/market.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock CL39.1 — low NPC crate sink (below 2× plank = 8). */
const CRATE_SELL = 3;
const CRATE_ITEM: ItemId = "wood_crate";

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function playerId(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!.id;
}

describe("CityLands CL39.1 wood crate vendor or market sink", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl391_${Date.now().toString(36)}`, "password123");
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

  it("sells crate at Content Lock rate and lists on market (happy)", () => {
    for (const kind of ["city", "explore", "player_land"] as const) {
      expect(getVendorPrices(kind).sell.wood_crate).toBe(CRATE_SELL);
    }
    expect(CRATE_SELL).toBeLessThan(
      (getVendorPrices("city").sell.plank ?? 0) * 2,
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const pid = playerId(userId);
    addItem(pid, CRATE_ITEM, 2);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.userId, userId))
      .run();

    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, CRATE_ITEM, 1, buildingPos(stall)).ok).toBe(
      true,
    );
    expect(getPlayerState(userId)!.softCurrency).toBe(coinsBefore + CRATE_SELL);

    expect(createMarketListing(userId, CRATE_ITEM, 1, 5).ok).toBe(true);
    expect(
      listMarket(userId).some((l) => l.itemId === CRATE_ITEM && l.mine),
    ).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === CRATE_ITEM),
    ).toBe(false);
  });

  it("keeps explore crate rate flat with city (edge)", () => {
    expect(getVendorPrices("explore").sell.wood_crate).toBe(
      getVendorPrices("city").sell.wood_crate,
    );
  });

  it("rejects crate sell with empty bag (failure)", () => {
    const state = getPlayerState(userId)!;
    if (state.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === CRATE_ITEM),
    ).toBe(false);
    const result = vendorSell(userId, CRATE_ITEM, 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
