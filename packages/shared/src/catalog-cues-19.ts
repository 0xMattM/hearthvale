/**
 * Visual cue configs part 19/30 (RF6.4) — split from catalog.ts.
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
import { CITY_FORGE_LANDMARK_CUE, CITY_MILL_LANDMARK_CUE } from "./catalog-cues-18.js";

/**
 * Quiet warm pulsing grain mist over existing mill on player land (PL192.2) —
 * complements Free/Busy + craft working cues + City cool landmark PL173.2.
 * Recipes SoT unchanged; mute ok. Continuous leftover (not craft-gated).
 * Distinct wider/slower/quieter warm mist — City kinship covered by cool
 * landmark alone (no second identical grain disc on City).
 */
export const MILL_ATMOSPHERE_CUE = {
  /** Quiet warm mill-grain — ≠ City landmark #8a8860 / working #c89840 / Free sticky. */
  emissive: "#7a5a30",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#281810",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than City landmark disc (1.12) so leftover mist reads as mill-zone atmosphere. */
  hazeRadius: 1.5,
  /** Above City landmark / Free pads (y≈0.012) so leftover mist stacks quietly. */
  hazeY: 0.03,
  /** Slower than City landmark (3650) / working (1200) so continuous mist stays glanceable. */
  pulsePeriodMs: 4550,
} as const;

export interface MillAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft mill atmosphere leftover fields (PL192.2).
 * Always-on while mill is mounted on player_land — not craft-gated / not City.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Warm grain mist fields; `show` false off player land.
 */
