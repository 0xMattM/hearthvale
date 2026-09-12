import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-mvp-trade-escrow-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const {
  createTradeOffer,
  acceptTrade,
  rejectTrade,
  listPendingTrades,
} = await import("../../apps/server/src/game/actions/trade.ts");
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { db } = await import("../../apps/server/src/db/client.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");
const { eq } = await import("drizzle-orm");

describe("trade escrow + tools P6.1", () => {
  let sellerId = "";
  let buyerId = "";
  let sellerName = "";
  let buyerName = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now();
    sellerName = `tsell_${stamp}`;
    buyerName = `tbuy_${stamp}`;
    const s = registerUser(sellerName, "testpass");
    const b = registerUser(buyerName, "testpass");
    expect(s.ok && b.ok).toBe(true);
    sellerId = userIdFromToken(s.token!)!;
    buyerId = userIdFromToken(b.token!)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("escrows offered wheat immediately (happy)", () => {
    const seller = db.select().from(players).where(eq(players.userId, sellerId)).get()!;
    addItem(seller.id, "wheat", 3);
    const before = getPlayerState(sellerId)!;
    const wheatBefore =
      before.inventory.find((i) => i.itemId === "wheat")?.qty ?? 0;

    const created = createTradeOffer(
      sellerId,
      buyerName,
      [{ itemId: "wheat", qty: 2 }],
      [{ itemId: "iron_ore", qty: 1 }],
      0,
      0,
    );
    expect(created.ok).toBe(true);

    const after = getPlayerState(sellerId)!;
    const wheatAfter =
      after.inventory.find((i) => i.itemId === "wheat")?.qty ?? 0;
    expect(wheatAfter).toBe(wheatBefore - 2);

    const pending = listPendingTrades(buyerId);
    expect(pending.some((t) => t.give.some((g) => g.itemId === "wheat" && g.qty === 2))).toBe(
      true,
    );
  });

  it("returns escrow on cancel (edge)", () => {
    const outgoing = listPendingTrades(sellerId).find((t) => t.direction === "outgoing");
    expect(outgoing).toBeTruthy();
    const wheatBefore =
      getPlayerState(sellerId)!.inventory.find((i) => i.itemId === "wheat")?.qty ?? 0;
    const result = rejectTrade(sellerId, outgoing!.id);
    expect(result.ok).toBe(true);
    const wheatAfter =
      getPlayerState(sellerId)!.inventory.find((i) => i.itemId === "wheat")?.qty ?? 0;
    expect(wheatAfter).toBe(wheatBefore + 2);
  });

  it("trades an iron hoe preserving durability (happy)", () => {
    const seller = db.select().from(players).where(eq(players.userId, sellerId)).get()!;
    const buyer = db.select().from(players).where(eq(players.userId, buyerId)).get()!;
    addItem(seller.id, "iron_hoe", 1);
    addItem(buyer.id, "wheat", 4);
    const hoe = getPlayerState(sellerId)!.inventory.find((i) => i.itemId === "iron_hoe")!;
    expect(hoe.durability).toBe(60);

    const created = createTradeOffer(
      sellerId,
      buyerName,
      [{ itemId: "iron_hoe", qty: 1 }],
      [{ itemId: "wheat", qty: 3 }],
      0,
      0,
    );
    expect(created.ok).toBe(true);
    expect(
      getPlayerState(sellerId)!.inventory.some((i) => i.itemId === "iron_hoe"),
    ).toBe(false);

    const offer = listPendingTrades(buyerId).find((t) =>
      t.give.some((g) => g.itemId === "iron_hoe"),
    );
    expect(offer).toBeTruthy();
    expect(offer!.give[0].durability).toBe(60);

    const accepted = acceptTrade(buyerId, offer!.id);
    expect(accepted.ok).toBe(true);

    const buyerHoe = getPlayerState(buyerId)!.inventory.find(
      (i) => i.itemId === "iron_hoe",
    );
    expect(buyerHoe?.durability).toBe(60);
    expect(
      (getPlayerState(sellerId)!.inventory.find((i) => i.itemId === "wheat")?.qty ?? 0) >= 3,
    ).toBe(true);
  });

  it("rejects accept when recipient lacks asked goods (failure)", () => {
    const seller = db.select().from(players).where(eq(players.userId, sellerId)).get()!;
    addItem(seller.id, "flour", 1);
    const created = createTradeOffer(
      sellerId,
      buyerName,
      [{ itemId: "flour", qty: 1 }],
      [{ itemId: "iron_bar", qty: 99 }],
      0,
      0,
    );
    expect(created.ok).toBe(true);
    const offer = listPendingTrades(buyerId).find((t) =>
      t.give.some((g) => g.itemId === "flour"),
    )!;
    const result = acceptTrade(buyerId, offer.id);
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.tradeYouMissingItems);
    // escrow remains until reject
    const still = listPendingTrades(sellerId).find((t) => t.id === offer.id);
    expect(still).toBeTruthy();
    rejectTrade(sellerId, offer.id);
  });
});
