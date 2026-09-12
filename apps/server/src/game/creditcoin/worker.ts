import { CREDITCOIN_TESTNET, REALM_MINTER_ASC_ABI } from "@game/shared";
import { Contract, JsonRpcProvider, Wallet, id } from "ethers";
import { isAlreadyProcessedRevert } from "./attest-errors.js";
import {
  attestedHeightUrl,
  isHeightAttested,
  parseAttestedHeight,
} from "./attest-height.js";
import { creditcoinConfig } from "./config.js";
import {
  creditRealmWei,
  listNotarizedSwaps,
  listPendingSwaps,
  markSwapMinted,
  markSwapNotarized,
  refundCoinSwap,
} from "./coin-swap.js";
import { hasDirectRealmMinter, mintRealmToWallet } from "./onchain.js";

const COIN_BURN_NOTARY_ABI = [
  "function notarize(address creditcoinWallet, uint256 coinsBurned, uint256 realmAmount, bytes32 nonce)",
];

/**
 * Mints REALM on Creditcoin with the deployer minter key (no Sepolia proof).
 */
async function mintPendingWithMinterKey(): Promise<void> {
  if (!hasDirectRealmMinter()) return;
  const pending = listPendingSwaps();
  for (const swap of pending) {
    try {
      const hash = await mintRealmToWallet(swap.walletAddress, swap.realmAmount);
      markSwapMinted(swap.id, hash);
      creditRealmWei(swap.playerId, swap.realmAmount);
    } catch (err) {
      console.warn("[creditcoin] direct mint failed", swap.id, err);
      refundCoinSwap(swap.id);
    }
  }
}

/**
 * Posts a Sepolia notary tx for a pending coin burn (relayer key).
 */
async function notarizePendingSwap(): Promise<void> {
  const cfg = creditcoinConfig();
  if (cfg.mode !== "attestcoin" || !cfg.sepoliaRelayerKey || !cfg.sepoliaNotary) {
    return;
  }
  const pending = listPendingSwaps();
  if (pending.length === 0) return;
  const provider = new JsonRpcProvider(
    cfg.sepoliaRpcUrl,
    CREDITCOIN_TESTNET.sepoliaChainId,
    { staticNetwork: true },
  );
  const wallet = new Wallet(cfg.sepoliaRelayerKey, provider);
  const notary = new Contract(cfg.sepoliaNotary, COIN_BURN_NOTARY_ABI, wallet);
  for (const swap of pending) {
    try {
      const tx = await notary.notarize(
        swap.walletAddress,
        swap.coinsBurned,
        swap.realmAmount,
        swap.nonce,
      );
      const receipt = await tx.wait();
      markSwapNotarized(swap.id, receipt?.hash ?? tx.hash);
    } catch (err) {
      console.warn("[attestcoin] notarize failed", swap.id, err);
      refundCoinSwap(swap.id);
    }
  }
}

/**
 * Fetches the latest attested Sepolia height from the proof-gen API.
 */
async function fetchLatestAttestedHeight(
  proofBuilderUrl: string,
  chainKey: number,
): Promise<number | null> {
  const res = await fetch(attestedHeightUrl(proofBuilderUrl, chainKey));
  if (!res.ok) return null;
  return parseAttestedHeight(await res.json());
}

/**
 * Looks up a prior RealmMinterASC mint for this swap nonce.
 */
async function existingMintTxHash(
  provider: JsonRpcProvider,
  ascAddress: string,
  nonce: string,
): Promise<string | null> {
  const topic = id(
    "RealmMintedFromAttestation(address,uint256,uint256,bytes32,bytes32)",
  );
  const current = await provider.getBlockNumber();
  const logs = await provider.getLogs({
    address: ascAddress,
    fromBlock: Math.max(0, current - 20_000),
    toBlock: current,
    topics: [topic, null, nonce],
  });
  return logs[0]?.transactionHash ?? null;
}

/**
 * Builds an Attestcoin proof for a Sepolia CoinBurnNotary tx and calls RealmMinterASC.
 */
