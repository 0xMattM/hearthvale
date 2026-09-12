/**
 * EIP-155 chain id as a 0x-prefixed hex string (no leading zeros).
 *
 * Args:
 *   chainId: Positive integer EVM chain id.
 *
 * Returns:
 *   Hex string wallets expect in wallet_switchEthereumChain / eth_sendTransaction.
 */
export function evmChainIdHex(chainId: number): string {
  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error("chainId must be a positive integer");
  }
  return `0x${chainId.toString(16)}`;
}

/** Creditcoin Testnet (CC3). ChainList / docs: 102031 = 0x18e8f, not 0x18e6f. */
const CREDITCOIN_CHAIN_ID = 102031;

/**
 * Creditcoin Testnet + Attestcoin Protocol constants for the Realm economy.
 * Ownership / marketplace only — never combat power (F15.5).
 */
export const CREDITCOIN_TESTNET = {
  chainId: CREDITCOIN_CHAIN_ID,
  chainIdHex: evmChainIdHex(CREDITCOIN_CHAIN_ID),
  name: "Creditcoin Testnet",
  nativeCurrency: {
    name: "Test Creditcoin",
    symbol: "tCTC",
    decimals: 18,
  },
  rpcUrls: [
    "https://rpc.cc3-testnet.creditcoin.network",
    "https://creditcoin-testnet.drpc.org",
  ],
  blockExplorerUrls: ["https://creditcoin-testnet.blockscout.com"],
  /** Attestcoin proof builder (CC3 testnet). */
  proofBuilderUrl: "https://proof-gen-api.cc3-testnet.creditcoin.network/",
  dashboardUrl: "https://dashboard.cc3-testnet.creditcoin.network/",
  /** Source-chain key for Ethereum Sepolia on CC3 testnet (not the EVM chainId). */
  sepoliaChainKey: 1,
  sepoliaChainId: 11155111,
  blockProverPrecompile: "0x0000000000000000000000000000000000000FD2",
  chainInfoPrecompile: "0x0000000000000000000000000000000000000fd3",
} as const;

export const REALM_TOKEN = {
  name: "Realm",
  symbol: "REALM",
  decimals: 18,
  /** Soft coins burned per 1 REALM minted via Attestcoin. */
  coinsPerRealm: 10,
  minSwapCoins: 10,
  maxSwapCoins: 10_000,
} as const;

export const LAND_NFT_SIZES = ["small", "medium", "large"] as const;
export type LandNftSize = (typeof LAND_NFT_SIZES)[number];

export const LAND_NFT_BIOMES = ["forest", "mountain", "fertile"] as const;
export type LandNftBiome = (typeof LAND_NFT_BIOMES)[number];

export const LAND_NFT = {
  name: "Realm Land",
  symbol: "RLAND",
  sizes: LAND_NFT_SIZES,
  biomes: LAND_NFT_BIOMES,
  /** REALM whole-token prices (18 decimals applied at encode time). */
  priceRealm: {
    small: 5,
    medium: 15,
    large: 40,
  },
} as const;

export const TOKEN_MARKET = {
  minPriceRealm: 1,
  maxPriceRealm: 500,
  disclaimer:
    "List stackable goods for REALM. Items are escrowed in-game; settlement is on Creditcoin. Never combat power.",
} as const;

/** NFT land owners get 15% faster crop growth. Cosmetic bonus — never combat. */
export const NFT_LAND_BONUS = {
  cropGrowSpeedMultiplier: 0.85,
  label: "NFT Land: −15% grow time",
} as const;

export type CoinSwapStatus =
  | "pending"
  | "notarized"
  | "attested"
  | "minted"
  | "failed";

export type TokenListingStatus =
  | "escrowed"
  | "listed"
  | "sold"
  | "cancelled";

export interface CoinSwapDto {
  id: string;
  coinsBurned: number;
  realmAmount: string;
  nonce: string;
  status: CoinSwapStatus;
  sepoliaTxHash: string | null;
  creditcoinTxHash: string | null;
  createdAt: number;
}

