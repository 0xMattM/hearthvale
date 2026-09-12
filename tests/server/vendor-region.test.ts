import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  getVendorPrices,
  VENDOR,
  WORLD,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-vendor-region-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { vendorSell, vendorBuy } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { getPlayerState, addItem, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { getTelemetrySnapshot } = await import(
  "../../apps/server/src/telemetry.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("regional vendor prices F11.3", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `vend_${Date.now().toString(36)}`,
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

  it("pays forest wood premium vs homestead (happy)", () => {
    const home = getPlayerState(userId)!;
    const stall = home.buildings.find((b) => b.type === "vendor_stall")!;
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    addItem(pid, "wood", 2);
    const before = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "wood", 1, buildingPos(stall)).ok).toBe(true);
    const afterHome = getPlayerState(userId)!;
    expect(afterHome.softCurrency).toBe(before + (VENDOR.sell.wood ?? 0));

    // Free travel arrives immediately (CL1.2).
    expect(travelToLandKind(userId, "forest", Date.now()).ok).toBe(true);
    const forest = getPlayerState(userId)!;
    expect(forest.landKind).toBe("explore");
    expect(forest.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    expect(getVendorPrices("explore").sell.wood).toBeGreaterThan(
      getVendorPrices("player_land").sell.wood!,
    );
  });

  it("exposes regional books on telemetry (edge)", () => {
    const snap = getTelemetrySnapshot();
    expect(snap.vendorPricesByRegion.player_land.buy.wheat_seed).toBe(8);
    expect(snap.vendorPricesByRegion.explore.buy.wheat_seed).toBe(10);
    expect(snap.vendorPricesByRegion.city.buy.wheat_seed).toBe(8);
    expect(snap.forestVendor.sell.wood).toBe(3);
    expect(snap.homesteadVendor.sell.wood).toBe(2);
  });

  it("rejects buy when broke at forest seed premium (failure)", () => {
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    // Land on forest with almost no coins.
    db.update(players)
      .set({
        softCurrency: 5,
        travelArriveAt: null,
        travelDestinationKind: null,
      })
      .where(eq(players.id, pid))
      .run();
    const state = getPlayerState(userId)!;
    if (state.landKind !== "explore") {
      expect(travelToLandKind(userId, "explore", Date.now()).ok).toBe(true);
      db.update(players)
        .set({ softCurrency: 5 })
        .where(eq(players.id, pid))
        .run();
    }
    const forest = getPlayerState(userId)!;
    expect(forest.landKind).toBe("explore");
    expect(forest.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    const seedPrice = getVendorPrices("explore").buy.wheat_seed!;
    expect(seedPrice).toBeGreaterThan(forest.softCurrency);
    const result = vendorBuy(userId, "wheat_seed", 1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.needsStation("vendor stall"));
    }
  });
});
