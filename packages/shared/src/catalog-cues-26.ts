/**
 * Visual cue configs part 26/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance
} from "./catalog-buildings.js";
import { BUILD_PLACE_SPAWN_FLASH } from "./catalog-cues-01.js";
import { HOMESTEAD_YARD_VISUAL, HomesteadYardAtmosphereMode, homesteadYardAtmosphereMode } from "./catalog-cues-08.js";
import { EXPLORE_WILDS_VISUAL } from "./catalog-cues-11.js";
import { WORKSHOP_ATMOSPHERE_CUE } from "./catalog-cues-20.js";
import { BUILD_BOARD_ATMOSPHERE_CUE, EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE } from "./catalog-cues-25.js";

/**
 * RGB distance between build leftover mist and empty-land landmark (PL200.1).
 *
 * @returns Soft distinct warm timber so leftover mist ≠ landmark rim alone.
 */
export function buildBoardAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    BUILD_BOARD_ATMOSPHERE_CUE.emissive,
    EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between build leftover mist and place spawn flash (PL200.1).
 *
 * @returns Soft distinct warm timber so leftover mist ≠ one-shot spawn amber alone.
 */
export function buildBoardAtmosphereVsSpawnFlashContrast(): number {
  return cssHexRgbDistance(
    BUILD_BOARD_ATMOSPHERE_CUE.emissive,
    BUILD_PLACE_SPAWN_FLASH.emissiveColor,
  );
}

/**
 * RGB distance between build leftover mist and workshop leftover (PL200.1).
 *
 * @returns Soft distinct board timber so place mist ≠ workshop carpenter mist alone.
 */
export function buildBoardAtmosphereVsWorkshopAtmosphereContrast(): number {
  return cssHexRgbDistance(
    BUILD_BOARD_ATMOSPHERE_CUE.emissive,
    WORKSHOP_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * RGB distance between empty-home outer meadow and explore cool canopy (PL114.1).
 *
 * @returns Contrast empty homestead meadow vs explore canopy.
 */
export function emptyHomesteadVsExploreMeadowContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_YARD_VISUAL.empty.meadowColor,
    EXPLORE_WILDS_VISUAL.canopyColor,
  );
}

/**
 * RGB distance between empty-home fence posts and outer meadow (PL114.1).
 *
 * @returns Fence readability contrast on empty yards.
 */
export function emptyHomesteadFenceVsMeadowContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_YARD_VISUAL.empty.fencePostColor,
    HOMESTEAD_YARD_VISUAL.empty.meadowColor,
  );
}

/**
 * RGB distance between empty and lived home outer meadows (PL114.1).
 * Empty stays sunlit-warm; lived keeps quieter olive after first station.
 *
 * @returns Contrast empty vs lived outer meadow.
 */
export function emptyVsLivedHomesteadMeadowContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_YARD_VISUAL.empty.meadowColor,
    HOMESTEAD_YARD_VISUAL.meadowColor,
  );
}

/**
 * Quiet chimney / roof plume when the homestead has lived stations (PL118.1).
 * Soft emissive stack + translucent plume on the existing shed — no new buildings.
 * Complements empty meadow contrast (PL114.1) and lived yard pad (PL22.1).
 * Build rules / empty-land beacon unchanged.
 */
export const LIVED_HOMESTEAD_CHIMNEY_CUE = {
  chimneyColor: "#4a3830",
  chimneyEmissive: "#c87840",
  /** Steady lived chimney emissive floor. */
  chimneyIntensityBase: 0.18,
  /** Soft pulse peak — quiet hearth, not a strobe. */
  chimneyIntensityPeak: 0.4,
  plumeColor: "#a09890",
  plumeOpacityBase: 0.1,
  plumeOpacityPeak: 0.26,
  /** Slow plume drift period. */
  plumePeriodMs: 2400,
} as const;

export interface LivedHomesteadChimneyCueVisual {
  show: boolean;
  chimneyColor: string;
  chimneyEmissive: string;
  chimneyIntensity: number;
  plumeColor: string;
  plumeOpacity: number;
}

/**
 * Soft chimney cue fields for HomesteadEnvironment shed (PL118.1).
 * Shows only after first placeable station (`lived`); empty yards stay quiet.
 * Visit presence keeps the cue so guest yards with stations still read lived-in.
 *
 * @param mode - From `homesteadYardAtmosphereMode`.
 * @returns Chimney / plume fields; `show` false while empty.
 */
