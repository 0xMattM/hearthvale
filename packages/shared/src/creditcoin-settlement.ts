import {
  LAND_NFT_BIOMES,
  LAND_NFT_SIZES,
  type LandNftBiome,
  type LandNftSize,
} from "./creditcoin.js";
import { utf8ToBytes32 } from "./creditcoin-calldata.js";

/** On-chain ItemMarketplace.listings() row the server needs for settlement. */
export interface OnchainItemListingView {
  seller: string;
  gameListingId: string;
  active: boolean;
}

/**
 * True when two hex addresses refer to the same account.
 *
 * Args:
 *   a: First address (checksum or lower).
 *   b: Second address.
 *
 * Returns:
 *   True only when both are 20-byte hex and match case-insensitively.
 */
export function sameEthAddress(a: string, b: string): boolean {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(left) && left === right;
}

/**
 * True when a chain bytes32 is the UTF-8 padded encoding of `utf8`.
 *
 * Args:
 *   chainBytes32: `0x` + 32-byte hex from the ABI.
 *   utf8: Off-chain listing id (nanoid).
 *
 * Returns:
 *   True when the encodings match.
 */
export function bytes32MatchesUtf8(chainBytes32: string, utf8: string): boolean {
  try {
    const chain = chainBytes32.replace(/^0x/i, "").toLowerCase().padStart(64, "0");
    const expected = utf8ToBytes32(utf8).slice(2);
    return chain === expected;
  } catch {
    return false;
  }
}

/**
 * True when this wallet paid for this off-chain listing (ItemSold, not cancel).
 *
 * Args:
 *   input.listing: Marketplace row, or null if RPC missed.
 *   input.soldBuyer: Buyer from ItemSold, or null if none (still listed / cancelled).
 *   input.expectedGameListingId: Off-chain listing id.
 *   input.buyerWallet: Authenticated player's linked wallet.
 *
 * Returns:
 *   True only when the listing is inactive because this wallet bought it.
 */
export function isPaidMarketplaceBuy(input: {
  listing: OnchainItemListingView | null;
  soldBuyer: string | null;
  expectedGameListingId: string;
  buyerWallet: string;
}): boolean {
  if (!input.listing || input.listing.active) return false;
  if (!input.soldBuyer) return false;
  if (!sameEthAddress(input.soldBuyer, input.buyerWallet)) return false;
  return bytes32MatchesUtf8(
    input.listing.gameListingId,
    input.expectedGameListingId,
  );
}

/**
 * True when this wallet listed this off-chain id and the listing is still active.
 *
 * Args:
 *   input.listing: Marketplace row, or null if RPC missed.
 *   input.expectedGameListingId: Off-chain listing id.
 *   input.sellerWallet: Authenticated seller's linked wallet.
 *
 * Returns:
 *   True when attachOnchainListing may record the chain id.
 */
export function isAttachableMarketplaceListing(input: {
  listing: OnchainItemListingView | null;
  expectedGameListingId: string;
  sellerWallet: string;
}): boolean {
  if (!input.listing || !input.listing.active) return false;
  if (!sameEthAddress(input.listing.seller, input.sellerWallet)) return false;
  return bytes32MatchesUtf8(
    input.listing.gameListingId,
    input.expectedGameListingId,
  );
}

/**
 * Maps LandNFT biome/size indexes to catalog ids.
 *
 * Args:
 *   biome: uint8 from getLand.
 *   size: uint8 from getLand.
 *
 * Returns:
 *   Catalog pair, or null when indexes are out of range.
 */
export function landFromChainIndexes(
  biome: number,
  size: number,
): { biome: LandNftBiome; size: LandNftSize } | null {
  const nextBiome = LAND_NFT_BIOMES[biome];
  const nextSize = LAND_NFT_SIZES[size];
  if (!nextBiome || !nextSize) return null;
  return { biome: nextBiome, size: nextSize };
}
