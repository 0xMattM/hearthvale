import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  REALM_TOKEN,
  realmToWei,
  walletNeverGatesCombat,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { Wallet } from "ethers";

process.env.GAME_CREDITCOIN_MODE = "local_dev";

const dbFile = path.join(
  os.tmpdir(),
  `game-ctc-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);
process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");
const {
  createWalletLinkChallenge,
  linkWalletWithSignature,
} = await import("../../apps/server/src/game/creditcoin/wallet-link.ts");
const { requestCoinSwap, localRealmWei, refundCoinSwap } = await import(
  "../../apps/server/src/game/creditcoin/coin-swap.ts"
);
const { mintLocalLand } = await import(
  "../../apps/server/src/game/creditcoin/local-lands.ts"
);
const {
  buyTokenItemListing,
  createTokenItemListing,
} = await import("../../apps/server/src/game/creditcoin/token-market.ts");

function snap(userId: string) {
  const s = getPlayerState(userId)!;
  return {
    health: s.health,
    maxHealth: s.maxHealth,
    damage: s.damage,
    defense: s.defense,
    energy: s.energy,
    maxEnergy: s.maxEnergy,
  };
}

describe("Creditcoin REALM economy", () => {
  let sellerId = "";
  let buyerId = "";
  let sellerPlayerId = "";
  let buyerPlayerId = "";

  beforeAll(async () => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const a = registerUser(`ctc_s_${stamp}`, "password123");
    const b = registerUser(`ctc_b_${stamp}`, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    sellerId = userIdFromToken(a.token)!;
    buyerId = userIdFromToken(b.token)!;
    sellerPlayerId = getPlayerState(sellerId)!.playerId;
    buyerPlayerId = getPlayerState(buyerId)!.playerId;

    db.update(players)
      .set({ softCurrency: 200 })
      .where(eq(players.userId, sellerId))
      .run();
    db.update(players)
      .set({ softCurrency: 200 })
      .where(eq(players.userId, buyerId))
      .run();

    const sellerWallet = Wallet.createRandom();
    const sellerCh = createWalletLinkChallenge(sellerId);
    expect(sellerCh.ok).toBe(true);
    if (!sellerCh.ok) throw new Error("challenge");
    const sellerSig = await sellerWallet.signMessage(sellerCh.message);
    expect(
      linkWalletWithSignature(
        sellerId,
        sellerWallet.address,
        sellerSig,
        sellerCh.message,
      ).ok,
    ).toBe(true);

    const buyerWallet = Wallet.createRandom();
    const buyerCh = createWalletLinkChallenge(buyerId);
    expect(buyerCh.ok).toBe(true);
    if (!buyerCh.ok) throw new Error("challenge");
    const buyerSig = await buyerWallet.signMessage(buyerCh.message);
    expect(
      linkWalletWithSignature(
        buyerId,
        buyerWallet.address,
        buyerSig,
        buyerCh.message,
      ).ok,
    ).toBe(true);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("swaps coins for REALM without changing combat (happy)", () => {
    const before = snap(sellerId);
    const coins = getPlayerState(sellerId)!.softCurrency;
    const swap = requestCoinSwap(sellerId, 50);
    expect(swap.ok).toBe(true);
    expect(swap.swap?.status).toBe("minted");
    expect(localRealmWei(sellerPlayerId)).toBe(realmToWei(5));
    expect(getPlayerState(sellerId)!.softCurrency).toBe(coins - 50);
    expect(walletNeverGatesCombat(before, snap(sellerId))).toBe(true);
    expect(getPlayerState(sellerId)!.chain?.attestcoin.mode).toBe("local_dev");
  });

  it("rejects a non-multiple coin swap (edge)", () => {
    const bad = requestCoinSwap(sellerId, 5);
    expect(bad.ok).toBe(false);
    expect(bad.error).toBe(ACTION_ERROR.coinSwapBadAmount);
  });

  it("mints a land NFT with REALM and trades an item (happy)", async () => {
    const combat = snap(sellerId);
    const land = mintLocalLand(sellerId, "forest", "small");
    expect(land.ok).toBe(true);
    expect(localRealmWei(sellerPlayerId)).toBe("0");
    expect(getPlayerState(sellerId)!.chain?.lands.length).toBe(1);

    addItem(sellerPlayerId, "wheat", 3);
    const listed = createTokenItemListing(sellerId, "wheat", 3, 1);
    expect(listed.ok).toBe(true);

    const buyerSwap = requestCoinSwap(buyerId, 10);
    expect(buyerSwap.ok).toBe(true);
    const buy = await buyTokenItemListing(buyerId, listed.listing!.id);
    expect(buy.ok).toBe(true);
    expect(localRealmWei(buyerPlayerId)).toBe("0");
    expect(localRealmWei(sellerPlayerId)).toBe(realmToWei(1));
    expect(walletNeverGatesCombat(combat, snap(sellerId))).toBe(true);
  });

  it("rejects a swap without a linked wallet (failure)", () => {
    const stamp = Date.now().toString(36);
    const c = registerUser(`ctc_n_${stamp}`, "password123");
    expect(c.ok).toBe(true);
    if (!c.ok) throw new Error("register");
    const uid = userIdFromToken(c.token)!;
    db.update(players)
      .set({ softCurrency: 50 })
      .where(eq(players.userId, uid))
      .run();
    const none = requestCoinSwap(uid, 10);
    expect(none.ok).toBe(false);
    expect(none.error).toBe(ACTION_ERROR.walletNeedLink);
    void REALM_TOKEN.symbol;
  });

  it("refuses server land mint when on-chain contracts are set", () => {
    const prevRealm = process.env.CREDITCOIN_REALM_TOKEN;
    const prevLand = process.env.CREDITCOIN_LAND_NFT;
    const prevMarket = process.env.CREDITCOIN_MARKETPLACE;
    process.env.CREDITCOIN_REALM_TOKEN =
      "0x1111111111111111111111111111111111111111";
    process.env.CREDITCOIN_LAND_NFT =
      "0x2222222222222222222222222222222222222222";
    process.env.CREDITCOIN_MARKETPLACE =
      "0x3333333333333333333333333333333333333333";
    try {
      const land = mintLocalLand(sellerId, "mountain", "small");
      expect(land.ok).toBe(false);
      expect(land.error).toBe(ACTION_ERROR.landMintOnchain);
    } finally {
      if (prevRealm === undefined) delete process.env.CREDITCOIN_REALM_TOKEN;
      else process.env.CREDITCOIN_REALM_TOKEN = prevRealm;
      if (prevLand === undefined) delete process.env.CREDITCOIN_LAND_NFT;
      else process.env.CREDITCOIN_LAND_NFT = prevLand;
      if (prevMarket === undefined) delete process.env.CREDITCOIN_MARKETPLACE;
      else process.env.CREDITCOIN_MARKETPLACE = prevMarket;
    }
  });

  it("queues a pending swap when a minter key is configured", () => {
    const prevToken = process.env.CREDITCOIN_REALM_TOKEN;
    const prevKey = process.env.CREDITCOIN_WORKER_KEY;
    process.env.CREDITCOIN_REALM_TOKEN =
      "0x1111111111111111111111111111111111111111";
    process.env.CREDITCOIN_WORKER_KEY = Wallet.createRandom().privateKey;
    try {
      const coins = getPlayerState(sellerId)!.softCurrency;
      const swap = requestCoinSwap(sellerId, 10);
      expect(swap.ok).toBe(true);
      expect(swap.swap?.status).toBe("pending");
      expect(getPlayerState(sellerId)!.softCurrency).toBe(coins - 10);
      expect(refundCoinSwap(swap.swap!.id)).toBe(true);
      expect(getPlayerState(sellerId)!.softCurrency).toBe(coins);
      expect(refundCoinSwap(swap.swap!.id)).toBe(false);
    } finally {
      if (prevToken === undefined) delete process.env.CREDITCOIN_REALM_TOKEN;
      else process.env.CREDITCOIN_REALM_TOKEN = prevToken;
      if (prevKey === undefined) delete process.env.CREDITCOIN_WORKER_KEY;
      else process.env.CREDITCOIN_WORKER_KEY = prevKey;
    }
  });
});
