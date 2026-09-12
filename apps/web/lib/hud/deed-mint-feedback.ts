/**
 * Deed-mint soft world reinforce leftover (PL167.1).
 * Brief soft rim after mock mint ok —
 * complements Deed minted ephemeral PL33.3 + desk landmark PL165.1.
 * Stub path unchanged; mute ok; fail silent; no combat power.
 */

/**
 * Brief soft world rim flash after a successful mock deed mint (PL167.1).
 * Quiet cool mint-slate kinship with deed desk / claim family — distinct from
 * claim system-slate, scarce Busy coral, and Free settle cyan.
 */
export const DEED_MINT_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(86, 142, 148, 0.22)",
  outerRgba: "rgba(24, 52, 56, 0.38)",
} as const;

/**
 * Whether a successful mock deed mint should flash the soft world rim (PL167.1).
 * True only on ok mint; fail / refuse stay quiet. Stub path unchanged.
 *
 * @param ok - Whether the mock mint action succeeded.
 * @returns True when the soft deed-mint rim should briefly flash.
 */
export function shouldFlashDeedMintWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the deed-mint reinforce (PL167.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function deedMintWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = DEED_MINT_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
