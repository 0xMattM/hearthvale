import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-vendor-qty-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);
process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind } = await import("../../apps/server/src/game/land.ts");
const { vendorBuy, vendorSell, VENDOR_QTY_MAX } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function stallPos(userId: string) {
  const stall = getPlayerState(userId)!.buildings.find((b) => b.type === "vendor_stall")!;
  return { x: WORLD.GRID * stall.x, z: WORLD.GRID * stall.z };
}

describe("vendor qty validation SEC-4", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`vq_${Date.now().toString(36)}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    addItem(pid, "wood", 2);
    db.update(players)
      .set({ softCurrency: 50 })
      .where(eq(players.userId, userId))
      .run();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("sells qty 1 (happy)", () => {
    expect(vendorSell(userId, "wood", 1, stallPos(userId)).ok).toBe(true);
  });

  it("rejects a fractional qty (edge)", () => {
    const res = vendorBuy(userId, "wheat_seed", 1.5, stallPos(userId));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe(ACTION_ERROR.invalidQty);
  });

  it("rejects Infinity, 0, and over-max (failure)", () => {
    const pos = stallPos(userId);
    expect(vendorBuy(userId, "wheat_seed", Number.POSITIVE_INFINITY, pos).ok).toBe(
      false,
    );
    expect(vendorSell(userId, "wood", 0, pos).ok).toBe(false);
    expect(vendorBuy(userId, "wheat_seed", VENDOR_QTY_MAX + 1, pos).ok).toBe(false);
  });
});
