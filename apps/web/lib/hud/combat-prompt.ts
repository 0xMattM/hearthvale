import type { LiveCombatDto } from "@game/shared";

/**
 * Short prompt while a live fight is open on the nearby target.
 *
 * @param combat - Live combat DTO.
 * @param buildingId - Nearby building id.
 */
export function liveCombatInteractLabel(
  combat: LiveCombatDto | null | undefined,
  buildingId: string | undefined,
): string | null {
  if (!combat?.active || !buildingId || combat.buildingId !== buildingId) {
    return null;
  }
  if (combat.foeLunging) return "Incoming — RMB Guard";
  if (combat.inStrikeRange === false) return "Foe closing in · Attack when near";
  return combat.weaponStyle === "ranged"
    ? "LMB Shoot · RMB Guard"
    : "LMB Attack · RMB Guard";
}
