/**
 * Visual cue configs part 23/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isCityLandKind,
  isExploreLandKind,
  isWarriorLandKind
} from "./catalog-buildings.js";
import {
  CITY_SCARCE_STATION_BUSY_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  cityScarceStationFloorChromeVisible,
} from "./catalog-cues-02.js";
import { WARRIOR_ARENA_VISUAL } from "./catalog-cues-04.js";
import { HomesteadYardAtmosphereMode, homesteadYardAtmosphereMode } from "./catalog-cues-08.js";
import { CITY_HUB_VISUAL } from "./catalog-cues-09.js";
import { EXPLORE_SECTION_LANDMARK_CUE, EXPLORE_WILDS_VISUAL } from "./catalog-cues-11.js";
import { WARRIOR_ARENA_ATMOSPHERE_CUE, WarriorArenaAtmosphereCueVisual } from "./catalog-cues-22.js";
import { ARENA_BOARD_LANDMARK_CUE } from "./catalog-cues-25.js";

/**
 * Soft Warrior arena atmosphere leftover fields (PL177.1).
 * Always-on while WarriorEnvironment is mounted — not tip / board-gated.
 *
 * @param landKind - Active map; cue only on Warrior.
 * @returns Warm arena mist fields; `show` false off Warrior.
 */
export function warriorArenaAtmosphereCue(
  landKind?: string | null,
): WarriorArenaAtmosphereCueVisual {
  const c = WARRIOR_ARENA_ATMOSPHERE_CUE;
  if (!landKind || !isWarriorLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeWidth: c.hazeWidth,
      hazeDepth: c.hazeDepth,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeWidth: c.hazeWidth,
    hazeDepth: c.hazeDepth,
  };
}

/**
 * Soft sine envelope for Warrior arena atmosphere leftover (PL177.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function warriorArenaAtmospherePulseEnvelope(nowMs: number): number {
  const period = WARRIOR_ARENA_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the Warrior arena atmosphere leftover (PL177.1).
 *
 * @param pulseEnvelope - 0..1 from `warriorArenaAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist plane.
 */
