/**
 * Visual cue configs part 16/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isCityLandKind,
  isPlayerLandKind
} from "./catalog-buildings.js";
import {
  CITY_SCARCE_STATION_FREE_CUE,
  CROP_READY_WORLD_PULSE,
  cityScarceLandmarkCueHidden,
  cityScarceStationFloorChromeVisible,
} from "./catalog-cues-02.js";
import { CITY_ANIMAL_PEN_LANDMARK_CUE, CITY_LOOM_LANDMARK_CUE } from "./catalog-cues-15.js";
import { ANIMAL_PEN_READY_PAD_PULSE } from "./catalog-cues-27.js";

export interface CityAnimalPenLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City animal-pen landmark fields (PL170.2).
 * Always-on while a scarce animal pen mesh is mounted on City — not ready-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm pen haze fields; `show` false off City.
 */
export function cityAnimalPenLandmarkCue(
  landKind?: string | null,
): CityAnimalPenLandmarkCueVisual {
  const c = CITY_ANIMAL_PEN_LANDMARK_CUE;
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
 * Soft sine envelope for City animal-pen landmark pulse (PL170.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityAnimalPenLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_ANIMAL_PEN_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the City animal-pen landmark (PL170.2).
 *
 * @param pulseEnvelope - 0..1 from `cityAnimalPenLandmarkPulseEnvelope`.
 * @returns Emissive intensity for trough / haze.
 */
export function cityAnimalPenLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_ANIMAL_PEN_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City animal pen (PL170.2).
 *
 * @param pulseEnvelope - 0..1 from `cityAnimalPenLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityAnimalPenLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_ANIMAL_PEN_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City pen landmark and ready pad emissive (PL170.2).
 *
 * @returns Soft distinct warm so continuous landmark ≠ ready pad pulse.
 */
export function cityAnimalPenLandmarkVsReadyPadContrast(): number {
  return cssHexRgbDistance(
    CITY_ANIMAL_PEN_LANDMARK_CUE.emissive,
    ANIMAL_PEN_READY_PAD_PULSE.padEmissive,
  );
}

/**
 * RGB distance between City pen landmark and sticky Free pad (PL170.2).
 *
 * @returns Soft distinct warm so pen landmark ≠ Free sticky cyan.
 */
export function cityAnimalPenLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_ANIMAL_PEN_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * RGB distance between City pen and loom landmarks (PL170.2).
 *
 * @returns Soft distinct hay so pen ≠ loom thread warm.
 */
export function cityAnimalPenLandmarkVsLoomContrast(): number {
  return cssHexRgbDistance(
    CITY_ANIMAL_PEN_LANDMARK_CUE.emissive,
    CITY_LOOM_LANDMARK_CUE.emissive,
  );
}

/**
 * Quiet warm pulsing pen mist over existing animal pen on player land (PL191.1) —
 * complements ready pad pulse PL127.1 + City landmark PL170.2. Care / cooldown
 * SoT unchanged; mute ok. Continuous leftover (not ready-gated). Distinct
 * wider/slower/quieter mist — City kinship covered by landmark alone (no second
 * identical hay disc on City).
 */
export const ANIMAL_PEN_ATMOSPHERE_CUE = {
  /** Quiet warm barn-hay — ≠ City landmark #8a7848 / ready pad #7aba58 / crop soil mist. */
  emissive: "#6a5230",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#241810",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than City landmark disc (1.1) so leftover mist reads as pen-zone atmosphere. */
  hazeRadius: 1.48,
  /** Above ready pad halo (y≈0.01) so leftover mist stacks quietly. */
  hazeY: 0.028,
  /** Slower than City landmark (3650) / ready pad (1350) so continuous mist stays glanceable. */
  pulsePeriodMs: 4500,
} as const;

export interface AnimalPenAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft animal-pen atmosphere leftover fields (PL191.1).
 * Always-on while pen is mounted on player_land — not ready-gated / not City.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Warm pen mist fields; `show` false off player land.
 */
export function animalPenAtmosphereCue(
  landKind?: string | null,
): AnimalPenAtmosphereCueVisual {
  const c = ANIMAL_PEN_ATMOSPHERE_CUE;
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
 * Soft sine envelope for animal-pen atmosphere leftover (PL191.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function animalPenAtmospherePulseEnvelope(nowMs: number): number {
  const period = ANIMAL_PEN_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the animal-pen atmosphere leftover (PL191.1).
 *
 * @param pulseEnvelope - 0..1 from `animalPenAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function animalPenAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = ANIMAL_PEN_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under an animal pen (PL191.1).
 *
 * @param pulseEnvelope - 0..1 from `animalPenAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function animalPenAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = ANIMAL_PEN_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between pen leftover mist and City landmark (PL191.1).
 *
 * @returns Soft distinct warm so leftover mist ≠ City hay landmark alone.
 */
export function animalPenAtmosphereVsCityLandmarkContrast(): number {
  return cssHexRgbDistance(
    ANIMAL_PEN_ATMOSPHERE_CUE.emissive,
    CITY_ANIMAL_PEN_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between pen leftover mist and ready pad pulse (PL191.1).
 *
 * @returns Soft distinct warm so leftover mist ≠ collect-ready green alone.
 */
export function animalPenAtmosphereVsReadyPadContrast(): number {
  return cssHexRgbDistance(
    ANIMAL_PEN_ATMOSPHERE_CUE.emissive,
    ANIMAL_PEN_READY_PAD_PULSE.padEmissive,
  );
}

/**
 * Soft City crop-plot landmark cue leftover (PL171.1).
 * Quiet warm soil haze/emissive on existing city scarce crop_plot while on City —
 * complements crop ready pulse + Free/Busy pads; grow times unchanged; mute ok.
 * Always-on City identity (not ready-pulse / growing-sway / interact-gated).
 */
export const CITY_CROP_PLOT_LANDMARK_CUE = {
  /** Warm tilled-soil amber — ≠ ready lime #a0b830 / growing #4a7030 / Free sticky. */
  emissive: "#7a6040",
  intensityBase: 0.05,
  intensityPeak: 0.14,
  hazeColor: "#3a3020",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  hazeRadius: 1.12,
  /** Slower than ready pulse so continuous landmark stays glanceable. */
  pulsePeriodMs: 3700,
} as const;

export interface CityCropPlotLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City crop-plot landmark fields (PL171.1).
 * Always-on while a scarce crop plot mesh is mounted on City — not ready-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm soil haze fields; `show` false off City.
 */
export function cityCropPlotLandmarkCue(
  landKind?: string | null,
): CityCropPlotLandmarkCueVisual {
  const c = CITY_CROP_PLOT_LANDMARK_CUE;
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
 * Soft sine envelope for City crop-plot landmark pulse (PL171.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityCropPlotLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_CROP_PLOT_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the City crop-plot landmark (PL171.1).
 *
 * @param pulseEnvelope - 0..1 from `cityCropPlotLandmarkPulseEnvelope`.
 * @returns Emissive intensity for soil bed / haze.
 */
export function cityCropPlotLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_CROP_PLOT_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City crop plot (PL171.1).
 *
 * @param pulseEnvelope - 0..1 from `cityCropPlotLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityCropPlotLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_CROP_PLOT_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City crop landmark and ready pulse (PL171.1).
 *
 * @returns Soft distinct warm so continuous landmark ≠ ready lime.
 */
export function cityCropPlotLandmarkVsReadyContrast(): number {
  return cssHexRgbDistance(
    CITY_CROP_PLOT_LANDMARK_CUE.emissive,
    CROP_READY_WORLD_PULSE.emissiveColor,
  );
}

/**
 * RGB distance between City crop landmark and sticky Free pad (PL171.1).
 *
 * @returns Soft distinct warm so soil landmark ≠ Free sticky cyan.
 */
export function cityCropPlotLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_CROP_PLOT_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * RGB distance between City crop and animal-pen landmarks (PL171.1).
 *
 * @returns Soft distinct soil so crop ≠ pen hay warm.
 */
export function cityCropPlotLandmarkVsAnimalPenContrast(): number {
  return cssHexRgbDistance(
    CITY_CROP_PLOT_LANDMARK_CUE.emissive,
    CITY_ANIMAL_PEN_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft City tree-stump landmark cue leftover (PL171.2).
 * Quiet cool woodland haze/emissive on existing city scarce tree_stump while on
 * City — complements gather ready + Free/Busy pads; yields unchanged; mute ok.
 * Always-on City identity (not ready / Explore-premium / interact-gated).
 */
export const CITY_TREE_STUMP_LANDMARK_CUE = {
  /** Cool moss woodland teal — ≠ ready top #6a8a4a / crop soil / Free sticky / dock. */
  emissive: "#3a6858",
  intensityBase: 0.05,
  intensityPeak: 0.14,
  hazeColor: "#1e3830",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  hazeRadius: 1.08,
  /** Slower than ready glance so continuous landmark stays glanceable. */
  pulsePeriodMs: 3750,
} as const;

export interface CityTreeStumpLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City tree-stump landmark fields (PL171.2).
 * Always-on while a scarce stump mesh is mounted on City — not ready-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool woodland haze fields; `show` false off City.
 */
export function cityTreeStumpLandmarkCue(
  landKind?: string | null,
): CityTreeStumpLandmarkCueVisual {
  const c = CITY_TREE_STUMP_LANDMARK_CUE;
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
 * Soft sine envelope for City tree-stump landmark pulse (PL171.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityTreeStumpLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_TREE_STUMP_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}
