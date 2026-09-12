/**
 * Visit home-return / visit-leave soft world reinforce (PL139.1 / PL180.2 kinship).
 * Brief soft rim when returning home from a visit —
 * complements Your land tip (PL114.2) + Home ephemeral (PL27.1) +
 * visit host nameplate (PL119.2) + visit mist leftover (PL175.2).
 * PL180.2 leftover = same reinforce (do not stack a second leave rim).
 * Visit rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after leaving a visit back home (PL139.1 / PL180.2).
 * Warm meadow / Land chip kinship (#8aab6a) — distinct from visit-host teal,
 * quest verdant, and market teal.
 */
export const VISIT_HOME_RETURN_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.88,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(100, 128, 64, 0.24)",
  outerRgba: "rgba(52, 72, 32, 0.44)",
} as const;

/**
 * Whether leaving a visit should flash the home-return world reinforce (PL139.1 / PL180.2).
 * True only when actually leaving a visit; own-land idle stays quiet.
 *
 * @param wasVisiting - True when `visitLand` was set before leave.
 * @returns True when the soft home-return rim should briefly flash.
 */
export function shouldFlashVisitHomeReturnWorldReinforce(
  wasVisiting: boolean,
): boolean {
  return wasVisiting === true;
}

/**
 * CSS `background` radial gradient for the visit home-return reinforce (PL139.1 / PL180.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function visitHomeReturnWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    VISIT_HOME_RETURN_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
