import {
  CREDITCOIN_TESTNET,
  LAND_NFT,
  MAX_UINT256,
  decodeUint256,
  encodeAllowance,
  encodeApprove,
  encodeBuyItem,
  encodeCancelListing,
  encodeListItem,
  encodeListingIdByGameId,
  encodeMintLand,
  encodeTransfer,
  erc721TransferTokenId,
  itemListedListingId,
  landBiomeIndex,
  landSizeIndex,
  realmToWei,
  utf8ToBytes32,
  type LandNftBiome,
  type LandNftSize,
} from "@game/shared";
import {
  ensureCreditcoinNetwork,
  getEthereum,
  type CreditcoinPublicConfig,
} from "./creditcoin-wallet";

type ChainConfigPayload = {
  chainId?: number;
  chainIdHex?: string;
  name?: string;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  nativeCurrency?: { name: string; symbol: string; decimals: number };
  realmToken?: string | null;
  landNft?: string | null;
  marketplace?: string | null;
  contractsConfigured?: boolean;
  mode?: "local_dev" | "attestcoin";
};

/**
 * Fills CreditcoinPublicConfig defaults from /chain/creditcoin.
 */
export function asPublicConfig(raw: ChainConfigPayload): CreditcoinPublicConfig {
  return {
    chainId: raw.chainId ?? CREDITCOIN_TESTNET.chainId,
    chainIdHex: raw.chainIdHex ?? CREDITCOIN_TESTNET.chainIdHex,
    name: raw.name ?? CREDITCOIN_TESTNET.name,
    rpcUrls: raw.rpcUrls ?? [...CREDITCOIN_TESTNET.rpcUrls],
    blockExplorerUrls:
      raw.blockExplorerUrls ?? [...CREDITCOIN_TESTNET.blockExplorerUrls],
    nativeCurrency: raw.nativeCurrency ?? CREDITCOIN_TESTNET.nativeCurrency,
    realmToken: raw.realmToken ?? null,
    landNft: raw.landNft ?? null,
    marketplace: raw.marketplace ?? null,
    contractsConfigured: Boolean(raw.contractsConfigured),
    mode: raw.mode === "attestcoin" ? "attestcoin" : "local_dev",
  };
}

async function connectedAccount(cfg?: CreditcoinPublicConfig): Promise<string> {
  const eth = getEthereum();
  const accounts = (await eth.request({
    method: "eth_requestAccounts",
  })) as string[];
  const address = accounts[0];
  if (!address) throw new Error("No wallet account selected.");
  await ensureCreditcoinNetwork(cfg);
  return address;
}

