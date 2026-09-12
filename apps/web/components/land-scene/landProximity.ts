import type { BuildingDto } from "@game/shared";
import { PLAYER_LAND_GATE, WORLD } from "@game/shared";

/** World units per catalog grid cell. Must exceed 2× INTERACT_RANGE. */
export const GRID = WORLD.GRID;

/** Must be < GRID / 2 so adjacent stations do not steal each other. */
export const INTERACT_RANGE = WORLD.INTERACT_RANGE;

export type InteractTarget =
  | { kind: "building"; building: BuildingDto; dist: number }
  | { kind: "expand"; dist: number }
  | { kind: "gate"; dist: number };

/** Options for land interact targeting. */
export interface FindInteractTargetOpts {
  /** Own player land: include the yard-exit gate (opens Travel). */
  includeLandGate?: boolean;
  /** Gate world Z when the homestead is larger than the starter yard. */
  gateWorldZ?: number;
}

/**
 * Closest interactable among buildings and the optional land gate.
 * No walk-up expand pad.
 *
 * @param buildings - Current map buildings.
 * @param px - Avatar world X.
 * @param pz - Avatar world Z.
 * @param opts - Gate inclusion (own player land only).
 * @returns Nearest in-range target, or null.
 */
export function findInteractTarget(
  buildings: BuildingDto[],
  px: number,
  pz: number,
  opts?: FindInteractTargetOpts,
): InteractTarget | null {
  let best: InteractTarget | null = null;

  for (const b of buildings) {
    if (b.type === "build_board") continue;
    const d = Math.hypot(b.x * GRID - px, b.z * GRID - pz);
    if (d > INTERACT_RANGE) continue;
    if (!best || d < best.dist) best = { kind: "building", building: b, dist: d };
  }

  if (opts?.includeLandGate) {
    const gateZ = opts.gateWorldZ ?? PLAYER_LAND_GATE.worldZ;
    const d = Math.hypot(PLAYER_LAND_GATE.worldX - px, gateZ - pz);
    if (d <= INTERACT_RANGE && (!best || d < best.dist)) {
      best = { kind: "gate", dist: d };
    }
  }

  return best;
}

/**
 * Client crop readiness from readyAt (does not wait for the next poll).
 */
export function clientCropState(
  building: BuildingDto,
  nowMs: number,
): BuildingDto["cropState"] {
  if (building.type !== "crop_plot") return building.cropState;
  if (!building.readyAt) return building.cropState ?? "empty";
  if (nowMs >= building.readyAt) return "ready";
  return "planted";
}

/**
 * Ids of crop plots that are harvest-ready at nowMs (PL60.1 edge detection).
 *
 * @param buildings - Current map buildings.
 * @param nowMs - Synced game clock.
 * @returns Plot building ids currently in ready state.
 */
export function readyCropPlotIds(
  buildings: BuildingDto[],
  nowMs: number,
): string[] {
  const ids: string[] = [];
  for (const building of buildings) {
    if (building.type !== "crop_plot") continue;
    if (clientCropState(building, nowMs) === "ready") ids.push(building.id);
  }
  return ids;
}

/**
 * Whether a gather node (ore rock or tree stump) can be harvested right now.
 * Also used for stump recovery prompts (CL10.1 uncovered type guard bug).
 */
/**
 * Whether a gather/care node is actionable (not on cooldown).
 * Reason: CL50.1 — fishing_dock / animal_pen share readyAt cooldowns with ore/tree.
 */
export function oreNodeReady(building: BuildingDto, nowMs: number): boolean {
  if (
    building.type !== "ore_node" &&
    building.type !== "tree_stump" &&
    building.type !== "fishing_dock" &&
    building.type !== "animal_pen"
  ) {
    return false;
  }
  return building.readyAt == null || nowMs >= building.readyAt;
}

/**
 * Ids of tree stumps whose chop cooldown has elapsed (PL65.1 edge detection).
 * Excludes never-chopped stumps (`readyAt` null) so place/hydrate stay quiet.
 *
 * @param buildings - Current map buildings.
 * @param nowMs - Synced game clock.
 * @returns Stump building ids currently post-cooldown ready.
 */
export function readyWoodStumpIds(
  buildings: BuildingDto[],
  nowMs: number,
): string[] {
  const ids: string[] = [];
  for (const building of buildings) {
    if (building.type !== "tree_stump") continue;
    if (building.readyAt == null) continue;
    if (nowMs >= building.readyAt) ids.push(building.id);
  }
  return ids;
}

/**
 * Ids of fishing docks whose cast cooldown has elapsed (PL65.2 edge detection).
 * Excludes never-cast docks (`readyAt` null) so place/hydrate stay quiet.
 *
 * @param buildings - Current map buildings.
 * @param nowMs - Synced game clock.
 * @returns Dock building ids currently post-cooldown ready.
 */
export function readyFishingDockIds(
  buildings: BuildingDto[],
  nowMs: number,
): string[] {
  const ids: string[] = [];
  for (const building of buildings) {
    if (building.type !== "fishing_dock") continue;
    if (building.readyAt == null) continue;
    if (nowMs >= building.readyAt) ids.push(building.id);
  }
  return ids;
}

/**
 * Ids of ore nodes whose chip cooldown has elapsed (PL69.1 edge detection).
 * Excludes never-chipped nodes (`readyAt` null) so place/hydrate stay quiet.
 *
 * @param buildings - Current map buildings.
 * @param nowMs - Synced game clock.
 * @returns Ore node building ids currently post-cooldown ready.
 */
export function readyOreNodeIds(
  buildings: BuildingDto[],
  nowMs: number,
): string[] {
  const ids: string[] = [];
  for (const building of buildings) {
    if (building.type !== "ore_node") continue;
    if (building.readyAt == null) continue;
    if (nowMs >= building.readyAt) ids.push(building.id);
  }
  return ids;
}

/**
 * Ids of animal pens whose care cooldown has elapsed (PL69.2 edge detection).
 * Excludes never-cared pens (`readyAt` null) so place/hydrate stay quiet.
 *
 * @param buildings - Current map buildings.
 * @param nowMs - Synced game clock.
 * @returns Animal pen building ids currently post-cooldown ready.
 */
export function readyAnimalPenIds(
  buildings: BuildingDto[],
  nowMs: number,
): string[] {
  const ids: string[] = [];
  for (const building of buildings) {
    if (building.type !== "animal_pen") continue;
    if (building.readyAt == null) continue;
    if (nowMs >= building.readyAt) ids.push(building.id);
  }
  return ids;
}
