/**
 * Visual cue configs part 1/30 (RF6.4) — split from catalog.ts.
 */

import { flashDecayEnvelope, sinePulseEnvelope } from "./visual-cue-math.js";
import {
  isPlayerLandStationType,
  isProcessStationBuilding
} from "./catalog-buildings.js";
import { isUpgradableBuildingType } from "./catalog-cues-30.js";

/**
 * Soft bench glow while a process station craft is in-flight (PL121.2).
 * Panel-open OR real craft job working; recipes / XP unchanged.
 */
export const PROCESS_STATION_WORKING_EMISSIVE = {
  padColor: "#d4b060",
  emissiveColor: "#e0a838",
  opacity: 0.38,
  intensityMin: 0.2,
  intensityMax: 0.52,
  periodMs: 1200,
  bodyEmissive: "#c89840",
} as const;

/**
 * True when this process station should show working glow (PL121.2).
 *
 * @param buildingType - World building type.
 * @param craftPanelStation - Active craft panel station id, or null when closed.
 * @param craftJobWorking - True when this building has your (or exclusive) working job.
 * @returns True when panel is open for this station or a craft job is working.
 */
export function shouldShowProcessStationWorkingEmissive(
  buildingType: string,
  craftPanelStation: string | null,
  craftJobWorking = false,
): boolean {
  if (!isProcessStationBuilding(buildingType)) return false;
  if (craftJobWorking) return true;
  return (
    craftPanelStation != null && craftPanelStation === buildingType
  );
}

/**
 * Soft sine envelope for process-station working glow (PL121.2).
 *
 * @param nowMs - Clock ms (e.g. scene `nowMs`).
 * @returns Envelope in [0, 1].
 */
export function processStationWorkingEmissiveEnvelope(nowMs: number): number {
  const period = PROCESS_STATION_WORKING_EMISSIVE.periodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Soft pad/body emissive while a process station craft is in-flight (PL121.2).
 * Quiet when panel closed; recipes / XP rules unchanged.
 *
 * @param working - True when craft panel is open for this station.
 * @param workEnvelope - 0..1 from `processStationWorkingEmissiveEnvelope`.
 * @returns Emissive intensity.
 */
export function processStationWorkingEmissiveIntensity(
  working: boolean,
  workEnvelope: number,
): number {
  if (!working) return 0;
  const { intensityMin, intensityMax } = PROCESS_STATION_WORKING_EMISSIVE;
  const e = Math.min(1, Math.max(0, workEnvelope));
  return intensityMin + e * (intensityMax - intensityMin);
}

/**
 * Brief soft pad settle on a process station when craft succeeds (PL131.1).
 * Complements Crafted + craft SFX + working emissive (PL121.2).
 * Recipes / XP unchanged; mute ok; fail silent.
 */
export const CRAFT_COMPLETE_BENCH_FLASH = {
  durationMs: 560,
  /** Soft sprout-olive success pad (apart from warm working gold PL121.2). */
  padColor: "#9cbc58",
  emissiveColor: "#b8d060",
  opacityPeak: 0.58,
  intensityPeak: 0.92,
} as const;

/**
 * Whether a successful craft should flash the bench pad (PL131.1).
 * True only on craft ok; fails stay silent.
 *
 * @param craftSucceeded - True when craft API / action succeeded.
 * @returns True when the bench should briefly settle-flash.
 */
export function shouldFlashCraftCompleteBench(craftSucceeded: boolean): boolean {
  return craftSucceeded === true;
}

/**
 * Soft decay envelope for craft-complete bench flash (PL131.1).
 * Peaks at success edge (1) and reaches 0 at durationMs — not a continuous loop.
 *
 * @param elapsedMs - Milliseconds since craft success (0 at start).
 * @returns Envelope in [0, 1]; 0 when outside the flash window.
 */
export function craftCompleteBenchFlashEnvelope(elapsedMs: number): number {
  return flashDecayEnvelope(elapsedMs, CRAFT_COMPLETE_BENCH_FLASH.durationMs);
}

/**
 * Pad opacity for craft-complete bench flash (PL131.1).
 *
 * @param envelope - 0..1 from `craftCompleteBenchFlashEnvelope`.
 * @returns Opacity.
 */
export function craftCompleteBenchFlashOpacity(envelope: number): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * CRAFT_COMPLETE_BENCH_FLASH.opacityPeak;
}

