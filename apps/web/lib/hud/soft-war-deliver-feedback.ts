/**
 * Soft-war deliver soft world reinforce (PL146.2).
 * Brief soft rim when wood deliver scores during an open contest —
 * complements Delivered · N (PL31.2) + contest beacon pulse (PL146.1).
 * Scoring / window rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful soft-war wood deliver (PL146.2).
 * Warm ember kinship with claim contest cue — distinct from arena enter peach
 * + guild-bank membership blue.
 */
export const SOFT_WAR_DELIVER_WORLD_REINFORCE = {
  durationMs: 480,
  opacityPeak: 0.84,
  clearPct: 49,
  midPct: 75,
  midRgba: "rgba(180, 100, 56, 0.24)",
  outerRgba: "rgba(88, 44, 24, 0.4)",
} as const;

/**
 * Whether a successful soft-war deliver should flash the soft world rim (PL146.2).
 * True only when deliver qty scored (>0); fail / refuse / zero stay quiet.
 *
 * @param ok - Whether the claim interact succeeded.
 * @param delivered - Delivered wood qty from the claim response.
 * @returns True when the soft deliver rim should briefly flash.
 */
export function shouldFlashSoftWarDeliverWorldReinforce(
  ok: boolean,
  delivered: number | null | undefined,
): boolean {
  if (ok !== true) return false;
  if (delivered == null || !Number.isFinite(delivered)) return false;
  return delivered > 0;
}

/**
 * CSS `background` radial gradient for the soft-war deliver reinforce (PL146.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function softWarDeliverWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    SOFT_WAR_DELIVER_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
