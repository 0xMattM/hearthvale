/**
 * Deed-claim soft world reinforce leftover (PL166.2).
 * Brief soft rim after cosmetic deed claim ok —
 * complements Deed claimed ephemeral PL33.3 + desk landmark PL165.1.
 * Wallet path unchanged; mute ok; fail silent; no combat power.
 */

/**
 * Brief soft world rim flash after a successful cosmetic deed claim (PL166.2).
 * Quiet cool system-slate kinship with deed desk landmark — distinct from
 * scarce Busy coral + Free settle cyan.
 */
export const DEED_CLAIM_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(94, 122, 140, 0.22)",
  outerRgba: "rgba(32, 48, 58, 0.38)",
} as const;

/**
 * Whether a successful deed claim should flash the soft world rim (PL166.2).
 * True only on ok claim; fail / refuse stay quiet. Wallet path unchanged.
 *
 * @param ok - Whether the deed claim action succeeded.
 * @returns True when the soft deed-claim rim should briefly flash.
 */
export function shouldFlashDeedClaimWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the deed-claim reinforce (PL166.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function deedClaimWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = DEED_CLAIM_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