export function millAtmosphereCue(
  landKind?: string | null,
): MillAtmosphereCueVisual {
  const c = MILL_ATMOSPHERE_CUE;
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
 * Soft sine envelope for mill atmosphere leftover (PL192.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function millAtmospherePulseEnvelope(nowMs: number): number {
  const period = MILL_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the mill atmosphere leftover (PL192.2).
 *
 * @param pulseEnvelope - 0..1 from `millAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function millAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = MILL_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under a mill (PL192.2).
 *
 * @param pulseEnvelope - 0..1 from `millAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function millAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = MILL_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between mill leftover mist and City landmark (PL192.2).
 *
 * @returns Soft distinct warm so leftover mist ≠ City cool grain landmark alone.
 */
export function millAtmosphereVsCityLandmarkContrast(): number {
  return cssHexRgbDistance(
    MILL_ATMOSPHERE_CUE.emissive,
    CITY_MILL_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between mill leftover mist and craft working glow (PL192.2).
 *
 * @returns Soft distinct warm so leftover mist ≠ craft working gold alone.
 */
export function millAtmosphereVsWorkingContrast(): number {
  return cssHexRgbDistance(
    MILL_ATMOSPHERE_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * Quiet warm pulsing forge mist over existing forge on player land (PL193.1) —
 * complements Free/Busy + craft working cues + City warm ember landmark PL173.1.
 * Recipes SoT unchanged; mute ok. Continuous leftover (not craft-gated).
 * Distinct wider/slower/quieter deep coal mist — City kinship covered by warm
 * ember landmark alone (no second identical forge disc on City).
 */
export const FORGE_ATMOSPHERE_CUE = {
  /** Quiet deep coal ember — ≠ City landmark #b85828 / working #c89840 / Free sticky. */
  emissive: "#702818",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#201008",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than City landmark disc (1.1) so leftover mist reads as forge-zone atmosphere. */
  hazeRadius: 1.48,
  /** Above City landmark / Free pads (y≈0.012) so leftover mist stacks quietly. */
  hazeY: 0.03,
  /** Slower than City landmark (3600) / working (1200) so continuous mist stays glanceable. */
  pulsePeriodMs: 4600,
} as const;

export interface ForgeAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft forge atmosphere leftover fields (PL193.1).
 * Always-on while forge is mounted on player_land — not craft-gated / not City.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Warm coal mist fields; `show` false off player land.
 */
export function forgeAtmosphereCue(
  landKind?: string | null,
): ForgeAtmosphereCueVisual {
  const c = FORGE_ATMOSPHERE_CUE;
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
 * Soft sine envelope for forge atmosphere leftover (PL193.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function forgeAtmospherePulseEnvelope(nowMs: number): number {
  const period = FORGE_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the forge atmosphere leftover (PL193.1).
 *
 * @param pulseEnvelope - 0..1 from `forgeAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function forgeAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = FORGE_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under a forge (PL193.1).
 *
 * @param pulseEnvelope - 0..1 from `forgeAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function forgeAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = FORGE_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between forge leftover mist and City landmark (PL193.1).
 *
 * @returns Soft distinct deep coal so leftover mist ≠ City warm ember landmark alone.
 */
export function forgeAtmosphereVsCityLandmarkContrast(): number {
  return cssHexRgbDistance(
    FORGE_ATMOSPHERE_CUE.emissive,
    CITY_FORGE_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between forge leftover mist and craft working glow (PL193.1).
 *
 * @returns Soft distinct deep coal so leftover mist ≠ craft working gold alone.
 */
export function forgeAtmosphereVsWorkingContrast(): number {
  return cssHexRgbDistance(
    FORGE_ATMOSPHERE_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * Soft City kitchen soft landmark cue leftover (PL174.1).
 * Quiet warm hearth haze/emissive on existing city scarce kitchen while on
 * City — complements craft working cues + Free/Busy pads; recipes unchanged; mute ok.
 * Always-on City identity (not working-glow / interact-gated).
 */
export const CITY_KITCHEN_LANDMARK_CUE = {
  /** Warm cook hearth clay-orange — ≠ working #c89840 / forge ember #b85828 / Free sticky. */
  emissive: "#c46828",
  intensityBase: 0.05,
  intensityPeak: 0.15,
  hazeColor: "#4a2210",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  hazeRadius: 1.05,
  /** Slower than working glow so continuous landmark stays glanceable. */
  pulsePeriodMs: 3700,
} as const;

export interface CityKitchenLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City kitchen landmark fields (PL174.1).
 * Always-on while a scarce kitchen mesh is mounted on City — not craft-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm hearth haze fields; `show` false off City.
 */
export function cityKitchenLandmarkCue(
  landKind?: string | null,
): CityKitchenLandmarkCueVisual {
  const c = CITY_KITCHEN_LANDMARK_CUE;
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
 * Soft sine envelope for City kitchen landmark pulse (PL174.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityKitchenLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_KITCHEN_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Pot-lip / haze emissive intensity for the City kitchen landmark (PL174.1).
 *
 * @param pulseEnvelope - 0..1 from `cityKitchenLandmarkPulseEnvelope`.
 * @returns Emissive intensity for pot lip / haze.
 */
export function cityKitchenLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_KITCHEN_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City kitchen (PL174.1).
 *
 * @param pulseEnvelope - 0..1 from `cityKitchenLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityKitchenLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_KITCHEN_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City kitchen landmark and working glow (PL174.1).
 *
 * @returns Soft distinct warm so continuous landmark ≠ craft working gold.
 */
export function cityKitchenLandmarkVsWorkingContrast(): number {
  return cssHexRgbDistance(
    CITY_KITCHEN_LANDMARK_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * RGB distance between City kitchen landmark and sticky Free pad (PL174.1).
 *
 * @returns Soft distinct warm so hearth landmark ≠ Free sticky cyan.
 */
export function cityKitchenLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_KITCHEN_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * RGB distance between City kitchen and forge landmarks (PL174.1).
 *
 * @returns Soft distinct cook hearth so kitchen ≠ forge ember warm.
 */
export function cityKitchenLandmarkVsForgeContrast(): number {
  return cssHexRgbDistance(
    CITY_KITCHEN_LANDMARK_CUE.emissive,
    CITY_FORGE_LANDMARK_CUE.emissive,
  );
}

/**
 * Quiet warm pulsing hearth mist over existing kitchen on player land (PL193.2) —
 * complements Free/Busy + craft working cues + City warm hearth landmark PL174.1.
 * Recipes SoT unchanged; mute ok. Continuous leftover (not craft-gated).
 * Distinct wider/slower/quieter stew-hearth mist — City kinship covered by warm
 * hearth landmark alone (no second identical kitchen disc on City).
 */
export const KITCHEN_ATMOSPHERE_CUE = {
  /** Quiet warm stew hearth — ≠ City landmark #c46828 / working #c89840 / forge coal #702818. */
  emissive: "#8a4820",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#281810",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than City landmark disc (1.05) so leftover mist reads as kitchen-zone atmosphere. */
  hazeRadius: 1.45,
  /** Above City landmark / Free pads (y≈0.012) so leftover mist stacks quietly. */
  hazeY: 0.03,
  /** Slower than City landmark (3700) / working (1200) so continuous mist stays glanceable. */
  pulsePeriodMs: 4650,
} as const;

export interface KitchenAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}
