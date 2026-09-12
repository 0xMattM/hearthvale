import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { MARKET } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-txn-rf2-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;
process.env.GAME_BCRYPT_COST = "4";

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { withTransaction } = await import(
  "../../apps/server/src/db/transaction.ts"
);
const {
  buyMarketListing,
  createMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const { addItem, getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

describe("economy transactions RF2", () => {
  let sellerId = "";
  let buyerAId = "";
  let buyerBId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(16);
    const s = registerUser(`txn_s_${stamp}`, "password123");
    const a = registerUser(`txn_a_${stamp}`, "password123");
    const b = registerUser(`txn_b_${stamp}`, "password123");
    expect(s.ok && a.ok && b.ok).toBe(true);
    sellerId = userIdFromToken(s.token!)!;
    buyerAId = userIdFromToken(a.token!)!;
    buyerBId = userIdFromToken(b.token!)!;

    const seller = db.select().from(players).where(eq(players.userId, sellerId)).get()!;
    addItem(seller.id, "wheat", 20);
    db.update(players)
      .set({ softCurrency: 500 })
      .where(eq(players.id, seller.id))
      .run();

    for (const uid of [buyerAId, buyerBId]) {
      const p = db.select().from(players).where(eq(players.userId, uid)).get()!;
      db.update(players)
        .set({ softCurrency: 500 })
        .where(eq(players.id, p.id))
        .run();
    }
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("withTransaction commits (RF2.1 happy)", () => {
    let saw = false;
    withTransaction(() => {
      saw = true;
    });
    expect(saw).toBe(true);
  });

  it("withTransaction rolls back on throw (RF2.1 fail)", () => {
    const before = getPlayerState(sellerId)!.softCurrency;
    expect(() =>
      withTransaction(() => {
        const p = db.select().from(players).where(eq(players.userId, sellerId)).get()!;
        db.update(players)
          .set({ softCurrency: before + 999 })
          .where(eq(players.id, p.id))
          .run();
        throw new Error("boom");
      }),
    ).toThrow("boom");
    expect(getPlayerState(sellerId)!.softCurrency).toBe(before);
  });

  it("market list+buy stay consistent (RF2.2)", () => {
    const listed = createMarketListing(sellerId, "wheat", 5, 10);
    expect(listed.ok).toBe(true);
    const fee = MARKET.listFeeCoins;
    const buy = buyMarketListing(buyerAId, listed.listingId!);
    expect(buy.ok).toBe(true);
    const board = listMarket(buyerAId);
    expect(board.find((l) => l.id === listed.listingId)).toBeUndefined();
    expect(fee).toBeGreaterThanOrEqual(0);
  });

  it("second buyer loses when listing already sold (RF2.5)", () => {
    const listed = createMarketListing(sellerId, "wheat", 3, 8);
    expect(listed.ok).toBe(true);
    const first = buyMarketListing(buyerAId, listed.listingId!);
    expect(first.ok).toBe(true);
    const second = buyMarketListing(buyerBId, listed.listingId!);
    expect(second.ok).toBe(false);
  });
});