async function waitForTx(hash: string): Promise<{
  status?: string | number;
  logs?: Array<{ topics?: string[] }>;
}> {
  const eth = getEthereum();
  for (let i = 0; i < 60; i++) {
    const rec = (await eth.request({
      method: "eth_getTransactionReceipt",
      params: [hash],
    })) as { status?: string | number; logs?: Array<{ topics?: string[] }> } | null;
    if (rec) {
      const status = rec.status;
      if (status === "0x0" || status === 0 || status === "0") {
        throw new Error("Creditcoin transaction reverted");
      }
      return rec;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timed out waiting for Creditcoin confirmation");
}

/**
 * Wallet tx fields for Creditcoin (explicit chainId so MetaMask does not sign 0x18e6f).
 *
 * Args:
 *   from: Checksum or lowercase sender.
 *   to: Contract address.
 *   data: ABI calldata.
 *   chainIdHex: CREDITCOIN_TESTNET.chainIdHex (0x18e8f).
 *
 * Returns:
 *   eth_sendTransaction params object.
 */
export function creditcoinTxRequest(
  from: string,
  to: string,
  data: string,
  chainIdHex: string,
): { from: string; to: string; data: string; chainId: string; value: "0x0" } {
  return { from, to, data, chainId: chainIdHex, value: "0x0" };
}

async function sendTx(
  from: string,
  to: string,
  data: string,
  chainIdHex: string,
): Promise<{
  hash: string;
  tokenId: string | null;
  logs?: Array<{ topics?: string[] }>;
}> {
  const eth = getEthereum();
  const hash = (await eth.request({
    method: "eth_sendTransaction",
    params: [creditcoinTxRequest(from, to, data, chainIdHex)],
  })) as string;
  const rec = await waitForTx(hash);
  return {
    hash,
    tokenId: erc721TransferTokenId(rec),
    logs: rec.logs,
  };
}

async function readAllowance(
  token: string,
  owner: string,
  spender: string,
): Promise<bigint> {
  const eth = getEthereum();
  const result = (await eth.request({
    method: "eth_call",
    params: [{ to: token, data: encodeAllowance(owner, spender) }, "latest"],
  })) as string;
  return decodeUint256(result);
}

async function ensureApprove(
  from: string,
  token: string,
  spender: string,
  amount: bigint,
  chainIdHex: string,
): Promise<void> {
  const current = await readAllowance(token, from, spender);
  if (current >= amount) return;
  await sendTx(
    from,
    token,
    encodeApprove(spender, BigInt(MAX_UINT256)),
    chainIdHex,
  );
}

/**
 * Approves REALM and mints a land NFT from the connected wallet.
 */
export async function mintLandOnchain(
  cfg: CreditcoinPublicConfig,
  biome: LandNftBiome,
  size: LandNftSize,
): Promise<{ hash: string; tokenId: string | null }> {
  if (!cfg.realmToken || !cfg.landNft) {
    throw new Error("Land contract is not configured.");
  }
  const from = await connectedAccount(cfg);
  const price = BigInt(realmToWei(LAND_NFT.priceRealm[size]));
  await ensureApprove(from, cfg.realmToken, cfg.landNft, price, cfg.chainIdHex);
  return sendTx(
    from,
    cfg.landNft,
    encodeMintLand(landBiomeIndex(biome), landSizeIndex(size)),
    cfg.chainIdHex,
  );
}

/**
 * Posts an ItemMarketplace listing and returns the on-chain listing id.
 */
export async function listItemOnchain(
  cfg: CreditcoinPublicConfig,
  itemId: string,
  qty: number,
  priceRealmWei: string,
  gameListingId: string,
): Promise<string> {
  if (!cfg.marketplace) throw new Error("Marketplace is not configured.");
  const from = await connectedAccount(cfg);
  const itemBytes = utf8ToBytes32(itemId);
  const gameBytes = utf8ToBytes32(gameListingId);
  const sent = await sendTx(
    from,
    cfg.marketplace,
    encodeListItem(itemBytes, qty, priceRealmWei, gameBytes),
    cfg.chainIdHex,
  );
  const fromLogs = itemListedListingId({ logs: sent.logs });
  if (fromLogs) return fromLogs;
  // Reason: MetaMask eth_call can lag the receipt; retry listingIdByGameId.
  const eth = getEthereum();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const result = (await eth.request({
      method: "eth_call",
      params: [
        {
          to: cfg.marketplace,
          data: encodeListingIdByGameId(gameBytes),
        },
        "latest",
      ],
    })) as string;
    const id = decodeUint256(result);
    if (id !== 0n) return id.toString();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("On-chain listing id was not found.");
}

/**
 * Pays REALM for an on-chain marketplace listing.
 */
export async function buyItemOnchain(
  cfg: CreditcoinPublicConfig,
  onchainListingId: string,
  priceRealmWei: string,
): Promise<string> {
  if (!cfg.marketplace || !cfg.realmToken) {
    throw new Error("Marketplace is not configured.");
  }
  const from = await connectedAccount(cfg);
  await ensureApprove(
    from,
    cfg.realmToken,
    cfg.marketplace,
    BigInt(priceRealmWei),
    cfg.chainIdHex,
  );
  const minted = await sendTx(
    from,
    cfg.marketplace,
    encodeBuyItem(onchainListingId),
    cfg.chainIdHex,
  );
  return minted.hash;
}

/**
 * Transfers REALM tokens to another wallet (P2P).
 */
export async function transferRealmOnchain(
  cfg: CreditcoinPublicConfig,
  to: string,
  amountWei: string,
): Promise<string> {
  if (!cfg.realmToken) throw new Error("REALM token is not configured.");
  const from = await connectedAccount(cfg);
  const sent = await sendTx(from, cfg.realmToken, encodeTransfer(to, amountWei), cfg.chainIdHex);
  return sent.hash;
}

/**
 * Cancels an on-chain marketplace listing from the seller wallet.
 */
export async function cancelListingOnchain(
  cfg: CreditcoinPublicConfig,
  onchainListingId: string,
): Promise<string> {
  if (!cfg.marketplace) throw new Error("Marketplace is not configured.");
  const from = await connectedAccount(cfg);
  const sent = await sendTx(
    from,
    cfg.marketplace,
    encodeCancelListing(onchainListingId),
    cfg.chainIdHex,
  );
  return sent.hash;
}
