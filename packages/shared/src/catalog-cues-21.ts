/**
 * Visual cue configs part 21/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isExploreLandKind,
  isPlayerLandKind
} from "./catalog-buildings.js";
import { PROCESS_STATION_WORKING_EMISSIVE } from "./catalog-cues-01.js";
import { HUNT_TRAIL_WAYFINDING } from "./catalog-cues-03.js";
import { EXPLORE_SECTION_LANDMARK_CUE } from "./catalog-cues-11.js";
import { CITY_WORKSHOP_LANDMARK_CUE } from "./catalog-cues-18.js";
import { WORKSHOP_ATMOSPHERE_CUE, workshopAtmospherePulseEnvelope } from "./catalog-cues-20.js";
import { LIVED_HOMESTEAD_PATH_CUE } from "./catalog-cues-26.js";

/**
 * Soft leftover mist opacity under a workshop (PL196.1).
 *
 * @param pulseEnvelope - 0..1 from `workshopAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function workshopAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = WORKSHOP_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between workshop leftover mist and City landmark (PL196.1).
 *
 * @returns Soft distinct deep timber so leftover mist ≠ City warm timber landmark alone.
 */
export function workshopAtmosphereVsCityLandmarkContrast(): number {
  return cssHexRgbDistance(
    WORKSHOP_ATMOSPHERE_CUE.emissive,
    CITY_WORKSHOP_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between workshop leftover mist and craft working glow (PL196.1).
 *
 * @returns Soft distinct deep timber so leftover mist ≠ craft working gold alone.
 */
export function workshopAtmosphereVsWorkingContrast(): number {
  return cssHexRgbDistance(
    WORKSHOP_ATMOSPHERE_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * Soft Explore game-trail landmark cue leftover (PL174.2).
 * Quiet warm trail haze/emissive on existing Explore game_trail while on
 * Explore — complements hunt tip + ready cues; hunt rates unchanged; mute ok.
 * Always-on Explore identity (not ready / interact-gated).
 */
export const EXPLORE_TRAIL_LANDMARK_CUE = {
  /** Warm packed-path amber — ≠ hunt pad ready #a88840 / woodland teal #3a7888 / Free sticky. */
  emissive: "#c49850",
  intensityBase: 0.05,
  intensityPeak: 0.15,
  hazeColor: "#4a3820",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeRadius: 1.18,
  /** Slower than hunt ready pad so continuous landmark stays glanceable. */
  pulsePeriodMs: 3750,
} as const;

export interface ExploreTrailLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft Explore game-trail landmark fields (PL174.2).
 * Always-on while a game_trail mesh is mounted on Explore — not hunt-ready-gated.
 *
 * @param landKind - Active map; cue only on Explore.
 * @returns Warm trail haze fields; `show` false off Explore.
 */
export function exploreTrailLandmarkCue(
  landKind?: string | null,
): ExploreTrailLandmarkCueVisual {
  const c = EXPLORE_TRAIL_LANDMARK_CUE;
  if (!landKind || !isExploreLandKind(String(landKind))) {
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
 * Soft sine envelope for Explore trail landmark pulse (PL174.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function exploreTrailLandmarkPulseEnvelope(nowMs: number): number {
  const period = EXPLORE_TRAIL_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Curb / haze emissive intensity for the Explore trail landmark (PL174.2).
 *
 * @param pulseEnvelope - 0..1 from `exploreTrailLandmarkPulseEnvelope`.
 * @returns Emissive intensity for trail curb / haze.
 */
export function exploreTrailLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EXPLORE_TRAIL_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under an Explore game_trail (PL174.2).
 *
 * @param pulseEnvelope - 0..1 from `exploreTrailLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function exploreTrailLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = EXPLORE_TRAIL_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between Explore trail landmark and hunt ready pad (PL174.2).
 *
 * @returns Soft distinct warm so continuous landmark ≠ ready pad amber.
 */
export function exploreTrailLandmarkVsHuntPadContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_TRAIL_LANDMARK_CUE.emissive,
    HUNT_TRAIL_WAYFINDING.trail.padEmissive,
  );
}

/**
 * RGB distance between Explore trail landmark and woodland section (PL174.2).
 *
 * @returns Soft distinct warm so trail ≠ woodland teal-mist.
 */
export function exploreTrailLandmarkVsWoodlandContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_TRAIL_LANDMARK_CUE.emissive,
    EXPLORE_SECTION_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft Explore edge-thicket landmark cue leftover (PL175.1).
 * Quiet cool thicket haze/emissive on existing Explore edge_thicket while on
 * Explore — complements hunt tip + ready cues; hunt rates unchanged; mute ok.
 * Always-on Explore identity (not ready / interact-gated).
 */
export const EXPLORE_THICKET_LANDMARK_CUE = {
  /** Cool leaf-moss — ≠ hunt thicket pad mauve #704858 / trail warm #c49850 / woodland teal. */
  emissive: "#4a8a70",
  intensityBase: 0.05,
  intensityPeak: 0.14,
  hazeColor: "#1a3028",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeRadius: 1.28,
  /** Slower than hunt ready pad so continuous landmark stays glanceable. */
  pulsePeriodMs: 3900,
} as const;

export interface ExploreThicketLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft Explore edge-thicket landmark fields (PL175.1).
 * Always-on while an edge_thicket mesh is mounted on Explore — not hunt-ready-gated.
 *
 * @param landKind - Active map; cue only on Explore.
 * @returns Cool thicket haze fields; `show` false off Explore.
 */
export function exploreThicketLandmarkCue(
  landKind?: string | null,
): ExploreThicketLandmarkCueVisual {
  const c = EXPLORE_THICKET_LANDMARK_CUE;
  if (!landKind || !isExploreLandKind(String(landKind))) {
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
 * Soft sine envelope for Explore thicket landmark pulse (PL175.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function exploreThicketLandmarkPulseEnvelope(nowMs: number): number {
  const period = EXPLORE_THICKET_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Curb / haze emissive intensity for the Explore thicket landmark (PL175.1).
 *
 * @param pulseEnvelope - 0..1 from `exploreThicketLandmarkPulseEnvelope`.
 * @returns Emissive intensity for thicket curb / haze.
 */
export function exploreThicketLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EXPLORE_THICKET_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under an Explore edge_thicket (PL175.1).
 *
 * @param pulseEnvelope - 0..1 from `exploreThicketLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function exploreThicketLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = EXPLORE_THICKET_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between Explore thicket landmark and hunt thicket ready pad (PL175.1).
 *
 * @returns Soft distinct cool so continuous landmark ≠ ready pad mauve.
 */
export function exploreThicketLandmarkVsHuntPadContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_THICKET_LANDMARK_CUE.emissive,
    HUNT_TRAIL_WAYFINDING.thicket.padEmissive,
  );
}

/**
 * RGB distance between Explore thicket landmark and trail landmark (PL175.1).
 *
 * @returns Soft distinct cool so thicket ≠ trail warm amber.
 */
export function exploreThicketLandmarkVsTrailContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_THICKET_LANDMARK_CUE.emissive,
    EXPLORE_TRAIL_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between Explore thicket landmark and woodland section (PL175.1).
 *
 * @returns Soft distinct cool so thicket ≠ woodland teal-mist.
 */
export function exploreThicketLandmarkVsWoodlandContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_THICKET_LANDMARK_CUE.emissive,
    EXPLORE_SECTION_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft housing-decor landmark cue leftover (PL176.1).
 * Quiet warm decor haze/emissive on existing housing decor_pad / placed decor
 * while on player land — complements decor tip + place rim; costs / slots
 * unchanged; mute ok. Always-on player-land identity (not tip-gated).
 */
export const HOUSING_DECOR_LANDMARK_CUE = {
  /** Warm rosewood blush — ≠ tip gold #c4b07a / lived path amber / Free cyan. */
  emissive: "#c89878",
  intensityBase: 0.05,
  intensityPeak: 0.14,
  hazeColor: "#3a2820",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeRadius: 0.72,
  /** Slower than walk-up tip flash so continuous landmark stays glanceable. */
  pulsePeriodMs: 3800,
} as const;

export interface HousingDecorLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft housing-decor landmark fields (PL176.1).
 * Always-on while a decor pad / planter / banner is mounted on player land.
 *
 * @param landKind - Active map; cue only on player land.
 * @returns Warm decor haze fields; `show` false off player land.
 */
export function housingDecorLandmarkCue(
  landKind?: string | null,
): HousingDecorLandmarkCueVisual {
  const c = HOUSING_DECOR_LANDMARK_CUE;
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
 * Soft sine envelope for housing-decor landmark pulse (PL176.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function housingDecorLandmarkPulseEnvelope(nowMs: number): number {
  const period = HOUSING_DECOR_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Lip / haze emissive intensity for the housing-decor landmark (PL176.1).
 *
 * @param pulseEnvelope - 0..1 from `housingDecorLandmarkPulseEnvelope`.
 * @returns Emissive intensity for decor lip / haze.
 */
export function housingDecorLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = HOUSING_DECOR_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under housing decor (PL176.1).
 *
 * @param pulseEnvelope - 0..1 from `housingDecorLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function housingDecorLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = HOUSING_DECOR_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between housing-decor landmark and walk-up tip gold (PL176.1).
 *
 * @returns Soft distinct warm so continuous landmark ≠ tip flash alone.
 */
export function housingDecorLandmarkVsWalkUpTipContrast(): number {
  return cssHexRgbDistance(HOUSING_DECOR_LANDMARK_CUE.emissive, "#c4b07a");
}

/**
 * RGB distance between housing-decor landmark and lived path amber (PL176.1).
 *
 * @returns Soft distinct warm so decor ≠ lived path cue alone.
 */
export function housingDecorLandmarkVsLivedPathContrast(): number {
  return cssHexRgbDistance(
    HOUSING_DECOR_LANDMARK_CUE.emissive,
    LIVED_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * Soft housing-decor atmosphere leftover (PL201.1).
 * Quiet warm pulsing rosewood mist over existing decor pads / placed decor while
 * on player land — complements landmark PL176.1 + place flash PL149.2.
 * Decor costs SoT unchanged; mute ok. Continuous leftover on player land.
 * Distinct wider/slower/quieter mist — warm landmark stays identity rim.
 */
export const HOUSING_DECOR_ATMOSPHERE_CUE = {
  /** Quiet warm deep rosewood — ≠ landmark #c89878 / tip #c4b07a / place #a8786c / build #684828. */
  emissive: "#583020",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#241410",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Wider than landmark disc (0.72) so leftover mist reads as decor-zone atmosphere. */
  hazeRadius: 0.98,
  /** Above landmark haze (y≈0.01) so leftover mist stacks quietly under tip flash. */
  hazeY: 0.028,
  /** Slower than landmark (3800) / tip flash so continuous mist stays glanceable. */
  pulsePeriodMs: 4800,
} as const;

export interface HousingDecorAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}
