/**
 * Visual cue configs part 20/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isPlayerLandKind
} from "./catalog-buildings.js";
import { PROCESS_STATION_WORKING_EMISSIVE } from "./catalog-cues-01.js";
import { CITY_ALCHEMY_BENCH_LANDMARK_CUE, CITY_LOOM_LANDMARK_CUE } from "./catalog-cues-15.js";
import { CITY_KITCHEN_LANDMARK_CUE, KITCHEN_ATMOSPHERE_CUE, KitchenAtmosphereCueVisual } from "./catalog-cues-19.js";

/**
 * Soft kitchen atmosphere leftover fields (PL193.2).
 * Always-on while kitchen is mounted on player_land — not craft-gated / not City.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Warm hearth mist fields; `show` false off player land.
 */
export function kitchenAtmosphereCue(
  landKind?: string | null,
): KitchenAtmosphereCueVisual {
  const c = KITCHEN_ATMOSPHERE_CUE;
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
 * Soft sine envelope for kitchen atmosphere leftover (PL193.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function kitchenAtmospherePulseEnvelope(nowMs: number): number {
  const period = KITCHEN_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the kitchen atmosphere leftover (PL193.2).
 *
 * @param pulseEnvelope - 0..1 from `kitchenAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function kitchenAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = KITCHEN_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under a kitchen (PL193.2).
 *
 * @param pulseEnvelope - 0..1 from `kitchenAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function kitchenAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = KITCHEN_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between kitchen leftover mist and City landmark (PL193.2).
 *
 * @returns Soft distinct stew hearth so leftover mist ≠ City warm clay landmark alone.
 */
export function kitchenAtmosphereVsCityLandmarkContrast(): number {
  return cssHexRgbDistance(
    KITCHEN_ATMOSPHERE_CUE.emissive,
    CITY_KITCHEN_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between kitchen leftover mist and craft working glow (PL193.2).
 *
 * @returns Soft distinct stew hearth so leftover mist ≠ craft working gold alone.
 */
export function kitchenAtmosphereVsWorkingContrast(): number {
  return cssHexRgbDistance(
    KITCHEN_ATMOSPHERE_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * Quiet warm pulsing thread mist over existing loom on player land (PL194.1) —
 * complements Free/Busy + craft working cues + City warm thread landmark PL169.2.
 * Recipes SoT unchanged; mute ok. Continuous leftover (not craft-gated).
 * Distinct wider/slower/quieter thread-dust mist — City kinship covered by warm
 * thread landmark alone (no second identical loom disc on City).
 */
export const LOOM_ATMOSPHERE_CUE = {
  /** Quiet deep thread dust — ≠ City landmark #a88850 / working #c89840 / kitchen stew #8a4820. */
  emissive: "#685028",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#241810",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than City landmark disc (1.08) so leftover mist reads as loom-zone atmosphere. */
  hazeRadius: 1.48,
  /** Above City landmark / Free pads (y≈0.012) so leftover mist stacks quietly. */
  hazeY: 0.03,
  /** Slower than City landmark (3500) / working (1200) so continuous mist stays glanceable. */
  pulsePeriodMs: 4700,
} as const;

export interface LoomAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft loom atmosphere leftover fields (PL194.1).
 * Always-on while loom is mounted on player_land — not craft-gated / not City.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Warm thread mist fields; `show` false off player land.
 */
export function loomAtmosphereCue(
  landKind?: string | null,
): LoomAtmosphereCueVisual {
  const c = LOOM_ATMOSPHERE_CUE;
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
 * Soft sine envelope for loom atmosphere leftover (PL194.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function loomAtmospherePulseEnvelope(nowMs: number): number {
  const period = LOOM_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the loom atmosphere leftover (PL194.1).
 *
 * @param pulseEnvelope - 0..1 from `loomAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function loomAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = LOOM_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under a loom (PL194.1).
 *
 * @param pulseEnvelope - 0..1 from `loomAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function loomAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = LOOM_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between loom leftover mist and City landmark (PL194.1).
 *
 * @returns Soft distinct thread dust so leftover mist ≠ City warm thread landmark alone.
 */
export function loomAtmosphereVsCityLandmarkContrast(): number {
  return cssHexRgbDistance(
    LOOM_ATMOSPHERE_CUE.emissive,
    CITY_LOOM_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between loom leftover mist and craft working glow (PL194.1).
 *
 * @returns Soft distinct thread dust so leftover mist ≠ craft working gold alone.
 */
export function loomAtmosphereVsWorkingContrast(): number {
  return cssHexRgbDistance(
    LOOM_ATMOSPHERE_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * Quiet cool pulsing tonic mist over existing alchemy bench on player land (PL194.2) —
 * complements Free/Busy + craft working cues + City cool tonic landmark PL170.1.
 * Recipes SoT unchanged; mute ok. Continuous leftover (not craft-gated).
 * Distinct wider/slower/quieter deep tonic mist — City kinship covered by cool
 * tonic landmark alone (no second identical alchemy disc on City).
 */
export const ALCHEMY_BENCH_ATMOSPHERE_CUE = {
  /** Quiet deep tonic teal — ≠ City landmark #4a8878 / working #c89840 / loom thread #685028. */
  emissive: "#286050",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#102820",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than City landmark disc (1.06) so leftover mist reads as alchemy-zone atmosphere. */
  hazeRadius: 1.46,
  /** Above City landmark / Free pads (y≈0.012) so leftover mist stacks quietly. */
  hazeY: 0.03,
  /** Slower than City landmark (3550) / working (1200) so continuous mist stays glanceable. */
  pulsePeriodMs: 4750,
} as const;

export interface AlchemyBenchAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft alchemy-bench atmosphere leftover fields (PL194.2).
 * Always-on while alchemy_bench is mounted on player_land — not craft-gated / not City.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Cool tonic mist fields; `show` false off player land.
 */
export function alchemyBenchAtmosphereCue(
  landKind?: string | null,
): AlchemyBenchAtmosphereCueVisual {
  const c = ALCHEMY_BENCH_ATMOSPHERE_CUE;
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
 * Soft sine envelope for alchemy-bench atmosphere leftover (PL194.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function alchemyBenchAtmospherePulseEnvelope(nowMs: number): number {
  const period = ALCHEMY_BENCH_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the alchemy-bench atmosphere leftover (PL194.2).
 *
 * @param pulseEnvelope - 0..1 from `alchemyBenchAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function alchemyBenchAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = ALCHEMY_BENCH_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under an alchemy bench (PL194.2).
 *
 * @param pulseEnvelope - 0..1 from `alchemyBenchAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function alchemyBenchAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = ALCHEMY_BENCH_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between alchemy leftover mist and City landmark (PL194.2).
 *
 * @returns Soft distinct deep tonic so leftover mist ≠ City cool tonic landmark alone.
 */
export function alchemyBenchAtmosphereVsCityLandmarkContrast(): number {
  return cssHexRgbDistance(
    ALCHEMY_BENCH_ATMOSPHERE_CUE.emissive,
    CITY_ALCHEMY_BENCH_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between alchemy leftover mist and craft working glow (PL194.2).
 *
 * @returns Soft distinct deep tonic so leftover mist ≠ craft working gold alone.
 */
export function alchemyBenchAtmosphereVsWorkingContrast(): number {
  return cssHexRgbDistance(
    ALCHEMY_BENCH_ATMOSPHERE_CUE.emissive,
    PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive,
  );
}

/**
 * Quiet warm pulsing timber mist over existing workshop on player land (PL196.1) —
 * complements Free/Busy + craft working cues + City warm timber landmark PL172.2.
 * Recipes SoT unchanged; mute ok. Continuous leftover (not craft-gated).
 * Distinct wider/slower/quieter deep timber mist — City kinship covered by warm
 * timber landmark alone (no second identical workshop disc on City).
 */
export const WORKSHOP_ATMOSPHERE_CUE = {
  /** Quiet deep carpenter timber — ≠ City landmark #966848 / working #c89840 / forge coal #702818. */
  emissive: "#583018",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#241408",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than City landmark disc (1.1) so leftover mist reads as workshop-zone atmosphere. */
  hazeRadius: 1.48,
  /** Above City landmark / Free pads (y≈0.012) so leftover mist stacks quietly. */
  hazeY: 0.03,
  /** Slower than City landmark (3550) / working (1200) so continuous mist stays glanceable. */
  pulsePeriodMs: 4700,
} as const;

export interface WorkshopAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft workshop atmosphere leftover fields (PL196.1).
 * Always-on while workshop is mounted on player_land — not craft-gated / not City.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Warm timber mist fields; `show` false off player land.
 */
export function workshopAtmosphereCue(
  landKind?: string | null,
): WorkshopAtmosphereCueVisual {
  const c = WORKSHOP_ATMOSPHERE_CUE;
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
 * Soft sine envelope for workshop atmosphere leftover (PL196.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function workshopAtmospherePulseEnvelope(nowMs: number): number {
  const period = WORKSHOP_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the workshop atmosphere leftover (PL196.1).
 *
 * @param pulseEnvelope - 0..1 from `workshopAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function workshopAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = WORKSHOP_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}
