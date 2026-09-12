/**
 * Visit-land E interact sticky policy (PL31.1).
 * Banner + Esc / Go home cover stay-state; trade stays on T — no sticky leave prose.
 */

/** Former sticky visit-E prose — must not be sticky-set after PL31.1. */
export const VISIT_INTERACT_LEGACY_STICKY =
  "Visiting — production is the owner's. Press T to trade, Esc to go home.";

/**
 * Sticky TopBar copy when pressing E while visiting another land (PL31.1).
 * Always null — min HUD; arrive/leave cues cover confirm (PL15.1 / PL27.1).
 *
 * @returns Always null.
 */
export function visitInteractStickyInfo(): string | null {
  return null;
}

/**
 * Whether text is the retired visit-E sticky leave/trade prose.
 *
 * @param text - Candidate TopBar info string.
 * @returns True when text matches the pre-PL31.1 sticky copy.
 */
export function isVisitInteractLegacySticky(
  text: string | null | undefined,
): boolean {
  return text === VISIT_INTERACT_LEGACY_STICKY;
}
