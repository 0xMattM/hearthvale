/**
 * Equip soft world reinforce (PL152.1).
 * Brief soft rim after tool equip ok —
 * complements Equipped ephemeral (PL20.2) + repair rim (PL150.1).
 * Durability / equip rules unchanged; mute ok; fail silent; unequip uses
 * separate soft rim (PL154.2).
 */

/**
 * Brief soft world rim flash after a successful tool equip (PL152.1).
 * Quiet cool ready-grip steel — tool ready kinship, distinct from warm
 * forge-pewter repair rim + cool tool-low slate vignette.
 */
export const TOOL_EQUIP_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.84,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(112, 140, 156, 0.24)",
  outerRgba: "rgba(32, 48, 64, 0.4)",
} as const;

/**
 * Whether a successful tool equip should flash the soft world rim (PL152.1).
 * True only on ok equip (inventory id present); unequip / fail stay quiet.
 * Durability rules unchanged.
 *
 * @param ok - Whether the equip action succeeded.
 * @param inventoryId - Equipped stack id, or null when unequipping.
 * @returns True when the soft equip rim should briefly flash.
 */
export function shouldFlashToolEquipWorldReinforce(
  ok: boolean,
  inventoryId: string | null | undefined,
): boolean {
  return ok === true && inventoryId != null;
}

/**
 * CSS `background` radial gradient for the tool-equip reinforce (PL152.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function toolEquipWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = TOOL_EQUIP_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
