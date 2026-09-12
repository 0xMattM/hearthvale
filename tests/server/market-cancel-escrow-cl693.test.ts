import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, MARKET } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl693-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
  cancelMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

/**
 * CL69.3 — Market cancel returns escrow still green.
 * Choice: assert-only list → cancel restore (no market invent).
 */
describe("CityLands CL69.3 Market cancel returns escrow still green", () => {
  let sellerId = "";
  let otherId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const s = registerUser(`cl693s_${stamp}`, "password123");
    const o = registerUser(`cl693o_${stamp}`, "password123");
    expect(s.ok && o.ok).toBe(true);
    if (!s.ok || !o.ok) throw new Error("register failed");
    sellerId = userIdFromToken(s.token)!;
    otherId = userIdFromToken(o.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("lists goods then cancel restores escrow to inventory (happy)", () => {
    expect(travelToLandKind(sellerId, "city").ok).toBe(true);
    const city = getPlayerState(sellerId)!;
    expect(city.buildings.some((b) => b.type === "market_board")).toBe(true);

    const pid = city.playerId;
    addItem(pid, "plank", 2);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 20 })
      .where(eq(players.id, pid))
      .run();

    const beforeQty =
      getPlayerState(sellerId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0;
    const coinsBefore = getPlayerState(sellerId)!.softCurrency;

    const listed = createMarketListing(sellerId, "plank", 1, 5);
    expect(listed.ok).toBe(true);
    const listingId = listed.listingId!;
    expect(
      getPlayerState(sellerId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0,
    ).toBe(beforeQty - 1);
    expect(getPlayerState(sellerId)!.softCurrency).toBe(
      coinsBefore - MARKET.listFeeCoins,
    );
    expect(
      listMarket(sellerId).some((l) => l.id === listingId && l.mine),
    ).toBe(true);

    const midQty =
      getPlayerState(sellerId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0;
    expect(cancelMarketListing(sellerId, listingId).ok).toBe(true);
    expect(listMarket(sellerId).some((l) => l.id === listingId)).toBe(false);
    expect(
      getPlayerState(sellerId)!.inventory.find((s) => s.itemId === "plank")
        ?.qty ?? 0,
    ).toBe(midQty + 1);
  });

  it("refuses cancel of another player's listing (failure)", () => {
    // Reason: prior happy path left seller on city — hop away then back.
    if (getPlayerState(sellerId)!.landKind === "city") {
      expect(travelToLandKind(sellerId, "player_land").ok).toBe(true);
    }
    expect(travelToLandKind(sellerId, "city").ok).toBe(true);
    const pid = getPlayerState(sellerId)!.playerId;
    addItem(pid, "cloth", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 5 })
      .where(eq(players.id, pid))
      .run();
    const listed = createMarketListing(sellerId, "cloth", 1, 4);
    expect(listed.ok).toBe(true);
    const listingId = listed.listingId!;

    expect(travelToLandKind(otherId, "city").ok).toBe(true);
    const stolen = cancelMarketListing(otherId, listingId);
    expect(stolen.ok).toBe(false);
    if (!stolen.ok) expect(stolen.error).toBe(ACTION_ERROR.marketNotYours);
    expect(
      listMarket(sellerId).some((l) => l.id === listingId && l.mine),
    ).toBe(true);

    expect(cancelMarketListing(sellerId, listingId).ok).toBe(true);
  });
});
