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
  `game-cl811-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/** Premium mats — Explore book pays more than City (CL37.1 / CL44.1 / CL68.3). */
const LEATHER = "leather" as const;
const ORE = "iron_ore" as const;

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function playerId(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!.id;
}

/**
 * CL81.1 — Explore premium leather/ore sell still green.
 * Choice: assert-only Explore > City rates (parity with CL68.3 / CL44.1; no price retune).
 */
describe("CityLands CL81.1 Explore premium leather/ore sell still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl811_${Date.now().toString(36)}`,
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

  it("pays Explore premium over City on live leather and iron_ore sell (happy)", () => {
    const cityLeather = getVendorPrices("city").sell[LEATHER]!;
    const exploreLeather = getVendorPrices("explore").sell[LEATHER]!;
    const cityOre = getVendorPrices("city").sell[ORE]!;
    const exploreOre = getVendorPrices("explore").sell[ORE]!;
    expect(exploreLeather).toBeGreaterThan(cityLeather);
    expect(exploreOre).toBeGreaterThan(cityOre);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const cityStall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(cityStall).toBeTruthy();
    const pid = playerId(userId);
    addItem(pid, LEATHER, 2);
    addItem(pid, ORE, 2);

    let coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, LEATHER, 1, buildingPos(cityStall)).ok).toBe(
      true,
    );
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + cityLeather);
    coins = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, ORE, 1, buildingPos(cityStall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coins + cityOre);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.landKind).toBe("explore");
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
  });

  it("keeps leather and iron_ore on premium table Explore > City (edge)", () => {
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain(LEATHER);
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain(ORE);
    const city = getVendorPrices("city").sell;
    const explore = getVendorPrices("explore").sell;
    expect(explore[LEATHER]!).toBeGreaterThan(city[LEATHER]!);
    expect(explore[ORE]!).toBeGreaterThan(city[ORE]!);
    expect(explore[ORE]!).toBeGreaterThan(
      getVendorPrices("player_land").sell[ORE]!,
    );
  });

  it("rejects Explore premium leather/ore sell with empty bag (failure)", () => {
    const state = getPlayerState(userId)!;
    if (state.landKind !== "explore") {
      expect(travelToLandKind(userId, "explore").ok).toBe(true);
    }
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    const leatherRefuse = vendorSell(userId, LEATHER, 1);
    expect(leatherRefuse.ok).toBe(false);
    if (!leatherRefuse.ok) {
      expect(leatherRefuse.error).toBe(
        ACTION_ERROR.needsStation("vendor stall"),
      );
    }
    const oreRefuse = vendorSell(userId, ORE, 1);
    expect(oreRefuse.ok).toBe(false);
    if (!oreRefuse.ok) {
      expect(oreRefuse.error).toBe(ACTION_ERROR.needsStation("vendor stall"));
    }
  });
});
