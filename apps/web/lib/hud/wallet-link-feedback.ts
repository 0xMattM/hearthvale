/**
 * Wallet-link soft world reinforce leftover (PL167.2).
 * Brief soft rim after wallet link ok —
 * complements Wallet linked ephemeral PL33.3.
 * Core loops stay wallet-free; mute ok; fail silent; no combat power.
 */

/**
 * Brief soft world rim flash after a successful stub wallet link (PL167.2).
 * Quiet cool link-slate kinship with optional wallet surface — distinct from
 * deed claim/mint slate family, scarce Busy coral, and Free settle cyan.
 */
export const WALLET_LINK_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(112, 148, 188, 0.22)",
  outerRgba: "rgba(36, 52, 78, 0.38)",
} as const;

/**
 * Whether a successful wallet link should flash the soft world rim (PL167.2).
 * True only on ok link; fail / refuse stay quiet. Core loops stay wallet-free.
 *
 * @param ok - Whether the wallet link action succeeded.
 * @returns True when the soft wallet-link rim should briefly flash.
 */
export function shouldFlashWalletLinkWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the wallet-link reinforce (PL167.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function walletLinkWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = WALLET_LINK_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
