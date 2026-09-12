/**
 * Visual cue configs part 15/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isCityLandKind,
  isPlayerLandKind
} from "./catalog-buildings.js";
import { PROCESS_STATION_WORKING_EMISSIVE } from "./catalog-cues-01.js";
import {
  CITY_SCARCE_STATION_FREE_CUE,
  cityScarceLandmarkCueHidden,
  cityScarceStationFloorChromeVisible,
} from "./catalog-cues-02.js";
import { CITY_FISHING_DOCK_LANDMARK_CUE } from "./catalog-cues-14.js";
import { FISHING_DOCK_READY_WATER_SHIMMER } from "./catalog-cues-27.js";

/**
 * RGB distance between City dock landmark and ready water shimmer (PL169.1).
 *
 * @returns Soft distinct cool so continuous landmark ≠ catch-ready shimmer.
 */
export function cityFishingDockLandmarkVsReadyShimmerContrast(): number {
  return cssHexRgbDistance(
    CITY_FISHING_DOCK_LANDMARK_CUE.emissive,
    FISHING_DOCK_READY_WATER_SHIMMER.waterEmissive,
  );
}

/**
 * RGB distance between City dock landmark and sticky Free pad (PL169.1).
 *
 * @returns Soft distinct cool so dock water landmark ≠ Free sticky cyan.
 */
export function cityFishingDockLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_FISHING_DOCK_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * Quiet cool pulsing water mist over existing fishing dock on City or player
 * land (PL190.2) — complements City dock landmark PL169.1 + ready shimmer
 * PL118.2. Catch rates unchanged; mute ok. Continuous leftover (not
 * ready-gated). Distinct wider/slower/quieter mist — not a duplicate of
 * `CITY_FISHING_DOCK_LANDMARK_CUE` (City kinship covered by leftover layer).
 */
export const FISHING_DOCK_ATMOSPHERE_CUE = {
  /** Quiet cool slate-water — ≠ landmark #3e7a92 / ready shimmer #6ab0d0 / Free sticky. */
  emissive: "#2e6478",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#182830",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than City landmark disc (1.05) so leftover mist reads as dock-zone atmosphere. */
  hazeRadius: 1.48,
  /** Above landmark haze (y=0.01) so leftover mist stacks quietly. */
  hazeY: 0.028,
  /** Slower than landmark (3600) so continuous mist stays glanceable. */
  pulsePeriodMs: 4600,
} as const;

export interface FishingDockAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft fishing-dock atmosphere leftover fields (PL190.2).
 * Always-on while dock is mounted on City or player_land — not ready-gated.
 *
 * @param landKind - Active map; cue on City or player_land.
 * @returns Cool water mist fields; `show` false off those maps.
 */
