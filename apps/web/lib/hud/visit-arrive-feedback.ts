/**
 * Visit-arrive soft world reinforce leftover (PL184.1).
 * Brief soft rim after visit arrive ok —
 * complements Visiting · ephemeral (PL15.1) + host nameplate (PL119.2) +
 * first-visit tip (PL53.1). Visit rules unchanged; mute ok; fail silent.
 * Distinct from travel-arrive Free cyan + home-return meadow (no second leave rim).
 */

/**
 * Brief soft world rim flash after successful visit arrive (PL184.1).
 * Cool guest teal kinship with VISIT_HOST_NAMEPLATE / peer silhouette (#5a8a9a) —
 * distinct from Free cyan travel-arrive, meadow home-return, and invite kinship.
 */
export const VISIT_ARRIVE_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.86,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(110, 168, 184, 0.24)",
  outerRgba: "rgba(36, 64, 76, 0.42)",
} as const;

/**
 * Whether successful visit arrive should flash the soft world rim (PL184.1).
 * True only on ok visit with a readable host; refuse / empty host stay quiet.
 *
 * @param visitOk - Whether the visit action succeeded.
 * @param ownerUsername - Host username from the visit response.
 * @returns True when the soft visit-arrive rim should briefly flash.
 */
export function shouldFlashVisitArriveWorldReinforce(
  visitOk: boolean,
  ownerUsername: string | null | undefined,
): boolean {
  if (visitOk !== true) return false;
  const cleaned = (ownerUsername ?? "").trim();
  return cleaned.length > 0;
}

/**
 * CSS `background` radial gradient for the visit-arrive reinforce (PL184.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function visitArriveWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = VISIT_ARRIVE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