/**
 * Pad emissive intensity for craft-complete bench flash (PL131.1).
 *
 * @param envelope - 0..1 from `craftCompleteBenchFlashEnvelope`.
 * @returns Emissive intensity.
 */
export function craftCompleteBenchFlashEmissiveIntensity(
  envelope: number,
): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * CRAFT_COMPLETE_BENCH_FLASH.intensityPeak;
}

/**
 * True when this process station should show the craft-complete flash (PL131.1).
 *
 * @param buildingType - World building type.
 * @param flashStation - Station id currently flashing, or null.
 * @returns True when this bench should render the settle pad.
 */
export function shouldShowCraftCompleteBenchFlash(
  buildingType: string,
  flashStation: string | null,
): boolean {
  return (
    isProcessStationBuilding(buildingType) &&
    flashStation != null &&
    flashStation === buildingType
  );
}

/**
 * Brief soft pad settle on the upgraded mill/forge after ok upgrade (PL137.1).
 * Complements Upgraded ephemeral (PL48.1) + craft-complete flash (PL131.1).
 * Upgrade costs / tiers unchanged; mute ok; fail silent.
 */
export const STATION_UPGRADE_PAD_FLASH = {
  durationMs: 580,
  /** Soft warm copper upgrade pad (apart from craft olive PL131.1 + spawn amber PL134.1). */
  padColor: "#c89058",
  emissiveColor: "#e0b070",
  opacityPeak: 0.6,
  intensityPeak: 1.0,
  radius: 1.32,
} as const;

/**
 * Whether a successful station upgrade should flash the pad (PL137.1).
 * True only on upgrade ok for an upgradable station; fails stay silent.
 *
 * @param upgradeSucceeded - True when upgrade API / action succeeded.
 * @param buildingType - Station type that was upgraded.
 * @returns True when the upgraded station should briefly settle-flash.
 */
export function shouldFlashStationUpgradePad(
  upgradeSucceeded: boolean,
  buildingType: string,
): boolean {
  return upgradeSucceeded === true && isUpgradableBuildingType(buildingType);
}

/**
 * Soft decay envelope for station-upgrade pad flash (PL137.1).
 * Peaks at upgrade edge (1) and reaches 0 at durationMs — not a continuous loop.
 *
 * @param elapsedMs - Milliseconds since upgrade success (0 at start).
 * @returns Envelope in [0, 1]; 0 when outside the flash window.
 */
export function stationUpgradePadFlashEnvelope(elapsedMs: number): number {
  const { durationMs } = STATION_UPGRADE_PAD_FLASH;
  if (!(durationMs > 0) || !Number.isFinite(elapsedMs) || elapsedMs < 0) return 0;
  if (elapsedMs >= durationMs) return 0;
  const t = 1 - elapsedMs / durationMs;
  // Reason: ease-out so upgrade settle reads at the edge then softens quickly.
  return t * t;
}

/**
 * Pad opacity for station-upgrade flash (PL137.1).
 *
 * @param envelope - 0..1 from `stationUpgradePadFlashEnvelope`.
 * @returns Opacity.
 */
export function stationUpgradePadFlashOpacity(envelope: number): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * STATION_UPGRADE_PAD_FLASH.opacityPeak;
}

/**
 * Pad emissive intensity for station-upgrade flash (PL137.1).
 *
 * @param envelope - 0..1 from `stationUpgradePadFlashEnvelope`.
 * @returns Emissive intensity.
 */
export function stationUpgradePadFlashEmissiveIntensity(
  envelope: number,
): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * STATION_UPGRADE_PAD_FLASH.intensityPeak;
}

/**
 * True when this building should show the station-upgrade pad flash (PL137.1).
 * Matches by building id so multi-station yards flash the right pad.
 *
 * @param buildingId - World building id.
 * @param flashBuildingId - Id currently flashing, or null.
 * @returns True when this station should render the upgrade settle pad.
 */
