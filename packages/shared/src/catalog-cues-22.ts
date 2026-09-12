/**
 * Visual cue configs part 22/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isPlayerLandKind
} from "./catalog-buildings.js";
import { HOUSING_DECOR_ATMOSPHERE_CUE, HOUSING_DECOR_LANDMARK_CUE, HousingDecorAtmosphereCueVisual } from "./catalog-cues-21.js";
import { BUILD_BOARD_ATMOSPHERE_CUE } from "./catalog-cues-25.js";
import { EMPTY_HOMESTEAD_PATH_CUE, LIVED_HOMESTEAD_PATH_CUE } from "./catalog-cues-26.js";

/**
 * Soft housing-decor atmosphere leftover fields (PL201.1).
 * Always-on while a decor pad / planter / banner is mounted on player land —
 * landmark stays identity rim; leftover mist keeps decor glanceable.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Warm rosewood mist fields; `show` false off player land.
 */
export function housingDecorAtmosphereCue(
  landKind?: string | null,
): HousingDecorAtmosphereCueVisual {
  const c = HOUSING_DECOR_ATMOSPHERE_CUE;
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
 * Soft sine envelope for housing-decor atmosphere leftover (PL201.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function housingDecorAtmospherePulseEnvelope(nowMs: number): number {
  const period = HOUSING_DECOR_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the housing-decor atmosphere leftover (PL201.1).
 *
 * @param pulseEnvelope - 0..1 from `housingDecorAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function housingDecorAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = HOUSING_DECOR_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under housing decor (PL201.1).
 *
 * @param pulseEnvelope - 0..1 from `housingDecorAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function housingDecorAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = HOUSING_DECOR_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between decor leftover mist and landmark rim (PL201.1).
 *
 * @returns Soft distinct deep rosewood so leftover mist ≠ landmark rim alone.
 */
export function housingDecorAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    HOUSING_DECOR_ATMOSPHERE_CUE.emissive,
    HOUSING_DECOR_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between decor leftover mist and walk-up tip gold (PL201.1).
 *
 * @returns Soft distinct deep rosewood so leftover mist ≠ tip flash alone.
 */
export function housingDecorAtmosphereVsWalkUpTipContrast(): number {
  return cssHexRgbDistance(HOUSING_DECOR_ATMOSPHERE_CUE.emissive, "#c4b07a");
}

/**
 * RGB distance between decor leftover mist and place-reinforce mid blush (PL201.1).
 *
 * @returns Soft distinct deep rosewood so leftover mist ≠ one-shot place rim alone.
 */
export function housingDecorAtmosphereVsPlaceFlashContrast(): number {
  return cssHexRgbDistance(HOUSING_DECOR_ATMOSPHERE_CUE.emissive, "#a8786c");
}

/**
 * RGB distance between decor leftover mist and build-board leftover (PL201.1).
 *
 * @returns Soft distinct decor rosewood so decor mist ≠ board timber mist alone.
 */
export function housingDecorAtmosphereVsBuildBoardAtmosphereContrast(): number {
  return cssHexRgbDistance(
    HOUSING_DECOR_ATMOSPHERE_CUE.emissive,
    BUILD_BOARD_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * Soft homestead fence landmark cue leftover (PL176.2).
 * Quiet cool fence-post haze/emissive on existing homestead fence while on
 * player land — complements yard atmosphere + path cues; layouts unchanged;
 * mute ok. Always-on player-land boundary identity (not tip-gated).
 */
export const HOMESTEAD_FENCE_LANDMARK_CUE = {
  /** Cool pewter fence-post — ≠ decor rosewood / lived path amber / empty path slate / visit mist. */
  emissive: "#4a6a78",
  intensityBase: 0.04,
  intensityPeak: 0.12,
  hazeColor: "#1a2830",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  hazeRadius: 0.55,
  /** Slower than path cues so continuous fence landmark stays glanceable. */
  pulsePeriodMs: 4000,
} as const;

export interface HomesteadFenceLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft homestead fence landmark fields (PL176.2).
 * Always-on while the homestead fence is mounted on player land.
 *
 * @param landKind - Active map; cue only on player land.
 * @returns Cool fence-post haze fields; `show` false off player land.
 */
export function homesteadFenceLandmarkCue(
  landKind?: string | null,
): HomesteadFenceLandmarkCueVisual {
  const c = HOMESTEAD_FENCE_LANDMARK_CUE;
  if (!landKind || !isPlayerLandKind(String(landKind))) {
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
 * Soft sine envelope for homestead fence landmark pulse (PL176.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function homesteadFenceLandmarkPulseEnvelope(nowMs: number): number {
  const period = HOMESTEAD_FENCE_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Cap / haze emissive intensity for the homestead fence landmark (PL176.2).
 *
 * @param pulseEnvelope - 0..1 from `homesteadFenceLandmarkPulseEnvelope`.
 * @returns Emissive intensity for fence caps / haze.
 */
export function homesteadFenceLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = HOMESTEAD_FENCE_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under homestead fence corners (PL176.2).
 *
 * @param pulseEnvelope - 0..1 from `homesteadFenceLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function homesteadFenceLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = HOMESTEAD_FENCE_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between fence landmark and housing-decor rosewood (PL176.2).
 *
 * @returns Soft distinct cool so fence ≠ decor landmark alone.
 */
export function homesteadFenceLandmarkVsDecorContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_FENCE_LANDMARK_CUE.emissive,
    HOUSING_DECOR_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between fence landmark and lived path amber (PL176.2).
 *
 * @returns Soft distinct cool so fence ≠ lived path cue alone.
 */
export function homesteadFenceLandmarkVsLivedPathContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_FENCE_LANDMARK_CUE.emissive,
    LIVED_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * RGB distance between fence landmark and empty path slate (PL176.2).
 *
 * @returns Soft distinct cool so fence ≠ empty path leftover alone.
 */
export function homesteadFenceLandmarkVsEmptyPathContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_FENCE_LANDMARK_CUE.emissive,
    EMPTY_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * Soft homestead-fence atmosphere leftover (PL201.2).
 * Quiet cool pulsing boundary mist over existing fence while on player land —
 * complements fence landmark PL176.2 + path cues; layouts SoT unchanged; mute ok.
 * Continuous leftover on player land. Distinct wider/slower/quieter mist —
 * cool landmark stays identity rim on posts / corners.
 */
export const HOMESTEAD_FENCE_ATMOSPHERE_CUE = {
  /** Quiet cool deep boundary — ≠ landmark #4a6a78 / empty path / decor rosewood / visit mist. */
  emissive: "#2a4050",
  intensityBase: 0.025,
  intensityPeak: 0.085,
  hazeColor: "#101820",
  hazeOpacityBase: 0.03,
  hazeOpacityPeak: 0.09,
  /** Wider than landmark disc (0.55) so leftover mist reads as boundary atmosphere. */
  hazeRadius: 0.78,
  /** Above landmark haze (y≈0.012) so leftover mist stacks quietly under caps. */
  hazeY: 0.03,
  /** Slower than landmark (4000) so continuous mist stays glanceable. */
  pulsePeriodMs: 5000,
} as const;

export interface HomesteadFenceAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft homestead-fence atmosphere leftover fields (PL201.2).
 * Always-on while HomesteadEnvironment fence is mounted on player land —
 * landmark stays identity rim; leftover mist keeps boundary glanceable.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Cool boundary mist fields; `show` false off player land.
 */
export function homesteadFenceAtmosphereCue(
  landKind?: string | null,
): HomesteadFenceAtmosphereCueVisual {
  const c = HOMESTEAD_FENCE_ATMOSPHERE_CUE;
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
 * Soft sine envelope for homestead-fence atmosphere leftover (PL201.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function homesteadFenceAtmospherePulseEnvelope(nowMs: number): number {
  const period = HOMESTEAD_FENCE_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the homestead-fence atmosphere leftover (PL201.2).
 *
 * @param pulseEnvelope - 0..1 from `homesteadFenceAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function homesteadFenceAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = HOMESTEAD_FENCE_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under homestead fence (PL201.2).
 *
 * @param pulseEnvelope - 0..1 from `homesteadFenceAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function homesteadFenceAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = HOMESTEAD_FENCE_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between fence leftover mist and landmark rim (PL201.2).
 *
 * @returns Soft distinct cool boundary so leftover mist ≠ landmark rim alone.
 */
export function homesteadFenceAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_FENCE_ATMOSPHERE_CUE.emissive,
    HOMESTEAD_FENCE_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between fence leftover mist and empty path slate (PL201.2).
 *
 * @returns Soft distinct cool boundary so leftover mist ≠ empty path cue alone.
 */
export function homesteadFenceAtmosphereVsEmptyPathContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_FENCE_ATMOSPHERE_CUE.emissive,
    EMPTY_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * RGB distance between fence leftover mist and decor leftover rosewood (PL201.2).
 *
 * @returns Soft distinct cool boundary so fence mist ≠ decor mist alone.
 */
export function homesteadFenceAtmosphereVsDecorAtmosphereContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_FENCE_ATMOSPHERE_CUE.emissive,
    HOUSING_DECOR_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * RGB distance between fence leftover mist and lived path amber (PL201.2).
 *
 * @returns Soft distinct cool boundary so fence mist ≠ lived path cue alone.
 */
export function homesteadFenceAtmosphereVsLivedPathContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_FENCE_ATMOSPHERE_CUE.emissive,
    LIVED_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * Soft Warrior arena atmosphere leftover (PL177.1).
 * Quiet warm arena mist tint/haze while on Warrior — complements arena board
 * landmark + enter/leave rims; warrior optional / stub; no balance invent; mute ok.
 * Continuous Warrior leftover over PL41.2 static haze (not tip-gated).
 */
export const WARRIOR_ARENA_ATMOSPHERE_CUE = {
  /** Warm arena dust mist — ≠ static haze #502818 / board clay #c87838 / plaque red. */
  emissive: "#a85830",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#3a2010",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeWidth: 50,
  hazeDepth: 42,
  /** Slower than board landmark so continuous mist stays glanceable. */
  pulsePeriodMs: 4100,
} as const;

export interface WarriorArenaAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeWidth: number;
  hazeDepth: number;
}
