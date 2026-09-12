import {
  ITEM_MARKETPLACE_ABI,
  LAND_NFT_ABI,
  REALM_TOKEN_ABI,
  isAttachableMarketplaceListing,
  isPaidMarketplaceBuy,
  landFromChainIndexes,
  sameEthAddress,
  utf8ToBytes32,
  type LandNftBiome,
  type LandNftSize,
  type OnchainItemListingView,
} from "@game/shared";
import { Contract, JsonRpcProvider, Wallet, ZeroAddress } from "ethers";
import { creditcoinConfig } from "./config.js";

/**
 * True when the worker can mint REALM directly (deployer minter key).
 */
export function hasDirectRealmMinter(): boolean {
  const cfg = creditcoinConfig();
  return (
    cfg.mode !== "attestcoin" &&
    Boolean(cfg.realmToken && cfg.creditcoinWorkerKey)
  );
}

/**
 * Mints REALM to a player wallet using the deployer minter key.
 */
export async function mintRealmToWallet(
  wallet: string,
  amountWei: string,
): Promise<string> {
  const cfg = creditcoinConfig();
  if (!cfg.creditcoinWorkerKey || !cfg.realmToken) {
    throw new Error("REALM minter key or token address missing");
  }
  const provider = new JsonRpcProvider(cfg.rpcUrl, cfg.chainId, {
    staticNetwork: true,
  });
  const signer = new Wallet(cfg.creditcoinWorkerKey, provider);
  const token = new Contract(cfg.realmToken, REALM_TOKEN_ABI, signer);
  const tx = await token.mint(wallet, amountWei);
  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

function marketContract() {
  const cfg = creditcoinConfig();
  if (!cfg.marketplace) return null;
  const provider = new JsonRpcProvider(cfg.rpcUrl, cfg.chainId, {
    staticNetwork: true,
  });
  return new Contract(cfg.marketplace, ITEM_MARKETPLACE_ABI, provider);
}

/**
 * Reads ItemMarketplace.listings(id), or null when missing / RPC failed.
 *
 * Args:
 *   onchainListingId: Numeric listing id as a decimal string.
 *
 * Returns:
 *   Seller, gameListingId bytes32, and active flag.
 */
export async function readOnchainItemListing(
  onchainListingId: string,
): Promise<OnchainItemListingView | null> {
  const market = marketContract();
  if (!market) return null;
  try {
    const row = await market.listings(BigInt(onchainListingId));
    const seller = String(row.seller ?? row[0] ?? "");
    const gameListingId = String(row.gameListingId ?? row[4] ?? "");
    const active = Boolean(row.active ?? row[5]);
    if (!seller || seller === ZeroAddress) return null;
    return { seller, gameListingId, active };
  } catch {
    return null;
  }
}

/**
 * Looks up ItemMarketplace.listingIdByGameId for an off-chain row id.
 *
 * Args:
 *   gameListingId: Nanoid stored as UTF-8 bytes32 on chain.
 *
 * Returns:
 *   Decimal listing id, or null when missing / RPC failed.
 */
export async function readOnchainListingIdByGameId(
  gameListingId: string,
): Promise<string | null> {
  const market = marketContract();
  if (!market) return null;
  try {
    const id = await market.listingIdByGameId(utf8ToBytes32(gameListingId));
    const n = BigInt(id ?? 0);
    if (n === 0n) return null;
    return n.toString();
  } catch {
    return null;
  }
}

/**
 * Buyer from the latest ItemSold for this listing, or null if none (listed / cancelled).
 *
 * Args:
 *   onchainListingId: Numeric listing id as a decimal string.
 *
 * Returns:
 *   Buyer address, or null.
 */
export async function readOnchainItemSoldBuyer(
  onchainListingId: string,
): Promise<string | null> {
  const market = marketContract();
  if (!market) return null;
  try {
    const listingId = BigInt(onchainListingId);
    const filter = market.filters.ItemSold(listingId);
    const logs = await market.queryFilter(filter);
    const last = logs[logs.length - 1];
    if (!last) return null;
    const args = "args" in last ? last.args : undefined;
    const buyer = args
      ? String(args.buyer ?? args[1] ?? "")
      : "";
    if (!buyer || buyer === ZeroAddress) return null;
    return buyer;
  } catch {
    return null;
  }
}

/**
 * True when this wallet paid for this off-chain listing on-chain.
 *
 * Args:
 *   onchainListingId: Marketplace listing id.
 *   gameListingId: Off-chain row id (nanoid).
 *   buyerWallet: Linked player wallet.
 *
 * Returns:
 *   True only after a matching ItemSold.
 */
export async function verifyOnchainItemPurchase(
  onchainListingId: string,
  gameListingId: string,
  buyerWallet: string,
): Promise<boolean> {
  const listing = await readOnchainItemListing(onchainListingId);
  const soldBuyer = await readOnchainItemSoldBuyer(onchainListingId);
  return isPaidMarketplaceBuy({
    listing,
    soldBuyer,
    expectedGameListingId: gameListingId,
    buyerWallet,
  });
}

/**
 * True when this wallet's active on-chain listing matches the off-chain row.
 *
 * Args:
 *   onchainListingId: Marketplace listing id the seller just created.
 *   gameListingId: Off-chain row id (nanoid).
 *   sellerWallet: Linked seller wallet.
 *
 * Returns:
 *   True when attachOnchainListing may store the id.
 */
export async function verifyOnchainItemAttach(
  onchainListingId: string,
  gameListingId: string,
  sellerWallet: string,
): Promise<boolean> {
  const listing = await readOnchainItemListing(onchainListingId);
  return isAttachableMarketplaceListing({
    listing,
    expectedGameListingId: gameListingId,
    sellerWallet,
  });
}

/**
 * ownerOf + getLand for a LandNFT token, or null when missing / not owned.
 *
 * Args:
 *   tokenId: Decimal token id from the mint tx.
 *
 * Returns:
 *   Owner wallet plus catalog biome/size, or null.
 */
export async function readOnchainLand(
  tokenId: string,
): Promise<{
  owner: string;
  biome: LandNftBiome;
  size: LandNftSize;
} | null> {
  const cfg = creditcoinConfig();
  if (!cfg.landNft) return null;
  try {
    const provider = new JsonRpcProvider(cfg.rpcUrl, cfg.chainId, {
      staticNetwork: true,
    });
    const nft = new Contract(cfg.landNft, LAND_NFT_ABI, provider);
    const idNum = BigInt(tokenId);
    const owner = String(await nft.ownerOf(idNum));
    if (!owner || owner === ZeroAddress) return null;
    const land = await nft.getLand(idNum);
    const mapped = landFromChainIndexes(
      Number(land.biome ?? land[0]),
      Number(land.size ?? land[1]),
    );
    if (!mapped) return null;
    return { owner, biome: mapped.biome, size: mapped.size };
  } catch {
    return null;
  }
}

/**
 * True when the linked wallet currently owns this LandNFT token.
 *
 * Args:
 *   tokenId: Decimal token id.
 *   wallet: Linked player wallet.
 *
 * Returns:
 *   True when ownerOf matches.
 */
export async function verifyOnchainLandOwner(
  tokenId: string,
  wallet: string,
): Promise<boolean> {
  const land = await readOnchainLand(tokenId);
  return Boolean(land && sameEthAddress(land.owner, wallet));
}