export function livedHomesteadChimneyCue(
  mode: HomesteadYardAtmosphereMode,
): LivedHomesteadChimneyCueVisual {
  const c = LIVED_HOMESTEAD_CHIMNEY_CUE;
  if (mode !== "lived") {
    return {
      show: false,
      chimneyColor: c.chimneyColor,
      chimneyEmissive: c.chimneyEmissive,
      chimneyIntensity: 0,
      plumeColor: c.plumeColor,
      plumeOpacity: 0,
    };
  }
  return {
    show: true,
    chimneyColor: c.chimneyColor,
    chimneyEmissive: c.chimneyEmissive,
    chimneyIntensity: c.chimneyIntensityBase,
    plumeColor: c.plumeColor,
    plumeOpacity: c.plumeOpacityBase,
  };
}

/**
 * Soft sine envelope for lived-homestead chimney plume (PL118.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function livedHomesteadChimneyPlumeEnvelope(nowMs: number): number {
  const period = LIVED_HOMESTEAD_CHIMNEY_CUE.plumePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Chimney emissive intensity while the yard is lived (PL118.1).
 * Empty yards stay dark (0); lived oscillates between base and peak.
 *
 * @param show - True when `livedHomesteadChimneyCue(...).show`.
 * @param plumeEnvelope - 0..1 from `livedHomesteadChimneyPlumeEnvelope`.
 * @returns Emissive intensity for the chimney stack mesh.
 */
export function livedHomesteadChimneyEmissiveIntensity(
  show: boolean,
  plumeEnvelope: number,
): number {
  if (!show) return 0;
  const { chimneyIntensityBase, chimneyIntensityPeak } =
    LIVED_HOMESTEAD_CHIMNEY_CUE;
  const e = Math.min(1, Math.max(0, plumeEnvelope));
  return (
    chimneyIntensityBase + e * (chimneyIntensityPeak - chimneyIntensityBase)
  );
}

/**
 * Soft plume opacity while the yard is lived (PL118.1).
 *
 * @param show - True when chimney cue is active.
 * @param plumeEnvelope - 0..1 from `livedHomesteadChimneyPlumeEnvelope`.
 * @returns Opacity for the roof plume spheres.
 */
export function livedHomesteadChimneyPlumeOpacity(
  show: boolean,
  plumeEnvelope: number,
): number {
  if (!show) return 0;
  const { plumeOpacityBase, plumeOpacityPeak } = LIVED_HOMESTEAD_CHIMNEY_CUE;
  const e = Math.min(1, Math.max(0, plumeEnvelope));
  return plumeOpacityBase + e * (plumeOpacityPeak - plumeOpacityBase);
}

/**
 * Quiet warmer emissive on the existing lived yard path/cross (PL142.1).
 * Lived yards read apart from empty meadow PL114.1 — complements chimney PL118.1.
 * Layouts / slots unchanged; mute ok; empty uses cooler leftover (PL154.1).
 */
export const LIVED_HOMESTEAD_PATH_CUE = {
  /** Warm path amber — quieter than chimney hearth; ≠ empty dirt. */
  emissive: "#b88848",
  intensityBase: 0.08,
  intensityPeak: 0.2,
  pulsePeriodMs: 3200,
} as const;

export interface LivedHomesteadPathCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
}

/**
 * Soft path/cross cue fields for HomesteadEnvironment (PL142.1).
 * Shows only after first placeable station (`lived`); empty yards stay quiet.
 *
 * @param mode - From `homesteadYardAtmosphereMode`.
 * @returns Path emissive fields; `show` false while empty.
 */
export function livedHomesteadPathCue(
  mode: HomesteadYardAtmosphereMode,
): LivedHomesteadPathCueVisual {
  const c = LIVED_HOMESTEAD_PATH_CUE;
  if (mode !== "lived") {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
  };
}

/**
 * Soft sine envelope for lived-homestead path cue (PL142.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function livedHomesteadPathPulseEnvelope(nowMs: number): number {
  const period = LIVED_HOMESTEAD_PATH_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Path cross emissive intensity while the yard is lived (PL142.1).
 * Empty yards stay dark (0); lived oscillates between base and peak.
 *
 * @param show - True when `livedHomesteadPathCue(...).show`.
 * @param pulseEnvelope - 0..1 from `livedHomesteadPathPulseEnvelope`.
 * @returns Emissive intensity for the dirt path/cross meshes.
 */
