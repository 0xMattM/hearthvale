/**
 * ABI calldata helpers for Realm contracts (browser-safe, no ethers).
 * Selectors must stay in sync with contracts/*.sol.
 */

export const CREDITCOIN_SELECTORS = {
  approve: "0x095ea7b3",
  allowance: "0xdd62ed3e",
  mintLand: "0x475953bd",
  listItem: "0xf510c755",
  buyItem: "0xe7fb74c7",
  cancelListing: "0x305a67a8",
  listingIdByGameId: "0x59484304",
  transfer: "0xa9059cbb",
} as const;

/** Max uint256 — used for a one-time REALM approve. */
export const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

/**
 * Left-pads a non-negative integer to a 32-byte hex word (no 0x prefix).
 */
export function encodeUint256(value: bigint | number | string): string {
  const n = BigInt(value);
  if (n < 0n) throw new Error("negative uint256");
  return n.toString(16).padStart(64, "0");
}

/**
 * Left-pads an EVM address to a 32-byte hex word (no 0x prefix).
 */
export function encodeAddress(address: string): string {
  const hex = address.replace(/^0x/i, "").toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(hex)) throw new Error("bad address");
  return hex.padStart(64, "0");
}

/**
 * UTF-8 string as bytes32 (zero-padded). Nanoid listing ids fit.
 */
export function utf8ToBytes32(value: string): string {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length > 32) throw new Error("value too long for bytes32");
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return `0x${hex.padEnd(64, "0")}`;
}

/**
 * Strips 0x from a bytes32 hex string and pads to 64 chars.
 */
export function encodeBytes32(value: string): string {
  const hex = value.replace(/^0x/i, "").toLowerCase();
  if (hex.length > 64) throw new Error("bytes32 overflow");
  if (!/^[a-f0-9]*$/.test(hex)) throw new Error("bad bytes32");
  return hex.padEnd(64, "0");
}

/**
 * ERC-20 approve(spender, amount).
 */
export function encodeApprove(spender: string, amount: bigint | string): string {
  return `${CREDITCOIN_SELECTORS.approve}${encodeAddress(spender)}${encodeUint256(amount)}`;
}

/**
 * ERC-20 allowance(owner, spender).
 */
export function encodeAllowance(owner: string, spender: string): string {
  return `${CREDITCOIN_SELECTORS.allowance}${encodeAddress(owner)}${encodeAddress(spender)}`;
}

/**
 * LandNFT.mintLand(biome, size).
 */
export function encodeMintLand(biome: number, size: number): string {
  return `${CREDITCOIN_SELECTORS.mintLand}${encodeUint256(biome)}${encodeUint256(size)}`;
}

/**
 * ItemMarketplace.listItem(itemId, qty, priceRealm, gameListingId).
 */
export function encodeListItem(
  itemId: string,
  qty: number | bigint,
  priceRealmWei: string,
  gameListingId: string,
): string {
  return (
    CREDITCOIN_SELECTORS.listItem +
    encodeBytes32(itemId) +
    encodeUint256(qty) +
    encodeUint256(priceRealmWei) +
    encodeBytes32(gameListingId)
  );
}

/**
 * ItemMarketplace.buyItem(listingId).
 */
export function encodeBuyItem(listingId: string | number | bigint): string {
  return `${CREDITCOIN_SELECTORS.buyItem}${encodeUint256(listingId)}`;
}

/**
 * ItemMarketplace.cancelListing(listingId).
 */
export function encodeCancelListing(listingId: string | number | bigint): string {
  return `${CREDITCOIN_SELECTORS.cancelListing}${encodeUint256(listingId)}`;
}

/**
 * ItemMarketplace.listingIdByGameId(gameListingId).
 */
export function encodeListingIdByGameId(gameListingId: string): string {
  return `${CREDITCOIN_SELECTORS.listingIdByGameId}${encodeBytes32(gameListingId)}`;
}

/**
 * ERC-20 transfer(to, amount).
 */
export function encodeTransfer(to: string, amountWei: string): string {
  return `${CREDITCOIN_SELECTORS.transfer}${encodeAddress(to)}${encodeUint256(amountWei)}`;
}

/**
 * Parses an eth_call uint256 hex result.
 */
export function decodeUint256(result: string | null | undefined): bigint {
  if (!result || result === "0x") return 0n;
  return BigInt(result);
}