export function fishingDockAtmosphereCue(
  landKind?: string | null,
): FishingDockAtmosphereCueVisual {
  const c = FISHING_DOCK_ATMOSPHERE_CUE;
  const kind = landKind ? String(landKind) : "";
  if (!kind || (!isCityLandKind(kind) && !isPlayerLandKind(kind))) {
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
 * Soft sine envelope for fishing-dock atmosphere leftover (PL190.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function fishingDockAtmospherePulseEnvelope(nowMs: number): number {
  const period = FISHING_DOCK_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the fishing-dock atmosphere leftover (PL190.2).
 *
 * @param pulseEnvelope - 0..1 from `fishingDockAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function fishingDockAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = FISHING_DOCK_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under a fishing dock (PL190.2).
 *
 * @param pulseEnvelope - 0..1 from `fishingDockAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function fishingDockAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = FISHING_DOCK_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between dock leftover mist and City landmark (PL190.2).
 *
 * @returns Soft distinct cool so leftover mist ≠ landmark alone.
 */
export function fishingDockAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    FISHING_DOCK_ATMOSPHERE_CUE.emissive,
    CITY_FISHING_DOCK_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between dock leftover mist and ready shimmer (PL190.2).
 *
 * @returns Soft distinct cool so leftover mist ≠ catch-ready shimmer alone.
 */
export function fishingDockAtmosphereVsReadyShimmerContrast(): number {
  return cssHexRgbDistance(
    FISHING_DOCK_ATMOSPHERE_CUE.emissive,
    FISHING_DOCK_READY_WATER_SHIMMER.waterEmissive,
  );
}

/**
 * Soft City loom landmark cue leftover (PL169.2).
 * Quiet warm thread haze/emissive on existing city scarce loom while on City —
 * complements weave craft cues + Free/Busy pads; recipes unchanged; mute ok.
 * Always-on City identity (not working-glow / interact-gated).
 */
export const CITY_LOOM_LANDMARK_CUE = {
  /** Quiet warm thread gold — ≠ working #c89840 / warp walk-up #c8b070. */
  emissive: "#a88850",
  intensityBase: 0.05,
  intensityPeak: 0.15,
  hazeColor: "#5a4828",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeRadius: 1.08,
  /** Slower than working glow so continuous landmark stays glanceable. */
  pulsePeriodMs: 3500,
} as const;

export interface CityLoomLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City loom landmark fields (PL169.2).
 * Always-on while a scarce loom mesh is mounted on City — not craft-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm thread haze fields; `show` false off City.
 */
export function cityLoomLandmarkCue(
  landKind?: string | null,
): CityLoomLandmarkCueVisual {
  const c = CITY_LOOM_LANDMARK_CUE;
  if (!landKind || !isCityLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeRadius: c.hazeRadius,
    };
  }
  if (!cityScarceStationFloorChromeVisible()) {
    return cityScarceLandmarkCueHidden(c);
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
 * Soft sine envelope for City loom landmark pulse (PL169.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityLoomLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_LOOM_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the City loom landmark (PL169.2).
 *
 * @param pulseEnvelope - 0..1 from `cityLoomLandmarkPulseEnvelope`.
 * @returns Emissive intensity for treadle / haze.
 */
export function cityLoomLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_LOOM_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City loom (PL169.2).
 *
 * @param pulseEnvelope - 0..1 from `cityLoomLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityLoomLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_LOOM_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City loom landmark and process working glow (PL169.2).
 *
 * @returns Soft distinct warm so continuous landmark ≠ craft working gold.
 */
export function cityLoomLandmarkVsWorkingContrast(): number {
  return cssHexRgbDistance(
    CITY_LOOM_LANDMARK_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * RGB distance between City loom landmark and sticky Free pad (PL169.2).
 *
 * @returns Soft distinct warm so thread landmark ≠ Free sticky cyan.
 */
export function cityLoomLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_LOOM_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * RGB distance between City loom and fishing-dock landmarks (PL169.2).
 *
 * @returns Soft distinct warm so loom thread ≠ dock water cool.
 */
export function cityLoomLandmarkVsFishingDockContrast(): number {
  return cssHexRgbDistance(
    CITY_LOOM_LANDMARK_CUE.emissive,
    CITY_FISHING_DOCK_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft City alchemy-bench landmark cue leftover (PL170.1).
 * Quiet cool tonic haze/emissive on existing city scarce alchemy_bench while on
 * City — complements brew cues + Free/Busy pads; recipes unchanged; mute ok.
 * Always-on City identity (not working-glow / interact-gated).
 */
export const CITY_ALCHEMY_BENCH_LANDMARK_CUE = {
  /** Cool tonic teal — ≠ working #c89840 / vessel walk-up #8ab0a0 / Free sticky. */
  emissive: "#4a8878",
  intensityBase: 0.05,
  intensityPeak: 0.15,
  hazeColor: "#2a4840",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeRadius: 1.06,
  /** Slower than working glow so continuous landmark stays glanceable. */
  pulsePeriodMs: 3550,
} as const;

export interface CityAlchemyBenchLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City alchemy-bench landmark fields (PL170.1).
 * Always-on while a scarce alchemy bench mesh is mounted on City — not craft-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool tonic haze fields; `show` false off City.
 */
export function cityAlchemyBenchLandmarkCue(
  landKind?: string | null,
): CityAlchemyBenchLandmarkCueVisual {
  const c = CITY_ALCHEMY_BENCH_LANDMARK_CUE;
  if (!landKind || !isCityLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeRadius: c.hazeRadius,
    };
  }
  if (!cityScarceStationFloorChromeVisible()) {
    return cityScarceLandmarkCueHidden(c);
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
 * Soft sine envelope for City alchemy-bench landmark pulse (PL170.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityAlchemyBenchLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_ALCHEMY_BENCH_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the City alchemy-bench landmark (PL170.1).
 *
 * @param pulseEnvelope - 0..1 from `cityAlchemyBenchLandmarkPulseEnvelope`.
 * @returns Emissive intensity for burner lip / haze.
 */
export function cityAlchemyBenchLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_ALCHEMY_BENCH_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City alchemy bench (PL170.1).
 *
 * @param pulseEnvelope - 0..1 from `cityAlchemyBenchLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityAlchemyBenchLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_ALCHEMY_BENCH_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City alchemy landmark and process working glow (PL170.1).
 *
 * @returns Soft distinct cool so continuous landmark ≠ craft working gold.
 */
export function cityAlchemyBenchLandmarkVsWorkingContrast(): number {
  return cssHexRgbDistance(
    CITY_ALCHEMY_BENCH_LANDMARK_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * RGB distance between City alchemy landmark and sticky Free pad (PL170.1).
 *
 * @returns Soft distinct cool so tonic landmark ≠ Free sticky cyan.
 */
export function cityAlchemyBenchLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_ALCHEMY_BENCH_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * RGB distance between City alchemy and fishing-dock landmarks (PL170.1).
 *
 * @returns Soft distinct tonic so alchemy ≠ dock water cool.
 */
export function cityAlchemyBenchLandmarkVsFishingDockContrast(): number {
  return cssHexRgbDistance(
    CITY_ALCHEMY_BENCH_LANDMARK_CUE.emissive,
    CITY_FISHING_DOCK_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft City animal-pen landmark cue leftover (PL170.2).
 * Quiet warm pen haze/emissive on existing city scarce animal_pen while on City —
 * complements feed/collect cues + Free/Busy pads; yields unchanged; mute ok.
 * Always-on City identity (not ready-pad / interact-gated).
 */
export const CITY_ANIMAL_PEN_LANDMARK_CUE = {
  /** Warm hay-straw amber — ≠ ready pad #7aba58 / loom thread #a88850 / Free sticky. */
  emissive: "#8a7848",
  intensityBase: 0.05,
  intensityPeak: 0.15,
  hazeColor: "#4a4028",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeRadius: 1.1,
  /** Slower than ready pad pulse so continuous landmark stays glanceable. */
  pulsePeriodMs: 3650,
} as const;
