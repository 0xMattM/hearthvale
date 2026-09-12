import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, MARKET } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl651-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const {
  createMarketListing,
  buyMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

/**
 * CL65.1 — Market listing TTL expire → escrow return smoke.
 * Choice: assert-only TTL + escrow return (F11.4) with City board + buy refuse.
 */
describe("CityLands CL65.1 market listing TTL expire → escrow return smoke", () => {
  let sellerId = "";
  let buyerId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const s = registerUser(`cl651s_${stamp}`, "password123");
    const b = registerUser(`cl651b_${stamp}`, "password123");
    expect(s.ok && b.ok).toBe(true);
    if (!s.ok || !b.ok) throw new Error("register failed");
    sellerId = userIdFromToken(s.token)!;
    buyerId = userIdFromToken(b.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("lists goods then TTL elapse returns escrow to seller (happy)", () => {
    expect(travelToLandKind(sellerId, "city").ok).toBe(true);
    const seller = getPlayerState(sellerId)!;
    expect(seller.buildings.some((b) => b.type === "market_board")).toBe(true);
    addItem(seller.playerId, "plank", 2);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.userId, sellerId))
      .run();

    const before =
      getPlayerState(sellerId)!.inventory.find((i) => i.itemId === "plank")
        ?.qty ?? 0;
    expect(before).toBeGreaterThanOrEqual(1);

    const t0 = Date.now();
    const created = createMarketListing(sellerId, "plank", 1, 5, t0);
    expect(created.ok).toBe(true);
    const listingId = created.listingId!;

    const mid =
      getPlayerState(sellerId)!.inventory.find((i) => i.itemId === "plank")
        ?.qty ?? 0;
    expect(mid).toBe(before - 1);
    expect(
      listMarket(sellerId, t0 + 1).some((l) => l.id === listingId && l.mine),
    ).toBe(true);
    expect(
      listMarket(sellerId, t0 + 1).find((l) => l.id === listingId)?.expiresAt,
    ).toBe(t0 + MARKET.listingTtlMs);

    const afterTtl = t0 + MARKET.listingTtlMs + 1;
    expect(listMarket(buyerId, afterTtl).some((l) => l.id === listingId)).toBe(
      false,
    );
    const after =
      getPlayerState(sellerId)!.inventory.find((i) => i.itemId === "plank")
        ?.qty ?? 0;
    expect(after).toBe(before);
  });

  it("rejects buy after TTL expiry (failure)", () => {
    const pid = getPlayerState(sellerId)!.playerId;
    addItem(pid, "cloth", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 10 })
      .where(eq(players.userId, sellerId))
      .run();

    const t0 = Date.now();
    const created = createMarketListing(sellerId, "cloth", 1, 6, t0);
    expect(created.ok).toBe(true);
    const listingId = created.listingId!;

    expect(travelToLandKind(buyerId, "city").ok).toBe(true);
    db.update(players)
      .set({ softCurrency: 50 })
      .where(eq(players.userId, buyerId))
      .run();

    const late = buyMarketListing(
      buyerId,
      listingId,
      t0 + MARKET.listingTtlMs + 2,
    );
    expect(late.ok).toBe(false);
    if (!late.ok) {
      expect(
        late.error === ACTION_ERROR.marketExpired ||
          late.error === ACTION_ERROR.marketNotFound,
      ).toBe(true);
    }
    expect(
      listMarket(buyerId, t0 + MARKET.listingTtlMs + 3).some(
        (l) => l.id === listingId,
      ),
    ).toBe(false);
  });
});