export function warriorArenaAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = WARRIOR_ARENA_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity on Warrior (PL177.1).
 *
 * @param pulseEnvelope - 0..1 from `warriorArenaAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist plane.
 */
export function warriorArenaAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = WARRIOR_ARENA_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between Warrior leftover mist and PL41.2 static haze (PL177.1).
 *
 * @returns Soft distinct warm so leftover mist ≠ static arena haze alone.
 */
export function warriorArenaAtmosphereVsStaticHazeContrast(): number {
  return cssHexRgbDistance(
    WARRIOR_ARENA_ATMOSPHERE_CUE.hazeColor,
    WARRIOR_ARENA_VISUAL.hazeColor,
  );
}

/**
 * RGB distance between Warrior leftover mist and arena-board landmark (PL177.1).
 *
 * @returns Soft distinct warm so mist ≠ board plaque cue alone.
 */
export function warriorArenaAtmosphereVsBoardLandmarkContrast(): number {
  return cssHexRgbDistance(
    WARRIOR_ARENA_ATMOSPHERE_CUE.emissive,
    ARENA_BOARD_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft City scarce-yard atmosphere leftover (PL177.2).
 * Quiet warm shared-yard mist tint/haze on existing city scarce yard floor while
 * on City — complements station landmarks + Free/Busy pads; contention unchanged;
 * mute ok. Continuous City leftover over the warm yard pad (not tip / pad-gated).
 */
export const CITY_SCARCE_YARD_ATMOSPHERE_CUE = {
  /** Warm shared-yard dust mist — ≠ floor #9a7a58 / Free cyan / Busy coral / plaza cool. */
  emissive: "#b88840",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#3a2814",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  /** Matches CityEnvironment scarce yard plane (spaced practice bays). */
  hazeWidth: 50,
  hazeDepth: 28,
  yardCenterX: 0,
  yardCenterZ: 6.6,
  hazeY: 0.1,
  /** Slower than Free/Busy peer pulses so continuous mist stays glanceable. */
  pulsePeriodMs: 4000,
} as const;

export interface CityScarceYardAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeWidth: number;
  hazeDepth: number;
  yardCenterX: number;
  yardCenterZ: number;
  hazeY: number;
}

/**
 * Soft City scarce-yard atmosphere leftover fields (PL177.2).
 * Always-on while CityEnvironment is mounted — not tip / Free/Busy-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm yard mist fields; `show` false off City.
 */
export function cityScarceYardAtmosphereCue(
  landKind?: string | null,
): CityScarceYardAtmosphereCueVisual {
  const c = CITY_SCARCE_YARD_ATMOSPHERE_CUE;
  if (!landKind || !isCityLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeWidth: c.hazeWidth,
      hazeDepth: c.hazeDepth,
      yardCenterX: c.yardCenterX,
      yardCenterZ: c.yardCenterZ,
      hazeY: c.hazeY,
    };
  }
  if (!cityScarceStationFloorChromeVisible()) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeWidth: c.hazeWidth,
      hazeDepth: c.hazeDepth,
      yardCenterX: c.yardCenterX,
      yardCenterZ: c.yardCenterZ,
      hazeY: c.hazeY,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeWidth: c.hazeWidth,
    hazeDepth: c.hazeDepth,
    yardCenterX: c.yardCenterX,
    yardCenterZ: c.yardCenterZ,
    hazeY: c.hazeY,
  };
}

/**
 * Soft sine envelope for City scarce-yard atmosphere leftover (PL177.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityScarceYardAtmospherePulseEnvelope(nowMs: number): number {
  const period = CITY_SCARCE_YARD_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the City scarce-yard atmosphere leftover (PL177.2).
 *
 * @param pulseEnvelope - 0..1 from `cityScarceYardAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist plane.
 */
export function cityScarceYardAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_SCARCE_YARD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity on the City scarce yard (PL177.2).
 *
 * @param pulseEnvelope - 0..1 from `cityScarceYardAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist plane.
 */
export function cityScarceYardAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_SCARCE_YARD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City scarce-yard leftover mist and warm yard floor (PL177.2).
 *
 * @returns Soft distinct warm so leftover mist ≠ static scarce floor alone.
 */
export function cityScarceYardAtmosphereVsFloorContrast(): number {
  return cssHexRgbDistance(
    CITY_SCARCE_YARD_ATMOSPHERE_CUE.hazeColor,
    CITY_HUB_VISUAL.scarceYardColor,
  );
}

/**
 * RGB distance between City scarce-yard leftover mist and Free pad (PL177.2).
 *
 * @returns Soft distinct warm so mist ≠ Free cyan sticky.
 */
export function cityScarceYardAtmosphereVsFreePadContrast(): number {
  return cssHexRgbDistance(
    CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.padColor,
  );
}

/**
 * RGB distance between City scarce-yard leftover mist and Busy pad (PL177.2).
 *
 * @returns Soft distinct warm so mist ≠ Busy coral sticky.
 */
export function cityScarceYardAtmosphereVsBusyPadContrast(): number {
  return cssHexRgbDistance(
    CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive,
    CITY_SCARCE_STATION_BUSY_CUE.padColor,
  );
}

/**
 * Soft Explore canopy atmosphere leftover (PL178.1).
 * Quiet cool canopy mist tint/haze while on Explore — complements woodland/mines
 * section landmarks + wilds palette; spawns unchanged; mute ok.
 * Continuous Explore leftover over PL36.2 static wilds haze (not tip-gated).
 */
export const EXPLORE_CANOPY_ATMOSPHERE_CUE = {
  /** Cool canopy mist — ≠ static haze #1a2830 / woodland teal #3a7888 / mines slate. */
  emissive: "#2a6870",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#0e1c24",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeWidth: 66,
  hazeDepth: 58,
  /** Slower than woodland/mines landmarks so continuous mist stays glanceable. */
  pulsePeriodMs: 4300,
} as const;

export interface ExploreCanopyAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeWidth: number;
  hazeDepth: number;
}

/**
 * Soft Explore canopy atmosphere leftover fields (PL178.1).
 * Always-on while ForestEnvironment is mounted — not tip / section-gated.
 *
 * @param landKind - Active map; cue only on Explore.
 * @returns Cool canopy mist fields; `show` false off Explore.
 */
export function exploreCanopyAtmosphereCue(
  landKind?: string | null,
): ExploreCanopyAtmosphereCueVisual {
  const c = EXPLORE_CANOPY_ATMOSPHERE_CUE;
  if (!landKind || !isExploreLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeWidth: c.hazeWidth,
      hazeDepth: c.hazeDepth,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeWidth: c.hazeWidth,
    hazeDepth: c.hazeDepth,
  };
}

/**
 * Soft sine envelope for Explore canopy atmosphere leftover (PL178.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function exploreCanopyAtmospherePulseEnvelope(nowMs: number): number {
  const period = EXPLORE_CANOPY_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the Explore canopy atmosphere leftover (PL178.1).
 *
 * @param pulseEnvelope - 0..1 from `exploreCanopyAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist plane.
 */
