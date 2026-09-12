import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-mvp-market-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const {
  createMarketListing,
  buyMarketListing,
  cancelMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const { getPlayerState } = await import("../../apps/server/src/game/player.ts");

describe("marketplace P4.2", () => {
  let sellerId = "";
  let buyerId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now();
    const s = registerUser(`msell_${stamp}`, "testpass");
    const b = registerUser(`mbuy_${stamp}`, "testpass");
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

  it("lists wheat and removes it from inventory (happy)", () => {
    const before = getPlayerState(sellerId)!;
    const oreBefore =
      before.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0;
    expect(oreBefore).toBeGreaterThanOrEqual(1);
    const coinsBefore = before.softCurrency;

    const created = createMarketListing(sellerId, "iron_ore", 1, 3);
    expect(created.ok).toBe(true);

    const after = getPlayerState(sellerId)!;
    const oreAfter =
      after.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0;
    expect(oreAfter).toBe(oreBefore - 1);
    expect(after.softCurrency).toBe(coinsBefore - 2);

    const board = listMarket(buyerId);
    expect(board.some((l) => l.itemId === "iron_ore" && l.priceCoins === 3)).toBe(
      true,
    );
    expect(board.find((l) => l.itemId === "iron_ore")?.expiresAt).toBeGreaterThan(
      Date.now(),
    );
  });

  it("buys a listing transferring goods and coins (happy)", () => {
    const board = listMarket(buyerId);
    const listing = board.find((l) => !l.mine && l.itemId === "iron_ore");
    expect(listing).toBeTruthy();

    const buyerBefore = getPlayerState(buyerId)!;
    const sellerBefore = getPlayerState(sellerId)!;
    const result = buyMarketListing(buyerId, listing!.id);
    expect(result.ok).toBe(true);

    const buyerAfter = getPlayerState(buyerId)!;
    const sellerAfter = getPlayerState(sellerId)!;
    expect(buyerAfter.softCurrency).toBe(buyerBefore.softCurrency - listing!.priceCoins);
    expect(sellerAfter.softCurrency).toBe(
      sellerBefore.softCurrency + listing!.priceCoins,
    );
    expect(
      (buyerAfter.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0) >= 1,
    ).toBe(true);
  });

  it("rejects buying your own listing (failure)", () => {
    createMarketListing(sellerId, "iron_ore", 1, 2);
    const mine = listMarket(sellerId).find((l) => l.mine);
    expect(mine).toBeTruthy();
    const result = buyMarketListing(sellerId, mine!.id);
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.marketOwnListing);
  });

  it("cancels listing and returns goods (edge)", () => {
    const mine = listMarket(sellerId).find((l) => l.mine);
    expect(mine).toBeTruthy();
    const before = getPlayerState(sellerId)!;
    const oreBefore =
      before.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0;
    const result = cancelMarketListing(sellerId, mine!.id);
    expect(result.ok).toBe(true);
    const after = getPlayerState(sellerId)!;
    const oreAfter =
      after.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0;
    expect(oreAfter).toBe(oreBefore + mine!.qty);
  });

  it("expires listing and returns escrow after TTL (F11.4)", async () => {
    const { MARKET } = await import("@game/shared");
    const before = getPlayerState(sellerId)!;
    const oreBefore =
      before.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0;
    expect(oreBefore).toBeGreaterThanOrEqual(1);
    const t0 = Date.now();
    const created = createMarketListing(sellerId, "iron_ore", 1, 4, t0);
    expect(created.ok).toBe(true);
    const listingId = created.listingId!;

    const mid = getPlayerState(sellerId)!;
    expect(
      (mid.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0),
    ).toBe(oreBefore - 1);

    const boardGone = listMarket(buyerId, t0 + MARKET.listingTtlMs + 1);
    expect(boardGone.some((l) => l.id === listingId)).toBe(false);

    const after = getPlayerState(sellerId)!;
    expect(
      after.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0,
    ).toBe(oreBefore);

    const buyGone = buyMarketListing(buyerId, listingId, t0 + MARKET.listingTtlMs + 2);
    expect(buyGone.ok).toBe(false);
  });

  it("rejects listing without fee coins (failure)", async () => {
    const { MARKET } = await import("@game/shared");
    const { db } = await import("../../apps/server/src/db/client.ts");
    const { players } = await import("../../apps/server/src/db/schema.ts");
    const { eq } = await import("drizzle-orm");
    const state = getPlayerState(sellerId)!;
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins - 1 })
      .where(eq(players.id, state.playerId))
      .run();
    const result = createMarketListing(sellerId, "iron_ore", 1, 2);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("listing fee");
    }
  });
});
