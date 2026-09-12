/**
 * Visual cue configs part 25/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  LandKind,
  cssHexRgbDistance,
  isPlayerLandKind,
  isWarriorLandKind
} from "./catalog-buildings.js";
import { BUILD_PLACE_SPAWN_FLASH } from "./catalog-cues-01.js";
import { WARRIOR_ARENA_VISUAL } from "./catalog-cues-04.js";
import { EmptyLandBuildBeaconMode, emptyLandBuildBeaconMode } from "./catalog-cues-08.js";
import { HOUSING_DECOR_ATMOSPHERE_CUE } from "./catalog-cues-21.js";
import {
  HOMESTEAD_SHED_ATMOSPHERE_CUE,
  HOMESTEAD_SHED_LANDMARK_CUE,
  LIVED_HOMESTEAD_ATMOSPHERE_CUE,
  homesteadShedAtmospherePulseEnvelope,
} from "./catalog-cues-24.js";
import {
  LIVED_HOMESTEAD_CHIMNEY_CUE,
  LIVED_HOMESTEAD_PATH_CUE,
} from "./catalog-cues-26.js";

/**
 * Soft leftover mist opacity under the homestead shed (PL202.1).
 *
 * @param pulseEnvelope - 0..1 from `homesteadShedAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function homesteadShedAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = HOMESTEAD_SHED_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between shed leftover mist and landmark rim (PL202.1).
 *
 * @returns Soft distinct deep barn so leftover mist ≠ landmark rim alone.
 */
export function homesteadShedAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive,
    HOMESTEAD_SHED_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between shed leftover mist and chimney hearth (PL202.1).
 *
 * @returns Soft distinct deep barn so leftover mist ≠ chimney alone.
 */
export function homesteadShedAtmosphereVsChimneyContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive,
    LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyEmissive,
  );
}

/**
 * RGB distance between shed leftover mist and lived yard mist (PL202.1).
 *
 * @returns Soft distinct deep barn so shed mist ≠ yard mist alone.
 */
export function homesteadShedAtmosphereVsYardMistContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive,
    LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * RGB distance between shed leftover mist and lived path amber (PL202.1).
 *
 * @returns Soft distinct deep barn so shed mist ≠ path cue alone.
 */
export function homesteadShedAtmosphereVsLivedPathContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive,
    LIVED_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * RGB distance between shed leftover mist and decor rosewood leftover (PL202.1).
 *
 * @returns Soft distinct deep barn so shed mist ≠ decor mist alone.
 */
export function homesteadShedAtmosphereVsDecorAtmosphereContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive,
    HOUSING_DECOR_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * Soft Warrior arena-board landmark cue leftover (PL155.1).
 * Quiet warm plaque haze/emissive on existing arena_board so the Warrior stub
 * reads at glance — complements walk-up pulse PL129.2 + tip PL45.2 / PL53.2.
 * Layouts unchanged; warrior optional; stub / no balance invent; mute ok.
 */
export const ARENA_BOARD_LANDMARK_CUE = {
  /** Warm clay-amber plaque kinship — ≠ face red emissive / ring gold alone. */
  emissive: "#c87838",
  intensityBase: 0.08,
  intensityPeak: 0.24,
  hazeColor: "#8a5028",
  hazeOpacityBase: 0.06,
  hazeOpacityPeak: 0.16,
  hazeRadius: 1.15,
  pulsePeriodMs: 3300,
} as const;

export interface ArenaBoardLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft Warrior arena-board landmark fields (PL155.1).
 * Always-on while on Warrior — optional stub identity, not interact-gated.
 *
 * @param landKind - Active map; cue only on Warrior.
 * @returns Warm plaque haze fields; `show` false off Warrior.
 */
export function arenaBoardLandmarkCue(
  landKind: LandKind | string,
): ArenaBoardLandmarkCueVisual {
  const c = ARENA_BOARD_LANDMARK_CUE;
  if (!isWarriorLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeRadius: c.hazeRadius,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeRadius: c.hazeRadius,
  };
}

/**
 * Soft sine envelope for Warrior arena-board landmark pulse (PL155.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function arenaBoardLandmarkPulseEnvelope(nowMs: number): number {
  const period = ARENA_BOARD_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the arena-board landmark (PL155.1).
 *
 * @param pulseEnvelope - 0..1 from `arenaBoardLandmarkPulseEnvelope`.
 * @returns Emissive intensity for footing / haze.
 */
