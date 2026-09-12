import {
  isCityLandKind,
  normalizeLandKind,
  type BuildingCraftDto,
} from "@game/shared";

/** Minimal craft-job fields needed for a station glance. */
export interface CraftJobGlanceRow {
  buildingId: string;
  playerId: string;
  recipeId: string;
  readyAt: number;
}

/**
 * Whether this land kind shows another player's job as Busy (not City).
 *
 * @param kind - Active land kind.
 * @returns True on player land / Explore exclusive stations.
 */
export function landKindExclusiveCraft(kind: string): boolean {
  const n = normalizeLandKind(kind);
  return n === "player_land" || n === "explore";
}

/**
 * Builds one station craft glance from already-loaded jobs (no DB).
 *
 * @param jobs - Jobs sitting on this building.
 * @param viewerPlayerId - Current player id.
 * @param landKind - Active land kind.
 * @param now - Server now ms.
 * @returns Craft DTO or null when the station is idle / city-peer-hidden.
 */
export function craftGlanceFromJobs(
  jobs: readonly Omit<CraftJobGlanceRow, "buildingId">[],
  viewerPlayerId: string,
  landKind: string,
  now: number,
): BuildingCraftDto | null {
  if (jobs.length === 0) return null;

  const yours = jobs.find((j) => j.playerId === viewerPlayerId);
  if (yours) {
    return {
      recipeId: yours.recipeId,
      readyAt: yours.readyAt,
      state: now >= yours.readyAt ? "ready" : "working",
      isYours: true,
    };
  }

  // Reason: City peers are invisible — no Busy glance for other jobs.
  if (isCityLandKind(landKind)) return null;
  if (!landKindExclusiveCraft(landKind)) return null;

  const other = jobs[0];
  if (!other) return null;
  return {
    recipeId: null,
    readyAt: null,
    state: now >= other.readyAt ? "ready" : "working",
    isYours: false,
  };
}

/**
 * Groups craft jobs by station id for a single batched glance pass.
 *
 * @param jobs - Flat job rows (any land).
 * @returns Map of building id → jobs on that station.
 */
export function groupCraftJobsByBuilding(
  jobs: readonly CraftJobGlanceRow[],
): Map<string, CraftJobGlanceRow[]> {
  const byBuilding = new Map<string, CraftJobGlanceRow[]>();
  for (const job of jobs) {
    const list = byBuilding.get(job.buildingId);
    if (list) list.push(job);
    else byBuilding.set(job.buildingId, [job]);
  }
  return byBuilding;
}

/**
 * Resolves craft glances for many stations from one job list.
 *
 * @param buildingIds - Station ids on the current land.
 * @param jobs - Jobs already loaded (typically filtered to those ids).
 * @param viewerPlayerId - Current player id.
 * @param landKind - Active land kind.
 * @param now - Server now ms.
 * @returns Map of building id → glance (missing key = idle / hidden).
 */
export function craftGlancesFromJobRows(
  buildingIds: readonly string[],
  jobs: readonly CraftJobGlanceRow[],
  viewerPlayerId: string,
  landKind: string,
  now: number,
): Map<string, BuildingCraftDto> {
  const grouped = groupCraftJobsByBuilding(jobs);
  const out = new Map<string, BuildingCraftDto>();
  for (const id of buildingIds) {
    const glance = craftGlanceFromJobs(
      grouped.get(id) ?? [],
      viewerPlayerId,
      landKind,
      now,
    );
    if (glance) out.set(id, glance);
  }
  return out;
}
