import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, LAND_DEED } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-deed-mint-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const {
  claimLandDeed,
  listDeedMarket,
  listDeedForSale,
  mintDeedStub,
  unlistDeed,
} = await import("../../apps/server/src/game/deeds.ts");
const { getPlayerState } = await import("../../apps/server/src/game/player.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

describe("deed mint/list stub F15.3", () => {
  let userId = "";
  let deedId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`mint_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    const playerId = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!.id;
    db.update(players)
      .set({ softCurrency: LAND_DEED.claimCostCoins + 50 })
      .where(eq(players.id, playerId))
      .run();
    const claim = claimLandDeed(userId);
    expect(claim.ok).toBe(true);
    deedId = claim.deedId!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("mints then lists on the mock board (happy)", () => {
    const mint = mintDeedStub(userId, deedId);
    expect(mint.ok).toBe(true);
    if (!mint.ok) return;
    expect(mint.mintTxStub?.startsWith("0xmint")).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.deeds[0]!.mintTxStub).toBe(mint.mintTxStub);
    expect(state.damage).toBe(10);

    const list = listDeedForSale(userId, deedId, 40);
    expect(list.ok).toBe(true);
    const market = listDeedMarket();
    expect(market.some((m) => m.id === deedId && m.listPriceCoins === 40)).toBe(
      true,
    );
  });

  it("unlists a deed (edge)", () => {
    expect(unlistDeed(userId, deedId).ok).toBe(true);
    expect(listDeedMarket().some((m) => m.id === deedId)).toBe(false);
    expect(getPlayerState(userId)!.deeds[0]!.status).toBe("held");
  });

  it("rejects list before mint and bad prices (failure)", () => {
    const stamp = Date.now().toString(36);
    const reg = registerUser(`fail_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    const uid = userIdFromToken(reg.token)!;
    const pid = db.select().from(players).where(eq(players.userId, uid)).get()!
      .id;
    db.update(players)
      .set({ softCurrency: LAND_DEED.claimCostCoins })
      .where(eq(players.id, pid))
      .run();
    const claim = claimLandDeed(uid);
    expect(claim.ok).toBe(true);
    const id = claim.deedId!;
    const early = listDeedForSale(uid, id, 40);
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toBe(ACTION_ERROR.deedNeedMint);
    expect(mintDeedStub(uid, id).ok).toBe(true);
    const bad = listDeedForSale(uid, id, 2);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBe(ACTION_ERROR.deedBadPrice);
  });
});
