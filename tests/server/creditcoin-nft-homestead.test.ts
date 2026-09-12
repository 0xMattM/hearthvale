import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, kitItemIdForStation } from "@game/shared";
import { eq } from "drizzle-orm";
import { Wallet } from "ethers";

process.env.GAME_CREDITCOIN_MODE = "local_dev";

const dbFile = path.join(
  os.tmpdir(),
  `game-ctc-home-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);
process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem } = await import("../../apps/server/src/game/player.ts");
const { players, lands } = await import("../../apps/server/src/db/schema.ts");
const {
  createWalletLinkChallenge,
  linkWalletWithSignature,
} = await import("../../apps/server/src/game/creditcoin/wallet-link.ts");
const { requestCoinSwap } = await import(
  "../../apps/server/src/game/creditcoin/coin-swap.ts"
);
const { confirmOnchainLand, mintLocalLand } = await import(
  "../../apps/server/src/game/creditcoin/local-lands.ts"
);
const { travelToOwnedLand } = await import(
  "../../apps/server/src/game/creditcoin/nft-homestead.ts"
);
const { travelToLandKind } = await import("../../apps/server/src/game/land.ts");
const { pickupLandStation, placeStationKit } = await import(
  "../../apps/server/src/game/actions/build.ts"
);

describe("Creditcoin NFT homestead", () => {
  let userId = "";
  let playerId = "";
  let otherId = "";

  beforeAll(async () => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const a = registerUser(`nft_h_${stamp}`, "password123");
    const b = registerUser(`nft_o_${stamp}`, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    userId = userIdFromToken(a.token)!;
    otherId = userIdFromToken(b.token)!;
    playerId = getPlayerState(userId)!.playerId;

    db.update(players)
      .set({ softCurrency: 80 })
      .where(eq(players.userId, userId))
      .run();

    const wallet = Wallet.createRandom();
    const ch = createWalletLinkChallenge(userId);
    expect(ch.ok).toBe(true);
    if (!ch.ok) throw new Error("challenge");
    const sig = await wallet.signMessage(ch.message);
    expect(
      linkWalletWithSignature(userId, wallet.address, sig, ch.message).ok,
    ).toBe(true);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("mints a playable homestead you can travel to (happy)", () => {
    expect(requestCoinSwap(userId, 50).ok).toBe(true);
    const minted = mintLocalLand(userId, "forest", "small");
    expect(minted.ok).toBe(true);
    expect(minted.land?.landId).toBeTruthy();
    const starter = getPlayerState(userId)!;
    expect(starter.nftTokenId).toBeNull();
    expect(starter.buildings.some((b) => b.type === "tree_stump")).toBe(false);
    expect(starter.buildings.some((b) => b.type === "ore_node")).toBe(false);
    expect(travelToOwnedLand(userId, minted.land!.landId!).ok).toBe(true);
    const onNft = getPlayerState(userId)!;
    expect(onNft.landKind).toBe("player_land");
    expect(onNft.nftTokenId).toBe(minted.land!.tokenId);
    expect(onNft.nftLandSize).toBe("small");
    expect(onNft.landId).toBe(minted.land!.landId);
    expect(onNft.chain?.lands[0]?.landId).toBe(minted.land!.landId);
    const trees = onNft.buildings.filter((b) => b.type === "tree_stump");
    expect(trees.length).toBeGreaterThanOrEqual(4);
    expect(onNft.buildings.some((b) => b.type === "ore_node")).toBe(false);
  });

  it("refuses pickup of biome trees that came with the plot (happy)", () => {
    const onNft = getPlayerState(userId)!;
    expect(onNft.nftTokenId).toBeTruthy();
    const tree = onNft.buildings.find(
      (b) => b.type === "tree_stump" && b.slotIndex >= 800,
    );
    expect(tree).toBeTruthy();
    const treeCount = onNft.buildings.filter((b) => b.type === "tree_stump")
      .length;
    const pickup = pickupLandStation(userId, tree!.id);
    expect(pickup.ok).toBe(false);
    if (!pickup.ok) expect(pickup.error).toBe(ACTION_ERROR.pickupLandStock);
    const after = getPlayerState(userId)!;
    expect(after.buildings.some((b) => b.id === tree!.id)).toBe(true);
    expect(after.inventory.some((i) => i.itemId === "tree_stump_kit")).toBe(
      false,
    );
    expect(
      after.buildings.filter((b) => b.type === "tree_stump").length,
    ).toBe(treeCount);
  });

  it("still lets you pick up a station kit you placed (edge)", () => {
    const onNft = getPlayerState(userId)!;
    const kitId = kitItemIdForStation("kitchen");
    addItem(onNft.playerId, kitId, 1);
    const kitRow = getPlayerState(userId)!.inventory.find(
      (i) => i.itemId === kitId,
    )!;
    expect(placeStationKit(userId, kitRow.id, 1, 1).ok).toBe(true);
    const kitchen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    expect(kitchen.slotIndex).toBeLessThan(800);
    const pickup = pickupLandStation(userId, kitchen.id);
    expect(pickup.ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.some((i) => i.itemId === kitId),
    ).toBe(true);
  });

  it("lets you return to the free starter yard (edge)", () => {
    const home = travelToLandKind(userId, "player_land");
    expect(home.ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.nftTokenId).toBeNull();
    expect(state.nftLandSize).toBeNull();
    expect(state.buildings.some((b) => b.type === "tree_stump")).toBe(false);
    const nftRow = db
      .select()
      .from(lands)
      .where(eq(lands.playerId, playerId))
      .all()
      .find((row) => row.nftTokenId);
    expect(nftRow).toBeTruthy();
    expect(state.landId).not.toBe(nftRow!.id);
    expect(travelToOwnedLand(userId, nftRow!.nftTokenId ?? "").ok).toBe(true);
    expect(getPlayerState(userId)!.nftTokenId).toBe(nftRow!.nftTokenId);
  });

  it("refuses travel to someone else's plot (failure)", async () => {
    const nftRow = db
      .select()
      .from(lands)
      .where(eq(lands.playerId, playerId))
      .all()
      .find((row) => row.nftTokenId);
    expect(nftRow).toBeTruthy();
    const stolen = travelToOwnedLand(otherId, nftRow!.id);
    expect(stolen.ok).toBe(false);
    expect(stolen.ok === false && stolen.error).toBe(ACTION_ERROR.landNotOwned);
    const missing = await confirmOnchainLand(userId, {
      biome: "bog",
      size: "small",
      tokenId: "99",
    });
    expect(missing.ok).toBe(false);
  });

  it("refuses confirm without contracts even with a valid biome (SEC-2)", async () => {
    const res = await confirmOnchainLand(userId, {
      biome: "forest",
      size: "small",
      tokenId: "1",
      txHash: "0xdeadbeef",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe(ACTION_ERROR.landMintOnchain);
  });
});