export function livedHomesteadPathEmissiveIntensity(
  show: boolean,
  pulseEnvelope: number,
): number {
  if (!show) return 0;
  const { intensityBase, intensityPeak } = LIVED_HOMESTEAD_PATH_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * RGB distance between lived path cue and empty meadow (PL142.1).
 *
 * @returns Contrast so warm path ≠ empty sunlit meadow.
 */
export function livedHomesteadPathVsEmptyMeadowContrast(): number {
  return cssHexRgbDistance(
    LIVED_HOMESTEAD_PATH_CUE.emissive,
    HOMESTEAD_YARD_VISUAL.empty.meadowColor,
  );
}

/**
 * RGB distance between lived path cue and chimney hearth (PL142.1).
 *
 * @returns Contrast so path amber ≠ chimney orange (related but distinct).
 */
export function livedHomesteadPathVsChimneyContrast(): number {
  return cssHexRgbDistance(
    LIVED_HOMESTEAD_PATH_CUE.emissive,
    LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyEmissive,
  );
}

/**
 * Quiet cooler emissive on the existing empty yard path/cross (PL154.1).
 * Empty yards read apart from lived warm path PL142.1 — complements empty meadow PL114.1.
 * Layouts / slots unchanged; mute ok; lived keeps warmer cue.
 */
export const EMPTY_HOMESTEAD_PATH_CUE = {
  /** Cool slate-dust — quieter than lived amber; ≠ empty meadow green. */
  emissive: "#6a8090",
  intensityBase: 0.05,
  intensityPeak: 0.14,
  pulsePeriodMs: 3600,
} as const;

export interface EmptyHomesteadPathCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
}

/**
 * Soft path/cross cue fields for HomesteadEnvironment (PL154.1).
 * Shows only while yard is still empty (before first placeable station).
 *
 * @param mode - From `homesteadYardAtmosphereMode`.
 * @returns Path emissive fields; `show` false once lived.
 */
export function emptyHomesteadPathCue(
  mode: HomesteadYardAtmosphereMode,
): EmptyHomesteadPathCueVisual {
  const c = EMPTY_HOMESTEAD_PATH_CUE;
  if (mode !== "empty") {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
  };
}

/**
 * Soft sine envelope for empty-homestead path cue (PL154.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function emptyHomesteadPathPulseEnvelope(nowMs: number): number {
  const period = EMPTY_HOMESTEAD_PATH_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Path cross emissive intensity while the yard is empty (PL154.1).
 * Lived yards stay on warmer PL142.1; empty oscillates between base and peak.
 *
 * @param show - True when `emptyHomesteadPathCue(...).show`.
 * @param pulseEnvelope - 0..1 from `emptyHomesteadPathPulseEnvelope`.
 * @returns Emissive intensity for the dirt path/cross meshes.
 */
export function emptyHomesteadPathEmissiveIntensity(
  show: boolean,
  pulseEnvelope: number,
): number {
  if (!show) return 0;
  const { intensityBase, intensityPeak } = EMPTY_HOMESTEAD_PATH_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * RGB distance between empty path cue and lived path cue (PL154.1).
 *
 * @returns Contrast so cool empty path ≠ warm lived path.
 */
export function emptyHomesteadPathVsLivedPathContrast(): number {
  return cssHexRgbDistance(
    EMPTY_HOMESTEAD_PATH_CUE.emissive,
    LIVED_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * RGB distance between empty path cue and empty meadow (PL154.1).
 *
 * @returns Contrast so cool path ≠ sunlit empty meadow.
 */
export function emptyHomesteadPathVsEmptyMeadowContrast(): number {
  return cssHexRgbDistance(
    EMPTY_HOMESTEAD_PATH_CUE.emissive,
    HOMESTEAD_YARD_VISUAL.empty.meadowColor,
  );
}

/**
 * Soft empty-homestead path atmosphere leftover (PL200.2).
 * Quiet cool pulsing path mist over the empty-yard path/cross while yard empty —
 * complements meadow landmark PL178.2 + empty path cue PL154.1.
 * Layouts / slots unchanged; mute ok. Continuous empty leftover (not tip-gated);
 * quiet once lived (lived path / hearth mist cover that state).
 */
export const EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE = {
  /** Quiet cool path ash — ≠ path cue #6a8090 / meadow landmark #c4a858 / lived path / visit cool. */
  emissive: "#3a5060",
  intensityBase: 0.025,
  intensityPeak: 0.085,
  hazeColor: "#101820",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Covers the HomesteadEnvironment path-cross zone (~2.2×12 + 10×1.6). */
  hazeWidth: 11,
  hazeDepth: 13,
  /** Above path meshes (y≈−0.05); below meadow landmark haze (y≈0.08). */
  hazeY: 0.05,
  /** Slower than empty path cue (3600) / meadow landmark (4200) so leftover mist stays glanceable. */
  pulsePeriodMs: 4700,
} as const;

export interface EmptyHomesteadPathAtmosphereCueVisual {
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
 * Soft empty-homestead path atmosphere leftover fields (PL200.2).
 * Shows only while yard is still empty — lived keeps warm path / hearth mist.
 *
 * @param mode - From `homesteadYardAtmosphereMode`.
 * @returns Cool path mist fields; `show` false once lived.
 */
export function emptyHomesteadPathAtmosphereCue(
  mode: HomesteadYardAtmosphereMode,
): EmptyHomesteadPathAtmosphereCueVisual {
  const c = EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE;
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
