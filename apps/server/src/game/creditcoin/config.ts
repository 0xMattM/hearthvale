import { CREDITCOIN_TESTNET } from "@game/shared";

export type CreditcoinMode = "local_dev" | "attestcoin";

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

/**
 * Runtime Creditcoin / Attestcoin config from env (never secrets in client responses).
 */
export function creditcoinConfig() {
  const rpcUrl = env("CREDITCOIN_RPC_URL") ?? CREDITCOIN_TESTNET.rpcUrls[0];
  const realmToken = env("CREDITCOIN_REALM_TOKEN") ?? "";
  const landNft = env("CREDITCOIN_LAND_NFT") ?? "";
  const marketplace = env("CREDITCOIN_MARKETPLACE") ?? "";
  const asc = env("CREDITCOIN_ASC") ?? "";
  const sepoliaNotary = env("SEPOLIA_NOTARY") ?? "";
  const modeEnv = env("GAME_CREDITCOIN_MODE");
  const contractsConfigured = Boolean(realmToken && landNft && marketplace);
  const attestcoinReady = Boolean(asc && sepoliaNotary);
  const mode: CreditcoinMode =
    modeEnv === "attestcoin" || modeEnv === "local_dev"
      ? modeEnv
      : attestcoinReady
        ? "attestcoin"
        : "local_dev";

  return {
    rpcUrl,
    chainId: CREDITCOIN_TESTNET.chainId,
    realmToken,
    landNft,
    marketplace,
    asc,
    sepoliaNotary,
    sepoliaRpcUrl:
      env("SEPOLIA_RPC_URL") ?? "https://ethereum-sepolia-rpc.publicnode.com",
    proofBuilderUrl:
      env("CREDITCOIN_PROOF_BUILDER_URL") ?? CREDITCOIN_TESTNET.proofBuilderUrl,
    sepoliaRelayerKey: env("SEPOLIA_RELAYER_KEY"),
    creditcoinWorkerKey: env("CREDITCOIN_WORKER_KEY"),
    contractsConfigured,
    attestcoinReady,
    mode,
  };
}

/**
 * Public subset safe to send to the web client.
 */
export function publicCreditcoinConfig() {
  const cfg = creditcoinConfig();
  return {
    chainId: cfg.chainId,
    chainIdHex: CREDITCOIN_TESTNET.chainIdHex,
    name: CREDITCOIN_TESTNET.name,
    rpcUrls: CREDITCOIN_TESTNET.rpcUrls,
    blockExplorerUrls: [...CREDITCOIN_TESTNET.blockExplorerUrls],
    nativeCurrency: CREDITCOIN_TESTNET.nativeCurrency,
    realmToken: cfg.realmToken || null,
    landNft: cfg.landNft || null,
    marketplace: cfg.marketplace || null,
    contractsConfigured: cfg.contractsConfigured,
    mode: cfg.mode,
    sepoliaChainKey: CREDITCOIN_TESTNET.sepoliaChainKey,
    proofBuilderUrl: cfg.proofBuilderUrl,
  };
}
