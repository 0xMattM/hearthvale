import {
  WORLD,
  combatEngageRange,
  isCombatBuildingType,
  type BuildingDto,
} from "@game/shared";

/**
 * Ready hunt / dummy in RPG-encounter range of the player (roam ring, not pad).
 *
 * @param buildings - Active land buildings.
 * @param pos - Player world XZ.
 * @param now - Synced game clock ms.
 * @returns Nearest ready combat node, or undefined.
 */
export function findAutoEngagePrey(
  buildings: readonly BuildingDto[],
  pos: { x: number; z: number },
  now: number,
): BuildingDto | undefined {
  let best: BuildingDto | undefined;
  let bestDist = Infinity;
  for (const building of buildings) {
    if (!isCombatBuildingType(building.type)) continue;
    if (building.readyAt != null && now < building.readyAt) continue;
    const zone =
      building.type === "arena_dummy"
        ? "arena_dummy"
        : building.type === "edge_thicket"
          ? "edge_thicket"
          : "game_trail";
    const reach = combatEngageRange(zone);
    const dist = Math.hypot(
      building.x * WORLD.GRID - pos.x,
      building.z * WORLD.GRID - pos.z,
    );
    if (dist > reach || dist >= bestDist) continue;
    best = building;
    bestDist = dist;
  }
  return best;
}
