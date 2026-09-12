/**
 * Tool-repair soft world reinforce (PL150.1).
 * Brief soft rim after tool repair ok —
 * complements Repaired ephemeral (PL25.1) + tool-low vignette clear (PL132.2).
 * Repair mat costs / max durability unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful tool repair (PL150.1).
 * Quiet warm forge-pewter — restored tool kinship, distinct from cool
 * tool-low slate vignette + mail parchment + decor rosewood.
 */
export const TOOL_REPAIR_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(148, 140, 112, 0.22)",
  outerRgba: "rgba(52, 48, 36, 0.38)",
} as const;

/**
 * Whether a successful tool repair should flash the soft world rim (PL150.1).
 * True only on ok repair; fail / refuse stay quiet. Mat costs unchanged.
 *
 * @param ok - Whether the repair action succeeded.
 * @returns True when the soft tool-repair rim should briefly flash.
 */
export function shouldFlashToolRepairWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the tool-repair reinforce (PL150.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function toolRepairWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = TOOL_REPAIR_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
