/**
 * Minimal ABIs for Realm contracts on Creditcoin Testnet.
 * Keep in sync with contracts/*.sol.
 */

export const REALM_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
] as const;

export const LAND_NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function getLand(uint256 tokenId) view returns (uint8 biome, uint8 size, address minter)",
  "function landPrice(uint8 size) view returns (uint256)",
  "function mintLand(uint8 biome, uint8 size) returns (uint256)",
] as const;

export const ITEM_MARKETPLACE_ABI = [
  "function listItem(bytes32 itemId, uint256 qty, uint256 priceRealm, bytes32 gameListingId) returns (uint256)",
  "function buyItem(uint256 listingId)",
  "function cancelListing(uint256 listingId)",
  "function listingIdByGameId(bytes32 gameListingId) view returns (uint256)",
  "function listings(uint256 listingId) view returns (address seller, bytes32 itemId, uint256 qty, uint256 priceRealm, bytes32 gameListingId, bool active)",
  "event ItemSold(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 priceRealm)",
] as const;

export const COIN_BURN_NOTARY_ABI = [
  "function notarize(address creditcoinWallet, uint256 coinsBurned, uint256 realmAmount, bytes32 nonce)",
  "event CoinBurnedForRealm(address indexed creditcoinWallet, uint256 coinsBurned, uint256 realmAmount, bytes32 indexed nonce)",
] as const;

export const REALM_MINTER_ASC_ABI = [
  "function execute(uint8 action, uint64 chainKey, uint64 blockHeight, bytes encodedTransaction, bytes32 merkleRoot, tuple(bytes32 hash, bool isLeft)[] siblings, bytes32 lowerEndpointDigest, bytes32[] continuityRoots) returns (bool)",
  "function usedNonces(bytes32 nonce) view returns (bool)",
  "event RealmMintedFromAttestation(address indexed wallet, uint256 coinsBurned, uint256 realmAmount, bytes32 indexed nonce, bytes32 indexed queryId)",
] as const;

/** keccak256("CoinBurnedForRealm(address,uint256,uint256,bytes32)") — computed in tests. */
export const COIN_BURNED_FOR_REALM_SIGNATURE =
  "CoinBurnedForRealm(address,uint256,uint256,bytes32)" as const;
