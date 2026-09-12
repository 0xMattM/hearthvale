import type { CoinSwapStatus } from "@game/shared";

/** Ephemeral TopBar copy when a coin→REALM mint lands on-chain. */
export const CREDITCOIN_SWAP_MINTED_CUE = "REALM minted to wallet";

/** Ephemeral TopBar copy while the mint is still pending on-chain. */
export const CREDITCOIN_SWAP_PENDING_CUE = "REALM mint pending…";

/** TopBar copy after Sepolia notarize, while Creditcoin attestation/mint lags. */
export const CREDITCOIN_SWAP_NOTARIZED_CUE = "Waiting for Attestcoin proof…";

/** Fallback copy when swap status is missing or still queued. */
export const CREDITCOIN_SWAP_QUEUED_CUE = "REALM swap queued";

export const SEPOLIA_EXPLORER_URL = "https://sepolia.etherscan.io";

/**
 * Which explorer link the swap list should show.
 */
export function creditcoinSwapExplorerKind(swap: {
  creditcoinTxHash: string | null;
  sepoliaTxHash: string | null;
}): "creditcoin" | "sepolia" | "queued" {
  if (swap.creditcoinTxHash && swap.creditcoinTxHash !== "local_dev") {
    return "creditcoin";
  }
  if (swap.sepoliaTxHash) return "sepolia";
  return "queued";
}

/**
 * Brief TopBar copy after a successful coins→REALM swap.
 * Status comes from `/api/creditcoin/swap`; on-chain mint may lag the burn.
 *
 * @param status - Swap status from the API, if present.
 * @returns Short minted / pending / queued cue.
 */
export function creditcoinSwapSuccessCueText(
  status: CoinSwapStatus | undefined,
): string {
  if (status === "minted") return CREDITCOIN_SWAP_MINTED_CUE;
  if (status === "pending") return CREDITCOIN_SWAP_PENDING_CUE;
  if (status === "notarized") return CREDITCOIN_SWAP_NOTARIZED_CUE;
  return CREDITCOIN_SWAP_QUEUED_CUE;
}
