import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  EXPLORE_VENDOR_PREMIUM_SELL_ITEMS,
  WORLD,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl771-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Premium gather mat — Explore book pays more than City (CL10.2 / CL40.1 / CL77.1). */
const PREMIUM_ITEM = "wood" as const;

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function playerId(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!.id;
}

/**
 * CL77.1 — Explore premium wood sell still green.
 * Choice: assert-only Explore > City wood rate (parity with CL68.3 leather; no price retune).
 */
describe("CityLands CL77.1 Explore premium wood sell still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl771_${Date.now().toString(36)}`,
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

  it("pays Explore premium over City rate on live wood sell (happy)", () => {
    const cityRate = getVendorPrices("city").sell[PREMIUM_ITEM]!;
    const exploreRate = getVendorPrices("explore").sell[PREMIUM_ITEM]!;
    expect(exploreRate).toBeGreaterThan(cityRate);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const cityStall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(cityStall).toBeTruthy();
    const pid = playerId(userId);
    addItem(pid, PREMIUM_ITEM, 2);

    const cityCoins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, PREMIUM_ITEM, 1, buildingPos(cityStall)).ok).toBe(
      true,
    );
    expect(getPlayerState(userId)!.softCurrency).toBe(cityCoins + cityRate);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.landKind).toBe("explore");
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    expect(exploreRate - cityRate).toBeGreaterThan(0);
  });

  it("keeps wood on premium table and Explore > City (edge)", () => {
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain(PREMIUM_ITEM);
    const city = getVendorPrices("city").sell;
    const explore = getVendorPrices("explore").sell;
    expect(explore[PREMIUM_ITEM]!).toBeGreaterThan(city[PREMIUM_ITEM]!);
  });

  it("rejects Explore premium wood sell with empty bag (failure)", () => {
    const state = getPlayerState(userId)!;
    if (state.landKind !== "explore") {
      expect(travelToLandKind(userId, "explore").ok).toBe(true);
    }
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    const result = vendorSell(userId, PREMIUM_ITEM, 1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.needsStation("vendor stall"));
    }
  });
});
