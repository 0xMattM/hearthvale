/**
 * Travel-arrive soft world reinforce leftover (PL164.1).
 * Brief soft rim after map travel Arrived —
 * complements Arrived · dest (PL115.2) + Free portal pulse (PL144.1 / PL120.2).
 * Fares stay free; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after successful free map travel (PL164.1).
 * Quiet cool Free cyan kinship with portal veil / threshold (#6ec8ff) —
 * distinct from warm Arena enter, dusty Arena leave, and meadow home-return.
 */
export const TRAVEL_ARRIVE_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.86,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(110, 200, 255, 0.22)",
  outerRgba: "rgba(28, 64, 96, 0.4)",
} as const;

/**
 * Whether successful free travel should flash the soft world rim (PL164.1).
 * True only on ok travel arrive; refuse / fail stay quiet. Fares stay free.
 *
 * @param ok - Whether the travel action succeeded.
 * @returns True when the soft travel-arrive rim should briefly flash.
 */
export function shouldFlashTravelArriveWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the travel-arrive reinforce (PL164.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function travelArriveWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = TRAVEL_ARRIVE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