export function arenaBoardLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = ARENA_BOARD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under the arena board (PL155.1).
 *
 * @param pulseEnvelope - 0..1 from `arenaBoardLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function arenaBoardLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = ARENA_BOARD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between arena landmark and plaque face emissive (PL155.1).
 *
 * @returns Soft distinct warm so continuous landmark ≠ highlight face red.
 */
export function arenaBoardLandmarkVsPlaqueEmissiveContrast(): number {
  return cssHexRgbDistance(
    ARENA_BOARD_LANDMARK_CUE.emissive,
    WARRIOR_ARENA_VISUAL.plaqueEmissive,
  );
}

/**
 * RGB distance between arena landmark and packed sand ring (PL155.1).
 *
 * @returns Soft distinct warm so plaque haze ≠ ring gold alone.
 */
export function arenaBoardLandmarkVsRingContrast(): number {
  return cssHexRgbDistance(
    ARENA_BOARD_LANDMARK_CUE.emissive,
    WARRIOR_ARENA_VISUAL.ringFillColor,
  );
}

/**
 * RGB distance between arena landmark and dusty arena haze (PL155.1).
 *
 * @returns Soft distinct warm so continuous plaque cue ≠ map ground haze alone.
 */
export function arenaBoardLandmarkVsArenaHazeContrast(): number {
  return cssHexRgbDistance(
    ARENA_BOARD_LANDMARK_CUE.emissive,
    WARRIOR_ARENA_VISUAL.hazeColor,
  );
}

/**
 * Soft empty-land build-board landmark cue leftover (PL160.1).
 * Quiet warm timber haze/emissive on existing build_board while the empty-land
 * beacon shows — complements beacon pad/orb PL3.1 + tip PL52.1.
 * Layouts / slots unchanged; mute ok; soft-mode board stays quiet.
 */
export const EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE = {
  /** Warm timber kinship — ≠ beacon gold pad / spawn timber-amber alone. */
  emissive: "#b88840",
  intensityBase: 0.07,
  intensityPeak: 0.22,
  hazeColor: "#6a4824",
  hazeOpacityBase: 0.05,
  hazeOpacityPeak: 0.14,
  hazeRadius: 1.22,
  pulsePeriodMs: 3400,
} as const;

export interface EmptyLandBuildBoardLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft empty-land build-board landmark fields (PL160.1).
 * Always-on while beacon mode is full empty-yard — not interact-gated.
 *
 * @param beaconMode - From `emptyLandBuildBeaconMode` (beacon | soft).
 * @returns Warm timber haze fields; `show` false after first station (soft).
 */
export function emptyLandBuildBoardLandmarkCue(
  beaconMode: EmptyLandBuildBeaconMode | string,
): EmptyLandBuildBoardLandmarkCueVisual {
  const c = EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE;
  if (beaconMode !== "beacon") {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeRadius: c.hazeRadius,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeRadius: c.hazeRadius,
  };
}

/**
 * Soft sine envelope for empty-land build-board landmark pulse (PL160.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function emptyLandBuildBoardLandmarkPulseEnvelope(nowMs: number): number {
  const period = EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the empty-land build landmark (PL160.1).
 *
 * @param pulseEnvelope - 0..1 from `emptyLandBuildBoardLandmarkPulseEnvelope`.
 * @returns Emissive intensity for footing / haze.
 */
export function emptyLandBuildBoardLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under the empty-land build board (PL160.1).
 *
 * @param pulseEnvelope - 0..1 from `emptyLandBuildBoardLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function emptyLandBuildBoardLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } =
    EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between empty-land landmark and beacon pad gold (PL160.1).
 *
 * @returns Soft distinct timber so continuous landmark ≠ beacon pad alone.
 */
export function emptyLandBuildBoardLandmarkVsBeaconPadContrast(): number {
  return cssHexRgbDistance(
    EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.emissive,
    "#d4b060",
  );
}

/**
 * RGB distance between empty-land landmark and build-place spawn flash (PL160.1).
 *
 * @returns Soft distinct timber so continuous landmark ≠ one-shot spawn amber.
 */
export function emptyLandBuildBoardLandmarkVsSpawnFlashContrast(): number {
  return cssHexRgbDistance(
    EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.emissive,
    BUILD_PLACE_SPAWN_FLASH.emissiveColor,
  );
}

/**
 * RGB distance between empty-land landmark and lived chimney cue (PL160.1).
 *
 * @returns Soft distinct timber so empty-board haze ≠ lived hearth.
 */
export function emptyLandBuildBoardLandmarkVsChimneyContrast(): number {
  // Reason: chimney SoT lives later in this module; hex matches LIVED_HOMESTEAD_CHIMNEY_CUE.
  return cssHexRgbDistance(
    EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.emissive,
    "#c87840",
  );
}

/**
 * Soft build-board atmosphere leftover (PL200.1).
 * Quiet warm pulsing timber mist over existing build board while yard can place —
 * complements empty-land beacon landmark PL160.1 + place flash PL134.1.
 * Build costs SoT unchanged; mute ok. Continuous leftover on player land (beacon + soft).
 * Distinct wider/slower/quieter mist — warm landmark stays identity rim while empty;
 * soft-mode board keeps the mist so placeable yards stay glanceable after first station.
 */
export const BUILD_BOARD_ATMOSPHERE_CUE = {
  /** Quiet warm board timber — ≠ landmark #b88840 / beacon pad #d4b060 / spawn #e8c078 / workshop #583018. */
  emissive: "#684828",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#2a1c0c",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than empty-land landmark disc (1.22) so leftover mist reads as place-zone atmosphere. */
  hazeRadius: 1.55,
  /** Above landmark haze (y≈0.025) so leftover mist stacks quietly under beacon. */
  hazeY: 0.04,
  /** Slower than landmark (3400) / spawn flash so continuous mist stays glanceable. */
  pulsePeriodMs: 4600,
} as const;

export interface BuildBoardAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft build-board atmosphere leftover fields (PL200.1).
 * Always-on while build board is mounted on player_land — not empty-beacon-gated
 * (soft-mode yards can still place; landmark alone covers empty beacon rim).
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Warm timber mist fields; `show` false off player land.
 */
export function buildBoardAtmosphereCue(
  landKind?: string | null,
): BuildBoardAtmosphereCueVisual {
  const c = BUILD_BOARD_ATMOSPHERE_CUE;
  if (!landKind || !isPlayerLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeRadius: c.hazeRadius,
      hazeY: c.hazeY,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeRadius: c.hazeRadius,
    hazeY: c.hazeY,
  };
}

/**
 * Soft sine envelope for build-board atmosphere leftover (PL200.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function buildBoardAtmospherePulseEnvelope(nowMs: number): number {
  const period = BUILD_BOARD_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the build-board atmosphere leftover (PL200.1).
 *
 * @param pulseEnvelope - 0..1 from `buildBoardAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function buildBoardAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = BUILD_BOARD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under a build board (PL200.1).
 *
 * @param pulseEnvelope - 0..1 from `buildBoardAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function buildBoardAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = BUILD_BOARD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}
