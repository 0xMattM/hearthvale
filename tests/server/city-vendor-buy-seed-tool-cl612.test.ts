import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getVendorPrices } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl612-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { vendorBuy } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock — City hub seed / basic tool buy rates. */
const WHEAT_SEED_BUY = 8;
const WOODEN_HOE_BUY = 12;

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

/**
 * CL61.2 — City vendor buy seed/tool smoke.
 * Choice: live stall buy for wheat_seed + wooden_hoe; broke refuse (assert-only rates already CL25.2).
 */
describe("CityLands CL61.2 city vendor buy seed/tool smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl612_${Date.now().toString(36)}`,
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

  it("buys wheat_seed and wooden_hoe at City stall (happy)", () => {
    const book = getVendorPrices("city").buy;
    expect(book.wheat_seed).toBe(WHEAT_SEED_BUY);
    expect(book.wooden_hoe).toBe(WOODEN_HOE_BUY);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(stall).toBeTruthy();

    db.update(players)
      .set({ softCurrency: WHEAT_SEED_BUY + WOODEN_HOE_BUY + 5 })
      .where(eq(players.userId, userId))
      .run();
    const coinsBefore = getPlayerState(userId)!.softCurrency;

    expect(
      vendorBuy(userId, "wheat_seed", 1, buildingPos(stall)).ok,
    ).toBe(true);
    expect(
      vendorBuy(userId, "wooden_hoe", 1, buildingPos(stall)).ok,
    ).toBe(true);

    const after = getPlayerState(userId)!;
    expect(after.softCurrency).toBe(
      coinsBefore - WHEAT_SEED_BUY - WOODEN_HOE_BUY,
    );
    expect(after.inventory.some((s) => s.itemId === "wheat_seed")).toBe(true);
    expect(after.inventory.some((s) => s.itemId === "wooden_hoe")).toBe(true);
  });

  it("refuses City tool buy when broke (failure)", () => {
    expect(getPlayerState(userId)!.landKind).toBe("city");
    db.update(players)
      .set({ softCurrency: 0 })
      .where(eq(players.userId, userId))
      .run();
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const result = vendorBuy(userId, "wooden_hoe", 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(ACTION_ERROR.notEnoughCoins);
  });
});