export function exploreCanopyAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EXPLORE_CANOPY_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity on Explore (PL178.1).
 *
 * @param pulseEnvelope - 0..1 from `exploreCanopyAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist plane.
 */
export function exploreCanopyAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = EXPLORE_CANOPY_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between Explore leftover mist and PL36.2 static wilds haze (PL178.1).
 *
 * @returns Soft distinct cool so leftover mist ≠ static canopy haze alone.
 */
export function exploreCanopyAtmosphereVsStaticHazeContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_CANOPY_ATMOSPHERE_CUE.hazeColor,
    EXPLORE_WILDS_VISUAL.hazeColor,
  );
}

/**
 * RGB distance between Explore leftover mist and woodland section landmark (PL178.1).
 *
 * @returns Soft distinct cool so mist ≠ woodland teal landmark alone.
 */
export function exploreCanopyAtmosphereVsWoodlandLandmarkContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_CANOPY_ATMOSPHERE_CUE.emissive,
    EXPLORE_SECTION_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft empty-homestead meadow landmark leftover (PL178.2).
 * Quiet warm empty-meadow haze/emissive on existing empty homestead outer meadow —
 * complements empty path cue + meadow contrast; layouts unchanged; mute ok.
 * Shows only while yard is still empty (before first placeable station).
 */
export const EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE = {
  /** Warm sunlit meadow gold — ≠ empty path slate / fence pewter / explore canopy cool. */
  emissive: "#c4a858",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#4a4020",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Matches HomesteadEnvironment outer meadow plane (48×40), slight inset. */
  hazeWidth: 46,
  hazeDepth: 38,
  hazeY: 0.08,
  /** Slower than empty path so continuous meadow landmark stays glanceable. */
  pulsePeriodMs: 4200,
} as const;

export interface EmptyHomesteadMeadowLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeWidth: number;
  hazeDepth: number;
  hazeY: number;
}

/**
 * Soft empty-homestead meadow landmark fields (PL178.2).
 * Shows only while yard is still empty (before first placeable station).
 *
 * @param mode - From `homesteadYardAtmosphereMode`.
 * @returns Warm meadow haze fields; `show` false once lived.
 */
export function emptyHomesteadMeadowLandmarkCue(
  mode: HomesteadYardAtmosphereMode,
): EmptyHomesteadMeadowLandmarkCueVisual {
  const c = EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE;
  if (mode !== "empty") {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeWidth: c.hazeWidth,
      hazeDepth: c.hazeDepth,
      hazeY: c.hazeY,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeWidth: c.hazeWidth,
    hazeDepth: c.hazeDepth,
    hazeY: c.hazeY,
  };
}
