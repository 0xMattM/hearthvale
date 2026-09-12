/**
 * Visual cue configs part 18/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isCityLandKind
} from "./catalog-buildings.js";
import { PROCESS_STATION_WORKING_EMISSIVE } from "./catalog-cues-01.js";
import {
  CITY_SCARCE_STATION_FREE_CUE,
  cityScarceLandmarkCueHidden,
  cityScarceStationFloorChromeVisible,
} from "./catalog-cues-02.js";
import { EXPLORE_PREMIUM_NODE_GLOW, GATHER_NODE_DEPLETED_CUE } from "./catalog-cues-03.js";
import { CITY_LOOM_LANDMARK_CUE } from "./catalog-cues-15.js";
import { CITY_ORE_NODE_LANDMARK_CUE, ORE_NODE_ATMOSPHERE_CUE } from "./catalog-cues-17.js";

/**
 * RGB distance between ore leftover mist and City landmark (PL192.1).
 *
 * @returns Soft distinct cool so leftover mist ≠ City mineral landmark alone.
 */
export function oreNodeAtmosphereVsCityLandmarkContrast(): number {
  return cssHexRgbDistance(
    ORE_NODE_ATMOSPHERE_CUE.emissive,
    CITY_ORE_NODE_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between ore leftover mist and ready rock tint (PL192.1).
 *
 * @returns Soft distinct cool so leftover mist ≠ mine-ready rock alone.
 */
export function oreNodeAtmosphereVsReadyRockContrast(): number {
  return cssHexRgbDistance(
    ORE_NODE_ATMOSPHERE_CUE.emissive,
    GATHER_NODE_DEPLETED_CUE.oreReadyRock,
  );
}

/**
 * RGB distance between ore leftover mist and Explore premium ore glow (PL192.1).
 *
 * @returns Soft distinct cool so leftover mist ≠ Explore ready premium alone.
 */
export function oreNodeAtmosphereVsExplorePremiumContrast(): number {
  return cssHexRgbDistance(
    ORE_NODE_ATMOSPHERE_CUE.emissive,
    EXPLORE_PREMIUM_NODE_GLOW.ore.emissive,
  );
}

/**
 * Soft City workshop landmark cue leftover (PL172.2).
 * Quiet warm timber haze/emissive on existing city scarce workshop while on
 * City — complements craft working cues + Free/Busy pads; recipes unchanged; mute ok.
 * Always-on City identity (not working-glow / interact-gated).
 */
export const CITY_WORKSHOP_LANDMARK_CUE = {
  /** Warm carpenter timber — ≠ working #c89840 / loom thread #a88850 / Free sticky. */
  emissive: "#966848",
  intensityBase: 0.05,
  intensityPeak: 0.15,
  hazeColor: "#4a3420",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeRadius: 1.1,
  /** Slower than working glow so continuous landmark stays glanceable. */
  pulsePeriodMs: 3550,
} as const;

export interface CityWorkshopLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City workshop landmark fields (PL172.2).
 * Always-on while a scarce workshop mesh is mounted on City — not craft-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm timber haze fields; `show` false off City.
 */
export function cityWorkshopLandmarkCue(
  landKind?: string | null,
): CityWorkshopLandmarkCueVisual {
  const c = CITY_WORKSHOP_LANDMARK_CUE;
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
 * Soft sine envelope for City workshop landmark pulse (PL172.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityWorkshopLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_WORKSHOP_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Plank / haze emissive intensity for the City workshop landmark (PL172.2).
 *
 * @param pulseEnvelope - 0..1 from `cityWorkshopLandmarkPulseEnvelope`.
 * @returns Emissive intensity for plank stack / haze.
 */
export function cityWorkshopLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_WORKSHOP_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City workshop (PL172.2).
 *
 * @param pulseEnvelope - 0..1 from `cityWorkshopLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityWorkshopLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_WORKSHOP_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City workshop landmark and working glow (PL172.2).
 *
 * @returns Soft distinct warm so continuous landmark ≠ craft working gold.
 */
export function cityWorkshopLandmarkVsWorkingContrast(): number {
  return cssHexRgbDistance(
    CITY_WORKSHOP_LANDMARK_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * RGB distance between City workshop landmark and sticky Free pad (PL172.2).
 *
 * @returns Soft distinct warm so timber landmark ≠ Free sticky cyan.
 */
export function cityWorkshopLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_WORKSHOP_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * RGB distance between City workshop and loom landmarks (PL172.2).
 *
 * @returns Soft distinct carpenter timber so workshop ≠ loom thread warm.
 */
export function cityWorkshopLandmarkVsLoomContrast(): number {
  return cssHexRgbDistance(
    CITY_WORKSHOP_LANDMARK_CUE.emissive,
    CITY_LOOM_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft City forge landmark cue leftover (PL173.1).
 * Quiet warm ember haze/emissive on existing city scarce forge while on
 * City — complements craft working cues + Free/Busy pads; recipes unchanged; mute ok.
 * Always-on City identity (not working-glow / interact-gated).
 */
export const CITY_FORGE_LANDMARK_CUE = {
  /** Warm forge ember — ≠ working #c89840 / workshop timber #966848 / Free sticky. */
  emissive: "#b85828",
  intensityBase: 0.05,
  intensityPeak: 0.15,
  hazeColor: "#4a2010",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeRadius: 1.1,
  /** Slower than working glow so continuous landmark stays glanceable. */
  pulsePeriodMs: 3600,
} as const;

export interface CityForgeLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City forge landmark fields (PL173.1).
 * Always-on while a scarce forge mesh is mounted on City — not craft-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm ember haze fields; `show` false off City.
 */
export function cityForgeLandmarkCue(
  landKind?: string | null,
): CityForgeLandmarkCueVisual {
  const c = CITY_FORGE_LANDMARK_CUE;
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
 * Soft sine envelope for City forge landmark pulse (PL173.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityForgeLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_FORGE_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Firebox-lip / haze emissive intensity for the City forge landmark (PL173.1).
 *
 * @param pulseEnvelope - 0..1 from `cityForgeLandmarkPulseEnvelope`.
 * @returns Emissive intensity for firebox lip / haze.
 */
export function cityForgeLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_FORGE_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City forge (PL173.1).
 *
 * @param pulseEnvelope - 0..1 from `cityForgeLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityForgeLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_FORGE_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City forge landmark and working glow (PL173.1).
 *
 * @returns Soft distinct warm so continuous landmark ≠ craft working gold.
 */
export function cityForgeLandmarkVsWorkingContrast(): number {
  return cssHexRgbDistance(
    CITY_FORGE_LANDMARK_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * RGB distance between City forge landmark and sticky Free pad (PL173.1).
 *
 * @returns Soft distinct warm so ember landmark ≠ Free sticky cyan.
 */
export function cityForgeLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_FORGE_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * RGB distance between City forge and workshop landmarks (PL173.1).
 *
 * @returns Soft distinct forge ember so forge ≠ workshop carpenter timber.
 */
export function cityForgeLandmarkVsWorkshopContrast(): number {
  return cssHexRgbDistance(
    CITY_FORGE_LANDMARK_CUE.emissive,
    CITY_WORKSHOP_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft City mill landmark cue leftover (PL173.2).
 * Quiet cool grain haze/emissive on existing city scarce mill while on
 * City — complements craft working cues + Free/Busy pads; recipes unchanged; mute ok.
 * Always-on City identity (not working-glow / interact-gated).
 */
export const CITY_MILL_LANDMARK_CUE = {
  /** Cool dusty grain flour — ≠ working #c89840 / forge ember #b85828 / Free sticky. */
  emissive: "#8a8860",
  intensityBase: 0.05,
  intensityPeak: 0.15,
  hazeColor: "#3a3828",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeRadius: 1.12,
  /** Slower than working glow so continuous landmark stays glanceable. */
  pulsePeriodMs: 3650,
} as const;

export interface CityMillLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City mill landmark fields (PL173.2).
 * Always-on while a scarce mill mesh is mounted on City — not craft-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool grain haze fields; `show` false off City.
 */
export function cityMillLandmarkCue(
  landKind?: string | null,
): CityMillLandmarkCueVisual {
  const c = CITY_MILL_LANDMARK_CUE;
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
 * Soft sine envelope for City mill landmark pulse (PL173.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityMillLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_MILL_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Band / haze emissive intensity for the City mill landmark (PL173.2).
 *
 * @param pulseEnvelope - 0..1 from `cityMillLandmarkPulseEnvelope`.
 * @returns Emissive intensity for mill band / haze.
 */
export function cityMillLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_MILL_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City mill (PL173.2).
 *
 * @param pulseEnvelope - 0..1 from `cityMillLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityMillLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_MILL_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City mill landmark and working glow (PL173.2).
 *
 * @returns Soft distinct cool so continuous landmark ≠ craft working gold.
 */
export function cityMillLandmarkVsWorkingContrast(): number {
  return cssHexRgbDistance(
    CITY_MILL_LANDMARK_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * RGB distance between City mill landmark and sticky Free pad (PL173.2).
 *
 * @returns Soft distinct cool so grain landmark ≠ Free sticky cyan.
 */
export function cityMillLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_MILL_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * RGB distance between City mill and forge landmarks (PL173.2).
 *
 * @returns Soft distinct cool grain so mill ≠ forge ember warm.
 */
export function cityMillLandmarkVsForgeContrast(): number {
  return cssHexRgbDistance(
    CITY_MILL_LANDMARK_CUE.emissive,
    CITY_FORGE_LANDMARK_CUE.emissive,
  );
}
