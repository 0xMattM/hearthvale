/**
 * Visual cue configs part 27/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance
} from "./catalog-buildings.js";
import { HomesteadYardAtmosphereMode, HomesteadYardPresence, homesteadYardAtmosphereMode } from "./catalog-cues-08.js";
import { homesteadYardPresenceFor } from "./catalog-cues-09.js";
import { EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE } from "./catalog-cues-23.js";
import { HOMESTEAD_SHED_ATMOSPHERE_CUE, LIVED_HOMESTEAD_ATMOSPHERE_CUE } from "./catalog-cues-24.js";
import { EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE, EMPTY_HOMESTEAD_PATH_CUE, LIVED_HOMESTEAD_PATH_CUE } from "./catalog-cues-26.js";

/**
 * Soft sine envelope for empty-homestead path atmosphere leftover (PL200.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function emptyHomesteadPathAtmospherePulseEnvelope(
  nowMs: number,
): number {
  const period = EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the empty-homestead path atmosphere leftover (PL200.2).
 *
 * @param pulseEnvelope - 0..1 from `emptyHomesteadPathAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist plane.
 */
export function emptyHomesteadPathAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity over the empty yard path (PL200.2).
 *
 * @param pulseEnvelope - 0..1 from `emptyHomesteadPathAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist plane.
 */
export function emptyHomesteadPathAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } =
    EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between empty path leftover mist and empty path cue (PL200.2).
 *
 * @returns Soft distinct cool so leftover mist ≠ path emissive alone.
 */
export function emptyHomesteadPathAtmosphereVsPathCueContrast(): number {
  return cssHexRgbDistance(
    EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive,
    EMPTY_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * RGB distance between empty path leftover mist and meadow landmark (PL200.2).
 *
 * @returns Soft distinct cool so path mist ≠ warm meadow landmark alone.
 */
export function emptyHomesteadPathAtmosphereVsMeadowLandmarkContrast(): number {
  return cssHexRgbDistance(
    EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive,
    EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between empty path leftover mist and lived path amber (PL200.2).
 *
 * @returns Soft distinct cool so empty path mist ≠ lived warm path alone.
 */
export function emptyHomesteadPathAtmosphereVsLivedPathContrast(): number {
  return cssHexRgbDistance(
    EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive,
    LIVED_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * Soft lived-homestead path atmosphere leftover (PL202.2).
 * Quiet warm pulsing path mist over lived-yard path/cross while yard lived at home —
 * complements path cue PL142.1 + yard mist PL181.1; layouts SoT unchanged; mute ok.
 * Continuous lived-home leftover (not tip-gated); quiet on empty / visit.
 * Distinct wider/slower/quieter mist — warm path cue stays identity emissive.
 */
export const LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE = {
  /** Quiet warm path dust — ≠ path cue #b88848 / yard mist #9a6030 / shed barn #704020 / empty path cool #3a5060. */
  emissive: "#805830",
  intensityBase: 0.025,
  intensityPeak: 0.085,
  hazeColor: "#201408",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Covers the HomesteadEnvironment path-cross zone (~2.2×12 + 10×1.6). */
  hazeWidth: 11,
  hazeDepth: 13,
  /** Above path meshes (y≈−0.05); below yard mist plane (y≈0.1). */
  hazeY: 0.055,
  /** Slower than lived path cue (3200) / yard mist (4300) so leftover mist stays glanceable. */
  pulsePeriodMs: 4800,
} as const;

export interface LivedHomesteadPathAtmosphereCueVisual {
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
 * Soft lived-homestead path atmosphere leftover fields (PL202.2).
 * Shows only while yard is lived on home presence — empty / visit stay quiet.
 *
 * @param mode - From `homesteadYardAtmosphereMode`.
 * @param presence - From `homesteadYardPresenceFor`; visit keeps path mist quiet vs home.
 * @returns Warm path mist fields; `show` false when empty or visiting.
 */
export function livedHomesteadPathAtmosphereCue(
  mode: HomesteadYardAtmosphereMode,
  presence: HomesteadYardPresence = "home",
): LivedHomesteadPathAtmosphereCueVisual {
  const c = LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE;
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
 * Soft sine envelope for lived-homestead path atmosphere leftover (PL202.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function livedHomesteadPathAtmospherePulseEnvelope(
  nowMs: number,
): number {
  const period = LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the lived-homestead path atmosphere leftover (PL202.2).
 *
 * @param pulseEnvelope - 0..1 from `livedHomesteadPathAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist plane.
 */
