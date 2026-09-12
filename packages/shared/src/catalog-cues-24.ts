/**
 * Visual cue configs part 24/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance
} from "./catalog-buildings.js";
import { HomesteadYardAtmosphereMode, HomesteadYardPresence, homesteadYardAtmosphereMode } from "./catalog-cues-08.js";
import { VISIT_LAND_ATMOSPHERE_CUE, homesteadYardPresenceFor } from "./catalog-cues-09.js";
import { EXPLORE_WILDS_VISUAL } from "./catalog-cues-11.js";
import { EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE } from "./catalog-cues-23.js";
import {
  EMPTY_HOMESTEAD_PATH_CUE,
  LIVED_HOMESTEAD_CHIMNEY_CUE,
  LIVED_HOMESTEAD_PATH_CUE,
} from "./catalog-cues-26.js";

/**
 * Soft sine envelope for empty-homestead meadow landmark (PL178.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function emptyHomesteadMeadowLandmarkPulseEnvelope(nowMs: number): number {
  const period = EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Meadow floor emissive intensity while the yard is empty (PL178.2).
 *
 * @param pulseEnvelope - 0..1 from `emptyHomesteadMeadowLandmarkPulseEnvelope`.
 * @returns Emissive intensity for the outer meadow mesh.
 */
export function emptyHomesteadMeadowLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity over the empty outer meadow (PL178.2).
 *
 * @param pulseEnvelope - 0..1 from `emptyHomesteadMeadowLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze plane.
 */
export function emptyHomesteadMeadowLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } =
    EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between empty-meadow landmark and empty path slate (PL178.2).
 *
 * @returns Soft distinct warm so meadow ≠ empty path leftover alone.
 */
export function emptyHomesteadMeadowLandmarkVsEmptyPathContrast(): number {
  return cssHexRgbDistance(
    EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.emissive,
    EMPTY_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * RGB distance between empty-meadow landmark and explore cool canopy (PL178.2).
 *
 * @returns Soft distinct warm so empty meadow ≠ Explore canopy alone.
 */
export function emptyHomesteadMeadowLandmarkVsExploreCanopyContrast(): number {
  return cssHexRgbDistance(
    EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.emissive,
    EXPLORE_WILDS_VISUAL.canopyColor,
  );
}

/**
 * Soft lived-homestead atmosphere leftover (PL181.1).
 * Quiet warm hearth-yard mist tint/haze while yard is lived on home land —
 * complements chimney PL118.1 + lived path PL142.1 + empty meadow / visit mist
 * leftovers; layouts unchanged; mute ok. Continuous lived-home leftover
 * (not tip-gated); quiet on empty and while visiting.
 */
export const LIVED_HOMESTEAD_ATMOSPHERE_CUE = {
  /** Warm hearth-yard dust — ≠ path amber / chimney orange / empty meadow gold / visit cool. */
  emissive: "#9a6030",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#2c180c",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Matches HomesteadEnvironment plot plane (18×16), slight inset. */
  hazeWidth: 17,
  hazeDepth: 15,
  hazeY: 0.1,
  /** Slower than path / chimney so continuous mist stays glanceable. */
  pulsePeriodMs: 4300,
} as const;

export interface LivedHomesteadAtmosphereCueVisual {
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
 * Soft lived-homestead atmosphere leftover fields (PL181.1).
 * Shows only while yard is lived on home presence — empty / visit stay quiet.
 *
 * @param mode - From `homesteadYardAtmosphereMode`.
 * @param presence - From `homesteadYardPresenceFor`; visit keeps cool mist PL175.2.
 * @returns Warm yard mist fields; `show` false when empty or visiting.
 */
export function livedHomesteadAtmosphereCue(
  mode: HomesteadYardAtmosphereMode,
  presence: HomesteadYardPresence = "home",
): LivedHomesteadAtmosphereCueVisual {
  const c = LIVED_HOMESTEAD_ATMOSPHERE_CUE;
  if (mode !== "lived" || presence !== "home") {
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

/**
 * Soft sine envelope for lived-homestead atmosphere leftover (PL181.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function livedHomesteadAtmospherePulseEnvelope(nowMs: number): number {
  const period = LIVED_HOMESTEAD_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the lived-homestead atmosphere leftover (PL181.1).
 *
 * @param pulseEnvelope - 0..1 from `livedHomesteadAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist plane.
 */
