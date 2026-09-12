import { CREDITCOIN_TESTNET } from "@game/shared";

export interface EthereumProvider {
  isMetaMask?: boolean;
  isBraveWallet?: boolean;
  providers?: EthereumProvider[];
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export interface CreditcoinPublicConfig {
  chainId: number;
  chainIdHex: string;
  name: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
  realmToken: string | null;
  landNft: string | null;
  marketplace: string | null;
  contractsConfigured: boolean;
  mode: "local_dev" | "attestcoin";
}

/**
 * Prefers a real MetaMask provider when Brave Wallet also injects window.ethereum.
 *
 * Args:
 *   root: window.ethereum (may be a proxy with a providers[] list).
 *
 * Returns:
 *   The MetaMask provider when present; otherwise the first available provider.
 */
export function pickEthereumProvider(root: EthereumProvider): EthereumProvider {
  const list =
    root.providers && root.providers.length > 0 ? root.providers : [root];
  const metamask = list.find(
    (provider) => provider.isMetaMask === true && provider.isBraveWallet !== true,
  );
  return metamask ?? list[0] ?? root;
}

/**
 * EIP-1193 provider (MetaMask, Rabby, Credit Wallet EVM, etc).
 */
export function getEthereum(): EthereumProvider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Install MetaMask or another wallet that supports Creditcoin.");
  }
  return pickEthereumProvider(window.ethereum);
}

/**
 * Asks the wallet to add / switch to Creditcoin Testnet (chain 102031).
 */
export async function ensureCreditcoinNetwork(
  cfg?: CreditcoinPublicConfig,
): Promise<void> {
  const eth = getEthereum();
  const chainIdHex = cfg?.chainIdHex ?? CREDITCOIN_TESTNET.chainIdHex;
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code !== 4902 && code !== -32603) throw err;
    await eth.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: cfg?.name ?? CREDITCOIN_TESTNET.name,
          nativeCurrency: cfg?.nativeCurrency ?? CREDITCOIN_TESTNET.nativeCurrency,
          rpcUrls: cfg?.rpcUrls ?? [...CREDITCOIN_TESTNET.rpcUrls],
          blockExplorerUrls:
            cfg?.blockExplorerUrls ?? [...CREDITCOIN_TESTNET.blockExplorerUrls],
        },
      ],
    });
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  }
}

/**
 * Connects the wallet, switches to Creditcoin Testnet, and signs the link message.
 */
export async function connectAndSignCreditcoin(message: string): Promise<{
  address: string;
  signature: string;
}> {
  const eth = getEthereum();
  const accounts = (await eth.request({
    method: "eth_requestAccounts",
  })) as string[];
  const address = accounts[0];
  if (!address) throw new Error("No wallet account selected.");
  await ensureCreditcoinNetwork();
  const signature = (await eth.request({
    method: "personal_sign",
    params: [message, address],
  })) as string;
  return { address, signature };
}

/**
 * Registers REALM as a custom token in MetaMask (EIP-747 wallet_watchAsset).
 * Must be on Creditcoin Testnet first or MetaMask will store it on the wrong chain.
 */
export async function watchRealmToken(
  cfg: CreditcoinPublicConfig,
): Promise<boolean> {
  if (!cfg.realmToken) {
    throw new Error("REALM contract is not configured.");
  }
  await ensureCreditcoinNetwork(cfg);
  const eth = getEthereum();
  const added = await eth.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address: cfg.realmToken,
        symbol: "REALM",
        decimals: 18,
      },
    },
  });
  return Boolean(added);
}

/**
 * Switches MetaMask to Creditcoin Testnet (no token add).
 */
export async function switchToCreditcoin(
  cfg?: CreditcoinPublicConfig,
): Promise<void> {
  await ensureCreditcoinNetwork(cfg);
}
