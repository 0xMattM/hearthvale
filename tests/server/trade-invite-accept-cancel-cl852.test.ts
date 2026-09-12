import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl852-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
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
const {
  arePlayersNearbyForTrade,
  TRADE_PING_RANGE,
} = await import("../../apps/server/src/game/tradeInvite.ts");
const {
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/**
 * Soft invite ping fires only when nearby — mirrors `/api/trades` gate.
 */
function wouldPushTradeInvite(fromUserId: string, toUserId: string): boolean {
  return arePlayersNearbyForTrade(fromUserId, toUserId);
}

/**
 * CL85.2 — Trade invite accept + cancel still green.
 * Choice: assert-only nearby accept/cancel + far/own refuse (parity with CL76.2; no trade invent).
 */
describe("CityLands CL85.2 trade invite accept + cancel still green", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let landId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `cl852a_${stamp}`;
    bobName = `cl852b_${stamp}`;
    const a = registerUser(aliceName, "password123");
    const b = registerUser(bobName, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    aliceId = userIdFromToken(a.token)!;
    bobId = userIdFromToken(b.token)!;
    // Reason: co-locate on shared city hub for nearby invite fidelity.
    expect(travelToLandKind(aliceId, "city").ok).toBe(true);
    expect(travelToLandKind(bobId, "city").ok).toBe(true);
    landId = getPlayerState(aliceId)!.landId;
    expect(getPlayerState(bobId)!.landId).toBe(landId);
  });

  afterEach(() => {
    resetPresence();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  function standNearby(): void {
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: bobId,
      username: bobName,
      landId,
      x: TRADE_PING_RANGE / 2,
      z: 0,
    });
  }

  it("nearby invite → accept transfers goods (happy)", () => {
    standNearby();
    expect(wouldPushTradeInvite(aliceId, bobId)).toBe(true);

    const alice = db
      .select()
      .from(players)
      .where(eq(players.userId, aliceId))
      .get()!;
    const bob = db
      .select()
      .from(players)
      .where(eq(players.userId, bobId))
      .get()!;
    addItem(alice.id, "wheat", 2);
    addItem(bob.id, "iron_ore", 1);

    const created = createTradeOffer(
      aliceId,
      bobName,
      [{ itemId: "wheat", qty: 2 }],
      [{ itemId: "iron_ore", qty: 1 }],
      0,
      0,
    );
    expect(created.ok).toBe(true);
    if (!created.ok || !created.tradeId) return;

    const pending = listPendingTrades(bobId);
    expect(pending.some((t) => t.id === created.tradeId)).toBe(true);

    const accepted = acceptTrade(bobId, created.tradeId);
    expect(accepted.ok).toBe(true);

    const bobAfter = getPlayerState(bobId)!;
    const aliceAfter = getPlayerState(aliceId)!;
    expect(
      bobAfter.inventory.find((i) => i.itemId === "wheat")?.qty ?? 0,
    ).toBeGreaterThanOrEqual(2);
    expect(
      aliceAfter.inventory.find((i) => i.itemId === "iron_ore")?.qty ?? 0,
    ).toBeGreaterThanOrEqual(1);
    expect(listPendingTrades(bobId).some((t) => t.id === created.tradeId)).toBe(
      false,
    );
  });

  it("nearby invite → clear cancel restores escrow (happy)", () => {
    standNearby();
    expect(wouldPushTradeInvite(aliceId, bobId)).toBe(true);

    const alice = db
      .select()
      .from(players)
      .where(eq(players.userId, aliceId))
      .get()!;
    addItem(alice.id, "wheat", 1);
    const wheatBefore =
      getPlayerState(aliceId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0;

    const created = createTradeOffer(
      aliceId,
      bobName,
      [{ itemId: "wheat", qty: 1 }],
      [],
      0,
      0,
    );
    expect(created.ok).toBe(true);
    if (!created.ok || !created.tradeId) return;

    const mid =
      getPlayerState(aliceId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0;
    expect(mid).toBe(wheatBefore - 1);

    const cancelled = rejectTrade(aliceId, created.tradeId);
    expect(cancelled.ok).toBe(true);

    const wheatAfter =
      getPlayerState(aliceId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0;
    expect(wheatAfter).toBe(wheatBefore);
    expect(
      listPendingTrades(aliceId).some((t) => t.id === created.tradeId),
    ).toBe(false);
  });

  it("far refuse holds invite ping; offerer cannot accept (failure)", () => {
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId,
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: bobId,
      username: bobName,
      landId,
      x: TRADE_PING_RANGE + WORLD.GRID,
      z: 0,
    });
    expect(wouldPushTradeInvite(aliceId, bobId)).toBe(false);
    expect(arePlayersNearbyForTrade(aliceId, bobId)).toBe(false);

    const alice = db
      .select()
      .from(players)
      .where(eq(players.userId, aliceId))
      .get()!;
    addItem(alice.id, "wheat", 1);
    const created = createTradeOffer(
      aliceId,
      bobName,
      [{ itemId: "wheat", qty: 1 }],
      [],
      0,
      0,
    );
    expect(created.ok).toBe(true);
    if (!created.ok || !created.tradeId) return;

    // Reason: escrow trade may still exist; soft invite ping stays refused when far.
    const offererAccept = acceptTrade(aliceId, created.tradeId);
    expect(offererAccept.ok).toBe(false);
    if (!offererAccept.ok) {
      expect(offererAccept.error).toBe(ACTION_ERROR.tradeOnlyRecipient);
    }

    expect(rejectTrade(aliceId, created.tradeId).ok).toBe(true);
  });

  it("refuses trade invite to self (own refuse)", () => {
    standNearby();
    const alice = db
      .select()
      .from(players)
      .where(eq(players.userId, aliceId))
      .get()!;
    addItem(alice.id, "wheat", 1);

    const selfOffer = createTradeOffer(
      aliceId,
      aliceName,
      [{ itemId: "wheat", qty: 1 }],
      [],
      0,
      0,
    );
    expect(selfOffer.ok).toBe(false);
    if (!selfOffer.ok) {
      expect(selfOffer.error).toBe(ACTION_ERROR.tradeSelf);
    }
  });
});