export interface TokenListingDto {
  id: string;
  sellerUsername: string;
  itemId: string;
  qty: number;
  priceRealm: string;
  onchainListingId: string | null;
  status: TokenListingStatus;
  mine: boolean;
  createdAt: number;
}

export interface LandNftDto {
  tokenId: string;
  biome: LandNftBiome | string;
  size: LandNftSize | string;
  /** Playable homestead row (`lands.id`); null until the plot is provisioned. */
  landId?: string | null;
}

/**
 * Unions NFT rows by tokenId. Primary wins on conflict; empty primary keeps fallback.
 *
 * Args:
 *   primary: Preferred holdings (usually on-chain).
 *   fallback: Local ledger rows that must survive RPC gaps.
 *
 * Returns:
 *   Deduped lands, fallback first so a later primary row overwrites the same token.
 */
export function mergeLandNfts(
  primary: LandNftDto[],
  fallback: LandNftDto[],
): LandNftDto[] {
  const byId = new Map<string, LandNftDto>();
  for (const land of fallback) {
    if (land.tokenId) byId.set(land.tokenId, land);
  }
  for (const land of primary) {
    if (!land.tokenId) continue;
    const prev = byId.get(land.tokenId);
    byId.set(land.tokenId, {
      ...prev,
      ...land,
      // Reason: on-chain scans omit landId; keep the homestead so Work this land stays visible.
      landId: land.landId || prev?.landId || null,
    });
  }
  return [...byId.values()];
}

const ERC721_TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/** keccak256("ItemListed(uint256,address,bytes32,uint256,uint256,bytes32)") */
export const ITEM_LISTED_TOPIC =
  "0x03f8f3629d8b6dac935c407438318c47538781246a1d5a8df491b2e28a02fe28";

/**
 * Reads the minted token id from an ERC-721 Transfer log (four topics).
 *
 * Args:
 *   receipt: eth_getTransactionReceipt payload.
 *
 * Returns:
 *   Decimal token id, or null when no ERC-721 Transfer is present.
 */
