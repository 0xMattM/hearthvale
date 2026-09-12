/**
 * Unequip soft world reinforce (PL154.2).
 * Brief soft rim after tool unequip ok —
 * complements Unequipped ephemeral (PL20.2) + equip rim (PL152.1).
 * Durability / equip rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful tool unequip (PL154.2).
 * Quiet cool release-grip mist — tool stowed kinship, distinct from cool
 * ready-grip steel equip rim + warm forge-pewter repair rim.
 */
export const TOOL_UNEQUIP_WORLD_REINFORCE = {
  durationMs: 480,
  opacityPeak: 0.8,
  clearPct: 50,
  midPct: 76,
  midRgba: "rgba(120, 132, 148, 0.2)",
  outerRgba: "rgba(40, 48, 60, 0.34)",
} as const;

/**
 * Whether a successful tool unequip should flash the soft world rim (PL154.2).
 * True only on ok unequip (inventory id null/undefined); equip / fail stay quiet.
 * Durability rules unchanged.
 *
 * @param ok - Whether the unequip action succeeded.
 * @param inventoryId - Equipped stack id, or null/undefined when unequipping.
 * @returns True when the soft unequip rim should briefly flash.
 */
export function shouldFlashToolUnequipWorldReinforce(
  ok: boolean,
  inventoryId: string | null | undefined,
): boolean {
  return ok === true && inventoryId == null;
}

/**
 * CSS `background` radial gradient for the tool-unequip reinforce (PL154.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function toolUnequipWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = TOOL_UNEQUIP_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