export function livedHomesteadPathAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity over the lived yard path (PL202.2).
 *
 * @param pulseEnvelope - 0..1 from `livedHomesteadPathAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist plane.
 */
export function livedHomesteadPathAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } =
    LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between lived path leftover mist and lived path cue (PL202.2).
 *
 * @returns Soft distinct warm so leftover mist ≠ path emissive alone.
 */
export function livedHomesteadPathAtmosphereVsPathCueContrast(): number {
  return cssHexRgbDistance(
    LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive,
    LIVED_HOMESTEAD_PATH_CUE.emissive,
  );
}

/**
 * RGB distance between lived path leftover mist and yard mist (PL202.2).
 *
 * @returns Soft distinct warm so path mist ≠ yard mist alone.
 */
export function livedHomesteadPathAtmosphereVsYardMistContrast(): number {
  return cssHexRgbDistance(
    LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive,
    LIVED_HOMESTEAD_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * RGB distance between lived path leftover mist and shed barn leftover (PL202.2).
 *
 * @returns Soft distinct warm so path mist ≠ shed barn mist alone.
 */
export function livedHomesteadPathAtmosphereVsShedAtmosphereContrast(): number {
  return cssHexRgbDistance(
    LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive,
    HOMESTEAD_SHED_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * RGB distance between lived path leftover mist and empty path leftover (PL202.2).
 *
 * @returns Soft distinct warm so lived path mist ≠ empty cool path mist alone.
 */
export function livedHomesteadPathAtmosphereVsEmptyPathAtmosphereContrast(): number {
  return cssHexRgbDistance(
    LIVED_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive,
    EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * Soft water / pad shimmer when a fishing dock is catch-ready (PL118.2).
 * Complements world Ready label (PL30.1) and TopBar ready edge (PL65.2).
 * Cooldown / catch rates unchanged; mute ok.
 */
export const FISHING_DOCK_READY_WATER_SHIMMER = {
  waterColor: "#5a9aba",
  waterEmissive: "#6ab0d0",
  intensityBase: 0.18,
  intensityPeak: 0.46,
  shimmerPeriodMs: 1400,
  padColor: "#4a8aaa",
  padOpacity: 0.3,
} as const;

export interface FishingDockReadyWaterShimmerVisual {
  show: boolean;
  waterColor: string;
  waterEmissive: string;
  intensity: number;
  padColor: string;
  padOpacity: number;
}

/**
 * Soft ready water shimmer fields for FishingDockBuilding (PL118.2).
 * Quiet while cooling; ready docks get pad + emissive for glanceable catch.
 *
 * @param ready - True when `readyAt` is null or elapsed.
 * @returns Pad / water emissive fields for the dock mesh.
 */
export function fishingDockReadyWaterShimmer(
  ready: boolean,
): FishingDockReadyWaterShimmerVisual {
  const c = FISHING_DOCK_READY_WATER_SHIMMER;
  if (!ready) {
    return {
      show: false,
      waterColor: c.waterColor,
      waterEmissive: c.waterEmissive,
      intensity: 0,
      padColor: c.padColor,
      padOpacity: 0,
    };
  }
  return {
    show: true,
    waterColor: c.waterColor,
    waterEmissive: c.waterEmissive,
    intensity: c.intensityBase,
    padColor: c.padColor,
    padOpacity: c.padOpacity,
  };
}

/**
 * Soft sine envelope for fishing-dock ready water shimmer (PL118.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function fishingDockReadyShimmerEnvelope(nowMs: number): number {
  const period = FISHING_DOCK_READY_WATER_SHIMMER.shimmerPeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Water emissive intensity while a fishing dock is catch-ready (PL118.2).
 * Cooling docks stay quiet (0); ready oscillates between base and peak.
 *
 * @param ready - True when the dock can be cast now.
 * @param shimmerEnvelope - 0..1 from `fishingDockReadyShimmerEnvelope`.
 * @returns Emissive intensity for the water pad mesh.
 */
export function fishingDockReadyWaterEmissiveIntensity(
  ready: boolean,
  shimmerEnvelope: number,
): number {
  if (!ready) return 0;
  const { intensityBase, intensityPeak } = FISHING_DOCK_READY_WATER_SHIMMER;
  const e = Math.min(1, Math.max(0, shimmerEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft pad / emissive pulse while an animal pen is collect-ready (PL127.1).
 * Complements world Ready label (PL30.2) and TopBar ready edge (PL69.2).
 * Cooldown / rates unchanged; mute ok — kinship with dock shimmer PL118.2.
 */
export const ANIMAL_PEN_READY_PAD_PULSE = {
  padColor: "#6a9a4a",
  padEmissive: "#7aba58",
  intensityBase: 0.16,
  intensityPeak: 0.42,
  pulsePeriodMs: 1350,
  padOpacity: 0.32,
} as const;

export interface AnimalPenReadyPadPulseVisual {
  show: boolean;
  padColor: string;
  padEmissive: string;
  intensity: number;
  padOpacity: number;
}

/**
 * Soft ready pad pulse fields for AnimalPenBuilding (PL127.1).
 * Quiet while cooling; ready pens get pad + emissive for glanceable care.
 *
 * @param ready - True when `readyAt` is null or elapsed.
 * @returns Pad / emissive fields for the pen mesh.
 */
export function animalPenReadyPadPulse(
  ready: boolean,
): AnimalPenReadyPadPulseVisual {
  const c = ANIMAL_PEN_READY_PAD_PULSE;
  if (!ready) {
    return {
      show: false,
      padColor: c.padColor,
      padEmissive: c.padEmissive,
      intensity: 0,
      padOpacity: 0,
    };
  }
  return {
    show: true,
    padColor: c.padColor,
    padEmissive: c.padEmissive,
    intensity: c.intensityBase,
    padOpacity: c.padOpacity,
  };
}

/**
 * Soft sine envelope for animal-pen ready pad pulse (PL127.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function animalPenReadyPadPulseEnvelope(nowMs: number): number {
  const period = ANIMAL_PEN_READY_PAD_PULSE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Pad emissive intensity while an animal pen is collect-ready (PL127.1).
 * Cooling pens stay quiet (0); ready oscillates between base and peak.
 *
 * @param ready - True when the pen can be cared now.
 * @param pulseEnvelope - 0..1 from `animalPenReadyPadPulseEnvelope`.
 * @returns Emissive intensity for the pen pad mesh.
 */
export function animalPenReadyPadEmissiveIntensity(
  ready: boolean,
  pulseEnvelope: number,
): number {
  if (!ready) return 0;
  const { intensityBase, intensityPeak } = ANIMAL_PEN_READY_PAD_PULSE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * After first land craft — nudge City Vendor / Market list (CL21.1).
 * One-shot onboarding copy; dismissible; not an always-on HUD column.
 *
 * @returns One-line tip copy.
 */
export function postCraftMarketTip(): string {
  return "First craft done — travel to City (N / Portal) to sell at the Vendor or list on the Market board.";
}

/**
 * Explore mats feed land/city crafts (CL21.2 / CL24.3 / CL30.1 / CL31.2) — notice board only.
 * Tip id `explore_mats_craft` stays stable; body notes woodland wood + mine ore + dual hunt XP.
 *
 * @returns Player-facing tip body for the notice board.
 */
export function exploreMatsCraftChainTip(): string {
  return (
    "Leather, boar tusks, wood, and ore from Explore feed land and city crafts — " +
    "weave cloth, cook stew, carpenter planks, and forge bars. " +
    "Chop Woodland stumps and chip Mines ore on Explore, then craft at a loom, kitchen, workshop, or forge. " +
    "Game Trail hunts grant Animal Hunter XP; Edge Thicket hunts grant Monster Hunter XP " +
    "(neither grants Cook XP); cook the meat at a Kitchen for Cook XP."
  );
}

/**
 * Catch fish → cook at Kitchen (CL25.3) — notice board + kitchen craft panel.
 * Tip id `fish_to_kitchen` stays stable; city river spot or land dock both OK.
 *
 * @returns Player-facing tip body.
 */
export function fishToKitchenTip(): string {
  return (
    "Catch fish at the city river (or a Fishing Dock on Your Land), then cook them at a Kitchen " +
    "for cooked fish and Cook XP. City kitchen is shared; build unlimited kitchens on Your Land."
  );
}
