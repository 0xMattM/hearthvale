import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  WORLD,
  getVendorPrices,
  type ItemId,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl331-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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

/** Content Lock CL33.1 — low NPC sink rates (city / explore / land same). */
const TONIC_BANDAGE_SELL_LOCK: ReadonlyArray<{
  itemId: ItemId;
  price: number;
}> = [
  { itemId: "herbal_tonic", price: 4 },
  { itemId: "cloth_bandage", price: 2 },
];

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function playerId(uid: string) {
  return db.select().from(players).where(eq(players.userId, uid)).get()!.id;
}

describe("CityLands CL33.1 vendor sell tonic + bandage", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`cl331_${Date.now().toString(36)}`, "password123");
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

  it("sells herbal tonic and cloth bandage at city vendor (happy)", () => {
    for (const kind of ["city", "explore", "player_land"] as const) {
      const book = getVendorPrices(kind).sell;
      for (const row of TONIC_BANDAGE_SELL_LOCK) {
        expect(book[row.itemId]).toBe(row.price);
      }
    }

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(stall).toBeTruthy();

    const pid = playerId(userId);
    addItem(pid, "herbal_tonic", 1);
    addItem(pid, "cloth_bandage", 1);
    db.update(players)
      .set({ softCurrency: 40 })
      .where(eq(players.userId, userId))
      .run();

    const before = getPlayerState(userId)!.softCurrency;
    expect(
      vendorSell(userId, "herbal_tonic", 1, buildingPos(stall)).ok,
    ).toBe(true);
    expect(
      vendorSell(userId, "cloth_bandage", 1, buildingPos(stall)).ok,
    ).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.softCurrency).toBe(before + 4 + 2);
    expect(after.inventory.some((s) => s.itemId === "herbal_tonic")).toBe(
      false,
    );
    expect(after.inventory.some((s) => s.itemId === "cloth_bandage")).toBe(
      false,
    );
  });

  it("keeps explore tonic/bandage books with no forest stall (edge)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    expect(getVendorPrices("explore").sell.herbal_tonic).toBe(4);
  });

  it("rejects tonic sell with empty bag (failure)", () => {
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const result = vendorSell(userId, "herbal_tonic", 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
