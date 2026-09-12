/**
 * Expand-field soft world reinforce leftover (PL162.2).
 * Brief soft rim after expand ok —
 * complements Expanded (PL20.3) + field-gold pad (PL137.2).
 * Costs / slots unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful land expand (PL162.2).
 * Quiet warm field-gold kinship with expand footprint pad — distinct from
 * upgrade copper, spawn amber, and harvest wheat-gold.
 */
export const EXPAND_FIELD_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.86,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(200, 176, 80, 0.22)",
  outerRgba: "rgba(88, 72, 24, 0.4)",
} as const;

/**
 * Whether a successful land expand should flash the soft world rim (PL162.2).
 * True only on ok expand; fail / refuse stay quiet. Costs / slots unchanged.
 *
 * @param ok - Whether the expand action succeeded.
 * @returns True when the soft expand rim should briefly flash.
 */
export function shouldFlashExpandFieldWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the expand-field reinforce (PL162.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function expandFieldWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = EXPAND_FIELD_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
