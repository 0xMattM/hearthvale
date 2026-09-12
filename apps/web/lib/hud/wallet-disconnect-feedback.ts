/**
 * Wallet-disconnect soft world reinforce leftover (PL168.1).
 * Brief soft rim after wallet disconnect ok —
 * complements Wallet disconnected ephemeral PL33.3.
 * Core loops stay wallet-free; mute ok; fail silent; no combat power.
 */

/**
 * Brief soft world rim flash after a successful stub wallet disconnect (PL168.1).
 * Quiet cool disconnect ash-slate — distinct from link-slate (PL167.2), deed
 * claim/mint slate family, scarce Busy coral, and Free settle cyan.
 */
export const WALLET_DISCONNECT_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.82,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(92, 124, 156, 0.2)",
  outerRgba: "rgba(28, 42, 62, 0.36)",
} as const;

/**
 * Whether a successful wallet disconnect should flash the soft world rim (PL168.1).
 * True only on ok disconnect; fail / refuse stay quiet. Core loops stay wallet-free.
 *
 * @param ok - Whether the wallet disconnect action succeeded.
 * @returns True when the soft wallet-disconnect rim should briefly flash.
 */
export function shouldFlashWalletDisconnectWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the wallet-disconnect reinforce (PL168.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function walletDisconnectWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    WALLET_DISCONNECT_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
