import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { Wallet } from "ethers";

process.env.GAME_CREDITCOIN_MODE = "local_dev";

const dbFile = path.join(
  os.tmpdir(),
  `game-nft-biome-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);
process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState } = await import("../../apps/server/src/game/player.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");
const {
  createWalletLinkChallenge,
  linkWalletWithSignature,
} = await import("../../apps/server/src/game/creditcoin/wallet-link.ts");
const { requestCoinSwap } = await import(
  "../../apps/server/src/game/creditcoin/coin-swap.ts"
);
const { mintLocalLand } = await import(
  "../../apps/server/src/game/creditcoin/local-lands.ts"
);
const { travelToOwnedLand } = await import(
  "../../apps/server/src/game/creditcoin/nft-homestead.ts"
);
const { travelToLandKind } = await import("../../apps/server/src/game/land.ts");
const { pickupLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);

describe("NFT homestead biome gather nodes", () => {
  let userId = "";

  beforeAll(async () => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const a = registerUser(`nft_bio_${stamp}`, "password123");
    expect(a.ok).toBe(true);
    if (!a.ok) throw new Error("register failed");
    userId = userIdFromToken(a.token)!;
    db.update(players)
      .set({ softCurrency: 200 })
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

  it("seeds mountain ore rocks you can keep after pickup of one (happy)", () => {
    expect(requestCoinSwap(userId, 50).ok).toBe(true);
    const minted = mintLocalLand(userId, "mountain", "small");
    expect(minted.ok).toBe(true);
    expect(travelToOwnedLand(userId, minted.land!.landId!).ok).toBe(true);
    const onNft = getPlayerState(userId)!;
    const ores = onNft.buildings.filter((b) => b.type === "ore_node");
    expect(ores.length).toBeGreaterThanOrEqual(4);
    expect(ores.some((b) => b.cropId === "iron")).toBe(true);
    expect(onNft.buildings.some((b) => b.type === "tree_stump")).toBe(false);

    const lifted = pickupLandStation(userId, ores[0]!.id);
    expect(lifted.ok).toBe(true);
    const afterPickup = getPlayerState(userId)!;
    expect(
      afterPickup.buildings.filter((b) => b.type === "ore_node").length,
    ).toBe(ores.length - 1);
  });

  it("seeds a fertile crop patch (edge)", () => {
    expect(requestCoinSwap(userId, 50).ok).toBe(true);
    const minted = mintLocalLand(userId, "fertile", "small");
    expect(minted.ok).toBe(true);
    expect(travelToOwnedLand(userId, minted.land!.landId!).ok).toBe(true);
    const onNft = getPlayerState(userId)!;
    const plots = onNft.buildings.filter((b) => b.type === "crop_plot");
    expect(plots.length).toBeGreaterThanOrEqual(4);
    expect(onNft.buildings.some((b) => b.type === "ore_node")).toBe(false);
    expect(onNft.buildings.some((b) => b.type === "tree_stump")).toBe(false);
  });

  it("does not seed biome nodes on the free starter yard (failure)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    expect(home.nftTokenId).toBeNull();
    expect(home.buildings.some((b) => b.type === "tree_stump")).toBe(false);
    expect(home.buildings.some((b) => b.type === "ore_node")).toBe(false);
    expect(home.buildings.some((b) => b.type === "crop_plot")).toBe(false);
  });
});
