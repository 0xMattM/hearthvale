import {
  CREDITCOIN_TESTNET,
  LAND_NFT_ABI,
  LAND_NFT_BIOMES,
  LAND_NFT_SIZES,
  REALM_TOKEN_ABI,
  mergeLandNfts,
  type CreditcoinSnapshotDto,
  type LandNftDto,
  type TokenListingDto,
  type TokenListingStatus,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { Contract, JsonRpcProvider, formatEther } from "ethers";
import { db } from "../../db/client.js";
import { players, tokenItemListings, users } from "../../db/schema.js";
import { creditcoinConfig } from "./config.js";
import { listCoinSwaps, localRealmWei } from "./coin-swap.js";
import { listLocalLands, recordOwnedLand } from "./local-lands.js";
import { reconcileEscrowedTokenListings } from "./listing-reconcile.js";

function usernameForPlayerId(playerId: string): string {
  const player = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!player) return "?";
  return (
    db.select().from(users).where(eq(users.id, player.userId)).get()?.username ??
    "?"
  );
}

function listingsForPlayer(playerId: string): TokenListingDto[] {
  return db
    .select()
    .from(tokenItemListings)
    .all()
    .filter((row) => row.status === "escrowed" || row.status === "listed")
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((row) => ({
      id: row.id,
      sellerUsername: usernameForPlayerId(row.sellerPlayerId),
      itemId: row.itemId,
      qty: row.qty,
      priceRealm: row.priceRealm,
      onchainListingId: row.onchainListingId ?? null,
      status: row.status as TokenListingStatus,
      mine: row.sellerPlayerId === playerId,
      createdAt: row.createdAt,
    }));
}

function localSnapshot(
  wallet: string | null,
  playerId: string | null,
): CreditcoinSnapshotDto {
  const cfg = creditcoinConfig();
  return {
    network: CREDITCOIN_TESTNET.name,
    chainId: cfg.chainId,
    walletAddress: wallet,
    nativeSymbol: CREDITCOIN_TESTNET.nativeCurrency.symbol,
    tctcBalance: "0",
    realmBalance: playerId ? localRealmWei(playerId) : "0",
    realmSymbol: "REALM",
    lands: playerId ? listLocalLands(playerId) : [],
    swaps: playerId ? listCoinSwaps(playerId) : [],
    tokenListings: playerId ? listingsForPlayer(playerId) : [],
    contractsConfigured: cfg.contractsConfigured,
    attestcoin: {
      sourceChain: "Ethereum Sepolia",
      sourceChainKey: CREDITCOIN_TESTNET.sepoliaChainKey,
      proofBuilderUrl: cfg.proofBuilderUrl,
      mode: cfg.mode,
    },
  };
}

async function readOnchainHoldings(wallet: string): Promise<{
  tctcBalance: string;
  realmBalance: string;
  lands: LandNftDto[];
}> {
  const cfg = creditcoinConfig();
  const provider = new JsonRpcProvider(cfg.rpcUrl, cfg.chainId, {
    staticNetwork: true,
  });
  const tctc = await provider.getBalance(wallet);
  let realmBalance = "0";
  const lands: LandNftDto[] = [];
  if (cfg.realmToken) {
    const token = new Contract(cfg.realmToken, REALM_TOKEN_ABI, provider);
    const bal = await token.balanceOf(wallet);
    realmBalance = bal.toString();
  }
  if (cfg.landNft) {
    const nft = new Contract(cfg.landNft, LAND_NFT_ABI, provider);
    const count = Number(await nft.balanceOf(wallet));
    for (let i = 0; i < Math.min(count, 32); i++) {
      const tokenId = await nft.tokenOfOwnerByIndex(wallet, i);
      const land = await nft.getLand(tokenId);
      const biome = Number(land.biome ?? land[0]);
      const size = Number(land.size ?? land[1]);
      const id = tokenId.toString();
      if (id === "0") continue;
      lands.push({
        tokenId: id,
        biome: LAND_NFT_BIOMES[biome] ?? String(biome),
        size: LAND_NFT_SIZES[size] ?? String(size),
      });
    }
  }
  return {
    tctcBalance: formatEther(tctc),
    realmBalance,
    lands,
  };
}

/**
 * Builds the Creditcoin overlay for a player. Never used for combat.
 */
export async function getCreditcoinSnapshot(
  userId: string,
): Promise<CreditcoinSnapshotDto> {
  const cfg = creditcoinConfig();
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  const wallet = user?.walletAddress ?? null;
  if (cfg.contractsConfigured) {
    try {
      await reconcileEscrowedTokenListings();
    } catch {
      // Reason: overlay still renders escrowed rows if Creditcoin RPC is down.
    }
  }
  const empty = localSnapshot(wallet, player?.id ?? null);
  if (!wallet || !cfg.contractsConfigured) return empty;
  try {
    const onchain = await readOnchainHoldings(wallet);
    const recorded = player
      ? onchain.lands.map((land) =>
          recordOwnedLand(player.id, {
            tokenId: land.tokenId,
            biome: String(land.biome),
            size: String(land.size),
          }),
        )
      : onchain.lands;
    const localLandsNow = player ? listLocalLands(player.id) : [];
    return {
      ...empty,
      tctcBalance: onchain.tctcBalance,
      realmBalance: onchain.realmBalance,
      lands: mergeLandNfts(recorded, localLandsNow),
    };
  } catch {
    const stale = snapshotCache.get(userId);
    if (!stale) return empty;
    return {
      ...empty,
      tctcBalance: stale.value.tctcBalance,
      realmBalance: stale.value.realmBalance,
      lands: mergeLandNfts(stale.value.lands, empty.lands),
    };
  }
}

const snapshotCache = new Map<
  string,
  { at: number; value: CreditcoinSnapshotDto }
>();
const SNAPSHOT_TTL_MS = 8_000;

/**
 * Sync wrapper used by getPlayerState (best-effort cached snapshot).
 */
export function getCreditcoinSnapshotSync(userId: string): CreditcoinSnapshotDto {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  const local = localSnapshot(user?.walletAddress ?? null, player?.id ?? null);
  const cfg = creditcoinConfig();
  if (!cfg.contractsConfigured) return local;

  const hit = snapshotCache.get(userId);
  if (hit && Date.now() - hit.at < SNAPSHOT_TTL_MS) {
    return {
      ...local,
      tctcBalance: hit.value.tctcBalance,
      realmBalance: hit.value.realmBalance,
      lands: mergeLandNfts(hit.value.lands, local.lands),
    };
  }
  void getCreditcoinSnapshot(userId).then((value) => {
    snapshotCache.set(userId, { at: Date.now(), value });
  });
  // Reason: cache miss used to return empty local lands and the B panel dropped the NFT.
  if (hit) {
    return {
      ...local,
      tctcBalance: hit.value.tctcBalance,
      realmBalance: hit.value.realmBalance,
      lands: mergeLandNfts(hit.value.lands, local.lands),
    };
  }
  return local;
}

/**
 * Drops a cached overlay so the next read sees ledger updates.
 */
export function invalidateCreditcoinSnapshot(userId: string): void {
  snapshotCache.delete(userId);
}