export function erc721TransferTokenId(receipt: {
  logs?: Array<{ topics?: string[] }>;
}): string | null {
  for (const log of receipt.logs ?? []) {
    const topics = log.topics ?? [];
    if (topics.length !== 4) continue;
    if (topics[0]?.toLowerCase() !== ERC721_TRANSFER_TOPIC) continue;
    const raw = topics[3];
    if (!raw) continue;
    try {
      return BigInt(raw).toString();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Reads the marketplace listing id from an ItemListed log (indexed listingId).
 *
 * Args:
 *   receipt: eth_getTransactionReceipt payload.
 *
 * Returns:
 *   Decimal listing id, or null when the event is missing.
 */
export function itemListedListingId(receipt: {
  logs?: Array<{ topics?: string[] }>;
}): string | null {
  for (const log of receipt.logs ?? []) {
    const topics = log.topics ?? [];
    if (topics.length < 2) continue;
    if (topics[0]?.toLowerCase() !== ITEM_LISTED_TOPIC) continue;
    const raw = topics[1];
    if (!raw) continue;
    try {
      const id = BigInt(raw);
      if (id === 0n) continue;
      return id.toString();
    } catch {
      continue;
    }
  }
  return null;
}

export interface CreditcoinSnapshotDto {
  network: string;
  chainId: number;
  walletAddress: string | null;
  nativeSymbol: string;
  tctcBalance: string;
  realmBalance: string;
  realmSymbol: string;
  lands: LandNftDto[];
  swaps: CoinSwapDto[];
  tokenListings: TokenListingDto[];
  contractsConfigured: boolean;
  attestcoin: {
    sourceChain: string;
    sourceChainKey: number;
    proofBuilderUrl: string;
    mode: "attestcoin" | "local_dev";
  };
}

/**
 * Converts whole REALM tokens to wei string (18 decimals).
 */
export function realmToWei(whole: number): string {
  const n = Math.max(0, Math.floor(whole));
  return (BigInt(n) * 10n ** BigInt(REALM_TOKEN.decimals)).toString();
}

/**
 * Whole REALM tokens from a wei string.
 *
 * @param wei - 18-decimal amount.
 */
export function realmWeiToWhole(wei: string): number {
  try {
    return Number(BigInt(wei) / 10n ** BigInt(REALM_TOKEN.decimals));
  } catch {
    return 0;
  }
}

/**
 * Formats a wei string as whole.fraction REALM for HUD.
 *
 * @param wei - 18-decimal amount.
 * @param fractionDigits - Digits after the point.
 */
export function formatRealmAmount(wei: string, fractionDigits = 2): string {
  try {
    const w = BigInt(wei);
    const base = 10n ** BigInt(REALM_TOKEN.decimals);
    const whole = w / base;
    const frac = w % base;
    if (fractionDigits <= 0) return whole.toString();
    const fracStr = frac
      .toString()
      .padStart(REALM_TOKEN.decimals, "0")
      .slice(0, fractionDigits)
      .replace(/0+$/, "");
    return fracStr.length > 0 ? `${whole}.${fracStr}` : whole.toString();
  } catch {
    return "0";
  }
}

/**
 * REALM wei minted for a coin burn at the locked rate.
 */
export function realmWeiForCoins(coins: number): string {
  const n = Math.floor(coins);
  if (!Number.isFinite(n) || n <= 0) return "0";
  const wholeRealm = Math.floor(n / REALM_TOKEN.coinsPerRealm);
  return realmToWei(wholeRealm);
}

/**
 * True when a coin amount may be swapped for REALM.
 */
export function isValidCoinSwapAmount(coins: number): boolean {
  if (!Number.isFinite(coins)) return false;
  const n = Math.floor(coins);
  if (n < REALM_TOKEN.minSwapCoins || n > REALM_TOKEN.maxSwapCoins) return false;
  return n % REALM_TOKEN.coinsPerRealm === 0;
}

/**
 * True when a REALM whole-token listing price is in bounds.
 */
export function isValidTokenListPrice(priceRealm: number): boolean {
  if (!Number.isFinite(priceRealm)) return false;
  const p = Math.floor(priceRealm);
  return p >= TOKEN_MARKET.minPriceRealm && p <= TOKEN_MARKET.maxPriceRealm;
}

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/**
 * Basic EIP-55-agnostic EVM address check.
 */
export function isEvmAddress(value: string | null | undefined): boolean {
  return typeof value === "string" && EVM_ADDRESS_RE.test(value);
}

/**
 * Lowercases a valid EVM address; returns null when invalid.
 */
export function normalizeEvmAddress(
  value: string | null | undefined,
): string | null {
  if (!isEvmAddress(value)) return null;
  return value!.toLowerCase();
}

/**
 * Builds the exact wallet-link message the server will verify.
 */
export function walletLinkMessage(input: {
  username: string;
  userId: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
}): string {
  return [
    "Creditcoin Realm link",
    "",
    "I am linking this wallet to my game account.",
    `Username: ${input.username}`,
    `User ID: ${input.userId}`,
    `Chain ID: ${input.chainId}`,
    `Nonce: ${input.nonce}`,
    `Issued at: ${input.issuedAt}`,
    "",
    "This does not grant combat power.",
  ].join("\n");
}

/**
 * Size index used by LandNFT.mintLand.
 */
export function landSizeIndex(size: LandNftSize): number {
  return LAND_NFT_SIZES.indexOf(size);
}

/**
 * Biome index used by LandNFT.mintLand.
 */
export function landBiomeIndex(biome: LandNftBiome): number {
  return LAND_NFT_BIOMES.indexOf(biome);
}