export function shouldShowStationUpgradePadFlash(
  buildingId: string,
  flashBuildingId: string | null,
): boolean {
  return flashBuildingId != null && flashBuildingId === buildingId;
}

/**
 * Brief soft pad/rim flash on stump / ore / pen after successful gather (PL131.2).
 * Complements gather SFX + Chopped/Mined/Collected (PL43.1) + inventory flash (PL128.2).
 * Fishing dock splash is PL132.1 — not this cue. Yields / cooldowns unchanged; mute ok.
 */
export const GATHER_SUCCESS_PAD_FLASH = {
  durationMs: 520,
  /** Soft mint-lime success pad (apart from craft olive PL131.1 + pen ready PL127.1). */
  padColor: "#7ec478",
  emissiveColor: "#a8e890",
  opacityPeak: 0.62,
  intensityPeak: 0.98,
  radius: 1.12,
} as const;

/** Gather stations that get the success pad flash (PL131.2) — not fishing dock. */
export type GatherSuccessPadFlashType =
  | "tree_stump"
  | "ore_node"
  | "animal_pen";

/**
 * True when this building type should flash a gather-success pad (PL131.2).
 *
 * @param buildingType - World building type.
 * @returns True for stump / ore / pen.
 */
export function isGatherSuccessPadFlashBuilding(
  buildingType: string,
): buildingType is GatherSuccessPadFlashType {
  return (
    buildingType === "tree_stump" ||
    buildingType === "ore_node" ||
    buildingType === "animal_pen"
  );
}

/**
 * Whether a successful gather should flash the station pad (PL131.2).
 * True only on gather ok for stump / ore / pen; fails stay silent; dock is PL132.1.
 *
 * @param gatherSucceeded - True when gather API / action succeeded.
 * @param buildingType - Building that was gathered.
 * @returns True when the pad should briefly flash.
 */
export function shouldFlashGatherSuccessPad(
  gatherSucceeded: boolean,
  buildingType: string,
): boolean {
  return (
    gatherSucceeded === true && isGatherSuccessPadFlashBuilding(buildingType)
  );
}

/**
 * Soft decay envelope for gather-success pad flash (PL131.2).
 * Peaks at success edge (1) and reaches 0 at durationMs — not a continuous loop.
 *
 * @param elapsedMs - Milliseconds since gather success (0 at start).
 * @returns Envelope in [0, 1]; 0 when outside the flash window.
 */
export function gatherSuccessPadFlashEnvelope(elapsedMs: number): number {
  return flashDecayEnvelope(elapsedMs, GATHER_SUCCESS_PAD_FLASH.durationMs);
}

/**
 * Pad opacity for gather-success flash (PL131.2).
 *
 * @param envelope - 0..1 from `gatherSuccessPadFlashEnvelope`.
 * @returns Opacity.
 */
export function gatherSuccessPadFlashOpacity(envelope: number): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * GATHER_SUCCESS_PAD_FLASH.opacityPeak;
}

/**
 * Pad emissive intensity for gather-success flash (PL131.2).
 *
 * @param envelope - 0..1 from `gatherSuccessPadFlashEnvelope`.
 * @returns Emissive intensity.
 */
export function gatherSuccessPadFlashEmissiveIntensity(
  envelope: number,
): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * GATHER_SUCCESS_PAD_FLASH.intensityPeak;
}

/**
 * True when this building should show the gather-success flash (PL131.2).
 * Matches by building id so multi-stump / multi-ore yards flash the right node.
 *
 * @param buildingId - World building id.
 * @param flashBuildingId - Id currently flashing, or null.
 * @returns True when this node should render the settle pad.
 */
export function shouldShowGatherSuccessPadFlash(
  buildingId: string,
  flashBuildingId: string | null,
): boolean {
  return flashBuildingId != null && flashBuildingId === buildingId;
}

/**
 * Soft water/pad splash on successful fishing-dock catch (PL132.1).
 * Complements Caught (PL43.1) + ready shimmer (PL118.2); distinct from gather pad PL131.2.
 * Catch rates / cooldown unchanged; mute ok.
 */