async function mintFromProofs(): Promise<void> {
  const cfg = creditcoinConfig();
  if (
    cfg.mode !== "attestcoin" ||
    !cfg.creditcoinWorkerKey ||
    !cfg.asc ||
    !cfg.sepoliaRpcUrl
  ) {
    return;
  }
  const rows = listNotarizedSwaps();
  if (rows.length === 0) return;

  const usc = await import("@gluwa/usc-sdk");
  const sourceProvider = new JsonRpcProvider(
    cfg.sepoliaRpcUrl,
    CREDITCOIN_TESTNET.sepoliaChainId,
    { staticNetwork: true },
  );
  const creditcoinProvider = new JsonRpcProvider(cfg.rpcUrl, cfg.chainId, {
    staticNetwork: true,
  });
  const signer = new Wallet(cfg.creditcoinWorkerKey, creditcoinProvider);
  const chainKey = CREDITCOIN_TESTNET.sepoliaChainKey;
  const proofBuilderUrl = cfg.proofBuilderUrl.replace(/\/$/, "");
  let latestAttested: number | null = null;
  try {
    latestAttested = await fetchLatestAttestedHeight(proofBuilderUrl, chainKey);
  } catch (err) {
    console.warn("[attestcoin] attested-height fetch failed", err);
    return;
  }

  const proofBuilder = new usc.proofGenerator.api.ProverAPIProofGenerator(
    chainKey,
    proofBuilderUrl,
    120_000,
  );
  const prover = new usc.blockProver.PrecompileBlockProver(
    creditcoinProvider as never,
  );
  const asc = new Contract(cfg.asc, REALM_MINTER_ASC_ABI, signer);

  for (const swap of rows) {
    const txHash = swap.sepoliaTxHash;
    if (!txHash) continue;
    try {
      const tx = await sourceProvider.getTransaction(txHash);
      if (!tx?.blockNumber) continue;
      if (!isHeightAttested(latestAttested, tx.blockNumber)) {
        console.log(
          `[attestcoin] swap ${swap.id} waiting attestation: need ${tx.blockNumber}, latest ${latestAttested ?? "none"}`,
        );
        continue;
      }
      const result = await proofBuilder.generateProof(txHash);
      if (!result.success || !result.data) {
        throw new Error(String(result.error ?? "proof failed"));
      }
      const proof = result.data;
      const verified = await prover.verifySingle(
        proof.chainKey,
        proof.headerNumber,
        proof.txBytes,
        proof.merkleProof,
        proof.continuityProof,
      );
      if (!verified) throw new Error("precompile verify failed");
      const already = await asc.usedNonces(swap.nonce);
      if (already) {
        const existing =
          (await existingMintTxHash(creditcoinProvider, cfg.asc, swap.nonce)) ??
          "already-processed";
        markSwapMinted(swap.id, existing);
        creditRealmWei(swap.playerId, swap.realmAmount);
        console.log(`[attestcoin] recovered mint ${swap.id} ${existing}`);
        continue;
      }
      const merkle = proof.merkleProof;
      const mintTx = await asc.execute(
        0,
        proof.chainKey,
        proof.headerNumber,
        proof.txBytes,
        merkle.root,
        merkle.siblings,
        proof.continuityProof.lowerEndpointDigest,
        proof.continuityProof.roots,
      );
      const receipt = await mintTx.wait();
      const hash = receipt?.hash ?? mintTx.hash;
      markSwapMinted(swap.id, hash);
      creditRealmWei(swap.playerId, swap.realmAmount);
      console.log(`[attestcoin] minted ${swap.id} ${hash}`);
    } catch (err) {
      if (isAlreadyProcessedRevert(err)) {
        try {
          const existing =
            (await existingMintTxHash(creditcoinProvider, cfg.asc, swap.nonce)) ??
            "already-processed";
          markSwapMinted(swap.id, existing);
          creditRealmWei(swap.playerId, swap.realmAmount);
          console.log(`[attestcoin] recovered after replay ${swap.id} ${existing}`);
          continue;
        } catch (recoverErr) {
          console.warn("[attestcoin] replay recover failed", swap.id, recoverErr);
        }
      }
      console.warn("[attestcoin] mintFromQuery failed", swap.id, err);
    }
  }
}

let workerStarted = false;
let tickInFlight = false;

/**
 * One worker pass: direct REALM mint and/or Attestcoin notary + ASC.
 */
export async function runCreditcoinWorkerTick(): Promise<void> {
  await mintPendingWithMinterKey();
  await notarizePendingSwap();
  await mintFromProofs();
}

/**
 * Polls pending coin-swaps (direct minter and/or Attestcoin proofs).
 *
 * Reason: overlapping ticks stacked waitUntilHeightAttested pollers against
 * the proof-gen API and stalled attestation catch-up.
 */
export function startAttestcoinWorker(): void {
  if (workerStarted) return;
  workerStarted = true;
  const tick = async () => {
    if (tickInFlight) return;
    tickInFlight = true;
    try {
      await runCreditcoinWorkerTick();
    } catch (err) {
      console.warn("[creditcoin] worker tick failed", err);
    } finally {
      tickInFlight = false;
    }
  };
  void tick();
  setInterval(() => {
    void tick();
  }, 30_000);
}