export function livedHomesteadAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = LIVED_HOMESTEAD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity while the yard is lived at home (PL181.1).
 *
 * @param pulseEnvelope - 0..1 from `livedHomesteadAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist plane.
 */
export function livedHomesteadAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = LIVED_HOMESTEAD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between lived yard mist and lived path amber (PL181.1).
 *
 * @returns Soft distinct warm so yard mist ≠ path cue alone.
 */
export function livedHomesteadAtmosphereVsLivedPathContrast(): number {
  return cssHexRgbDistance(
    LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive,
    LIVED_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * RGB distance between lived yard mist and chimney hearth (PL181.1).
 *
 * @returns Soft distinct warm so yard mist ≠ chimney alone.
 */
export function livedHomesteadAtmosphereVsChimneyContrast(): number {
  return cssHexRgbDistance(
    LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive,
    LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyEmissive,
  );
}

/**
 * RGB distance between lived yard mist and visit cool leftover (PL181.1).
 *
 * @returns Soft distinct warm so home lived mist ≠ visit mist alone.
 */
export function livedHomesteadAtmosphereVsVisitMistContrast(): number {
  return cssHexRgbDistance(
    LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive,
    VISIT_LAND_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * Soft homestead shed landmark leftover (PL181.2).
 * Quiet warm shed footing/haze/emissive on the existing homestead shed while
 * lived at home — complements chimney PL118.1 + yard mist PL181.1; no station
 * invent; layouts unchanged; mute ok. Continuous lived-home leftover
 * (not tip-gated); quiet on empty.
 */
export const HOMESTEAD_SHED_LANDMARK_CUE = {
  /** Warm barn-sill honey — ≠ chimney orange / yard mist / path amber / build timber. */
  emissive: "#c09858",
  intensityBase: 0.05,
  intensityPeak: 0.14,
  hazeColor: "#2a1c10",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Fits HomesteadYardShed sill (~2.35×1.95) without inventing pads. */
  hazeRadius: 1.35,
  /** Slower than chimney / path; apart from yard mist period. */
  pulsePeriodMs: 3900,
} as const;

export interface HomesteadShedLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft homestead shed landmark fields (PL181.2).
 * Shows only while yard is lived on home presence — empty stays quiet.
 *
 * @param mode - From `homesteadYardAtmosphereMode`.
 * @param presence - From `homesteadYardPresenceFor`; visit keeps shed quiet vs home.
 * @returns Warm shed footing/haze fields; `show` false when empty or visiting.
 */
export function homesteadShedLandmarkCue(
  mode: HomesteadYardAtmosphereMode,
  presence: HomesteadYardPresence = "home",
): HomesteadShedLandmarkCueVisual {
  const c = HOMESTEAD_SHED_LANDMARK_CUE;
  if (mode !== "lived" || presence !== "home") {
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
 * Soft sine envelope for homestead shed landmark pulse (PL181.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function homesteadShedLandmarkPulseEnvelope(nowMs: number): number {
  const period = HOMESTEAD_SHED_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the homestead shed landmark (PL181.2).
 *
 * @param pulseEnvelope - 0..1 from `homesteadShedLandmarkPulseEnvelope`.
 * @returns Emissive intensity for shed sill footing / haze.
 */
export function homesteadShedLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = HOMESTEAD_SHED_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under the homestead shed footing (PL181.2).
 *
 * @param pulseEnvelope - 0..1 from `homesteadShedLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function homesteadShedLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = HOMESTEAD_SHED_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between shed landmark and chimney hearth (PL181.2).
 *
 * @returns Soft distinct warm so shed footing ≠ chimney alone.
 */
export function homesteadShedLandmarkVsChimneyContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_SHED_LANDMARK_CUE.emissive,
    LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyEmissive,
  );
}

/**
 * RGB distance between shed landmark and lived yard mist (PL181.2).
 *
 * @returns Soft distinct warm so shed footing ≠ yard mist alone.
 */
export function homesteadShedLandmarkVsAtmosphereContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_SHED_LANDMARK_CUE.emissive,
    LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * RGB distance between shed landmark and lived path amber (PL181.2).
 *
 * @returns Soft distinct warm so shed footing ≠ path cue alone.
 */
export function homesteadShedLandmarkVsLivedPathContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_SHED_LANDMARK_CUE.emissive,
    LIVED_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * Soft homestead-shed atmosphere leftover (PL202.1).
 * Quiet warm pulsing barn mist over existing lived shed while yard lived at home —
 * complements shed landmark PL181.2 + chimney PL118.1 + yard mist PL181.1.
 * Layouts SoT unchanged; mute ok. Continuous lived-home leftover (not tip-gated);
 * quiet on empty / visit. Distinct wider/slower/quieter mist — warm landmark stays
 * identity rim on sill footing.
 */
export const HOMESTEAD_SHED_ATMOSPHERE_CUE = {
  /** Quiet warm deep barn — ≠ landmark #c09858 / chimney #c87840 / yard mist #9a6030 / path #b88848 / decor #583020 / board #684828. */
  emissive: "#704020",
  intensityBase: 0.03,
  intensityPeak: 0.095,
  hazeColor: "#241408",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Wider than landmark disc (1.35) so leftover mist reads as shed-zone atmosphere. */
  hazeRadius: 1.78,
  /** Above landmark haze (y≈0.02) so leftover mist stacks quietly under chimney plume. */
  hazeY: 0.045,
  /** Slower than landmark (3900) / chimney plume so continuous mist stays glanceable. */
  pulsePeriodMs: 4900,
} as const;

export interface HomesteadShedAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft homestead-shed atmosphere leftover fields (PL202.1).
 * Shows only while yard is lived on home presence — empty / visit stay quiet.
 * Landmark stays identity rim; leftover mist keeps shed glanceable.
 *
 * @param mode - From `homesteadYardAtmosphereMode`.
 * @param presence - From `homesteadYardPresenceFor`; visit keeps shed quiet vs home.
 * @returns Warm barn mist fields; `show` false when empty or visiting.
 */
export function homesteadShedAtmosphereCue(
  mode: HomesteadYardAtmosphereMode,
  presence: HomesteadYardPresence = "home",
): HomesteadShedAtmosphereCueVisual {
  const c = HOMESTEAD_SHED_ATMOSPHERE_CUE;
  if (mode !== "lived" || presence !== "home") {
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
 * Soft sine envelope for homestead-shed atmosphere leftover (PL202.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function homesteadShedAtmospherePulseEnvelope(nowMs: number): number {
  const period = HOMESTEAD_SHED_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the homestead-shed atmosphere leftover (PL202.1).
 *
 * @param pulseEnvelope - 0..1 from `homesteadShedAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function homesteadShedAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = HOMESTEAD_SHED_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}