export const FISH_CATCH_SPLASH_FLASH = {
  durationMs: 560,
  /** Cool water splash (apart from mint-lime gather PL131.2 + ready teal PL118.2). */
  padColor: "#6ec4d8",
  emissiveColor: "#98e0f0",
  opacityPeak: 0.68,
  intensityPeak: 1.05,
  radius: 0.98,
} as const;

/**
 * Whether a successful dock catch should splash the water pad (PL132.1).
 * True only on gather ok for fishing_dock; fails stay silent; stump/ore/pen are PL131.2.
 *
 * @param catchSucceeded - True when gather API / action succeeded.
 * @param buildingType - Building that was gathered.
 * @returns True when the dock should briefly splash.
 */
export function shouldFlashFishCatchSplash(
  catchSucceeded: boolean,
  buildingType: string,
): boolean {
  return catchSucceeded === true && buildingType === "fishing_dock";
}

/**
 * Soft decay envelope for fish-catch splash (PL132.1).
 * Peaks at success edge (1) and reaches 0 at durationMs — not a continuous loop.
 *
 * @param elapsedMs - Milliseconds since catch success (0 at start).
 * @returns Envelope in [0, 1]; 0 when outside the flash window.
 */
export function fishCatchSplashFlashEnvelope(elapsedMs: number): number {
  const { durationMs } = FISH_CATCH_SPLASH_FLASH;
  if (!(durationMs > 0) || !Number.isFinite(elapsedMs) || elapsedMs < 0) return 0;
  if (elapsedMs >= durationMs) return 0;
  const t = 1 - elapsedMs / durationMs;
  // Reason: ease-out so splash reads at the catch edge then softens quickly.
  return t * t;
}

/**
 * Pad opacity for fish-catch splash (PL132.1).
 *
 * @param envelope - 0..1 from `fishCatchSplashFlashEnvelope`.
 * @returns Opacity.
 */
export function fishCatchSplashFlashOpacity(envelope: number): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * FISH_CATCH_SPLASH_FLASH.opacityPeak;
}

/**
 * Pad emissive intensity for fish-catch splash (PL132.1).
 *
 * @param envelope - 0..1 from `fishCatchSplashFlashEnvelope`.
 * @returns Emissive intensity.
 */
export function fishCatchSplashFlashEmissiveIntensity(
  envelope: number,
): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * FISH_CATCH_SPLASH_FLASH.intensityPeak;
}

/**
 * True when this dock should show the fish-catch splash (PL132.1).
 *
 * @param buildingId - World building id.
 * @param flashBuildingId - Id currently flashing, or null.
 * @returns True when this dock should render the splash pad.
 */
export function shouldShowFishCatchSplashFlash(
  buildingId: string,
  flashBuildingId: string | null,
): boolean {
  return flashBuildingId != null && flashBuildingId === buildingId;
}

/**
 * Brief warm pad/spawn emissive when a homestead station places successfully (PL134.1).
 * Complements Homestead (PL25.2) / Built (PL28.3) + beacon hide (PL3.1).
 * Place costs / slots unchanged; mute ok; fail silent.
 */
export const BUILD_PLACE_SPAWN_FLASH = {
  durationMs: 580,
  /** Soft warm timber-amber spawn pad (apart from craft olive / gather mint / fish cool). */
  padColor: "#d4a060",
  emissiveColor: "#e8c078",
  opacityPeak: 0.64,
  intensityPeak: 1.05,
  radius: 1.18,
} as const;

/**
 * Whether a successful station place should flash the spawn pad (PL134.1).
 * True only on place ok for a player-land station; fails / decor stay silent.
 *
 * @param placeSucceeded - True when build API / action succeeded.
 * @param buildingType - Station type that was placed.
 * @returns True when the new station should briefly spawn-flash.
 */
export function shouldFlashBuildPlaceSpawn(
  placeSucceeded: boolean,
  buildingType: string,
): boolean {
  return placeSucceeded === true && isPlayerLandStationType(buildingType);
}
