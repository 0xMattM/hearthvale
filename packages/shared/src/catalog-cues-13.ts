/**
 * Visual cue configs part 13/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  LandKind,
  cssHexRgbDistance,
  isCityLandKind
} from "./catalog-buildings.js";
import { CITY_COMMERCE_SERVICE_PAD } from "./catalog-cues-04.js";
import { CITY_HUB_VISUAL, CITY_PLAZA_LANDMARK_CUE } from "./catalog-cues-09.js";
import { CITY_MARKET_BOARD_LANDMARK_CUE, EXPLORE_VENDOR_LANDMARK_CUE } from "./catalog-cues-11.js";
import { CITY_MARKET_BOARD_ATMOSPHERE_CUE, CITY_VENDOR_LANDMARK_CUE } from "./catalog-cues-12.js";
import { NOTICE_UNREAD_WORLD_CUE } from "./catalog-cues-28.js";

/**
 * RGB distance between City vendor landmark and Explore vendor stall (PL151.1).
 *
 * @returns Soft distinct warmth so City hub stall ≠ Explore regional amber.
 */
export function cityVendorLandmarkVsExploreVendorContrast(): number {
  return cssHexRgbDistance(
    CITY_VENDOR_LANDMARK_CUE.emissive,
    EXPLORE_VENDOR_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between City vendor landmark and City market board (PL151.1).
 *
 * @returns Soft distinct warmth so stall ≠ listing parchment.
 */
export function cityVendorLandmarkVsMarketBoardContrast(): number {
  return cssHexRgbDistance(
    CITY_VENDOR_LANDMARK_CUE.emissive,
    CITY_MARKET_BOARD_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between City vendor landmark and vendor commerce pad (PL151.1).
 *
 * @returns Soft distinct warmth so continuous landmark ≠ static pad alone.
 */
export function cityVendorLandmarkVsCommercePadContrast(): number {
  return cssHexRgbDistance(
    CITY_VENDOR_LANDMARK_CUE.emissive,
    CITY_COMMERCE_SERVICE_PAD.vendor.padColor,
  );
}

/**
 * Soft City vendor atmosphere leftover (PL187.1).
 * Quiet warm pulsing stall mist over existing City vendor pad while on City —
 * complements stall landmark PL151.1 + Explore stall PL141.2 + commerce pad
 * PL117.1. Prices / layouts unchanged; mute ok. Continuous City leftover (not
 * buy/sell gated). Distinct wider/slower/quieter mist — not a duplicate of
 * `CITY_VENDOR_LANDMARK_CUE`.
 */
export const CITY_VENDOR_ATMOSPHERE_CUE = {
  /** Quiet warm honey-ash — ≠ landmark #d0a050 / Explore amber / market mist / pad. */
  emissive: "#9a6830",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#241808",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than landmark disc (1.4) so leftover mist reads as stall-zone atmosphere. */
  hazeRadius: 1.78,
  /** Above landmark haze (y=0.035) so leftover mist stacks quietly. */
  hazeY: 0.052,
  /** Slower than landmark (3100) so continuous mist stays glanceable. */
  pulsePeriodMs: 4100,
} as const;

export interface CityVendorAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft City vendor atmosphere leftover fields (PL187.1).
 * Always-on while vendor stall is mounted on City — not buy/sell gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm stall mist fields; `show` false off City.
 */
export function cityVendorAtmosphereCue(
  landKind?: string | null,
): CityVendorAtmosphereCueVisual {
  const c = CITY_VENDOR_ATMOSPHERE_CUE;
  if (!landKind || !isCityLandKind(String(landKind))) {
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
 * Soft sine envelope for City vendor atmosphere leftover (PL187.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityVendorAtmospherePulseEnvelope(nowMs: number): number {
  const period = CITY_VENDOR_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the City vendor atmosphere leftover (PL187.1).
 *
 * @param pulseEnvelope - 0..1 from `cityVendorAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function cityVendorAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_VENDOR_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity on the City vendor pad (PL187.1).
 *
 * @param pulseEnvelope - 0..1 from `cityVendorAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function cityVendorAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_VENDOR_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between vendor leftover mist and stall landmark (PL187.1).
 *
 * @returns Soft distinct warm so leftover mist ≠ landmark honey-copper alone.
 */
export function cityVendorAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    CITY_VENDOR_ATMOSPHERE_CUE.emissive,
    CITY_VENDOR_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between vendor leftover mist and commerce pad (PL187.1).
 *
 * @returns Soft distinct warm so leftover mist ≠ static pad alone.
 */
export function cityVendorAtmosphereVsCommercePadContrast(): number {
  return cssHexRgbDistance(
    CITY_VENDOR_ATMOSPHERE_CUE.emissive,
    CITY_COMMERCE_SERVICE_PAD.vendor.padColor,
  );
}

/**
 * RGB distance between vendor leftover mist and Explore vendor (PL187.1).
 *
 * @returns Soft distinct warm so City stall mist ≠ Explore stall alone.
 */
export function cityVendorAtmosphereVsExploreVendorContrast(): number {
  return cssHexRgbDistance(
    CITY_VENDOR_ATMOSPHERE_CUE.emissive,
    EXPLORE_VENDOR_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between vendor leftover mist and market-board leftover (PL187.1).
 *
 * @returns Soft distinct warm so stall mist ≠ board parchment mist alone.
 */
export function cityVendorAtmosphereVsMarketBoardAtmosphereContrast(): number {
  return cssHexRgbDistance(
    CITY_VENDOR_ATMOSPHERE_CUE.emissive,
    CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * Soft City notice-board landmark cue (PL153.2).
 * Quiet cool civic haze/emissive on the existing city notice_board so hub
 * notices read at glance — complements unread flicker PL117.2 + tip PL36.1.
 * Layouts / tip ids unchanged; no board invent.
 */
export const CITY_NOTICE_BOARD_LANDMARK_CUE = {
  /** Cool civic slate — notice kinship, ≠ unread gold flicker / plaza cyan. */
  emissive: "#6a8898",
  intensityBase: 0.08,
  intensityPeak: 0.24,
  hazeColor: "#4a6070",
  hazeOpacityBase: 0.06,
  hazeOpacityPeak: 0.16,
  hazeRadius: 1.2,
  pulsePeriodMs: 3400,
} as const;

export interface CityNoticeBoardLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City notice-board landmark fields (PL153.2).
 * Always-on while on City — hub notice identity, not unread-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool civic haze fields; `show` false off City.
 */
export function cityNoticeBoardLandmarkCue(
  landKind: LandKind | string,
): CityNoticeBoardLandmarkCueVisual {
  const c = CITY_NOTICE_BOARD_LANDMARK_CUE;
  if (!isCityLandKind(landKind)) {
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
 * Soft sine envelope for City notice-board landmark pulse (PL153.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityNoticeBoardLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_NOTICE_BOARD_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the City notice landmark (PL153.2).
 *
 * @param pulseEnvelope - 0..1 from `cityNoticeBoardLandmarkPulseEnvelope`.
 * @returns Emissive intensity for footing / haze.
 */
export function cityNoticeBoardLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_NOTICE_BOARD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under the City notice board (PL153.2).
 *
 * @param pulseEnvelope - 0..1 from `cityNoticeBoardLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityNoticeBoardLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_NOTICE_BOARD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City notice landmark and unread gold flicker (PL153.2).
 *
 * @returns Soft distinct cool so continuous landmark ≠ unread warm accent.
 */
export function cityNoticeBoardLandmarkVsUnreadContrast(): number {
  return cssHexRgbDistance(
    CITY_NOTICE_BOARD_LANDMARK_CUE.emissive,
    NOTICE_UNREAD_WORLD_CUE.haloColor,
  );
}

/**
 * RGB distance between City notice landmark and plaza fountain (PL153.2).
 *
 * @returns Soft distinct cool so notice slate ≠ plaza cyan.
 */
export function cityNoticeBoardLandmarkVsPlazaContrast(): number {
  return cssHexRgbDistance(
    CITY_NOTICE_BOARD_LANDMARK_CUE.emissive,
    CITY_PLAZA_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between City notice landmark and civic pad (PL153.2).
 *
 * @returns Soft distinct cool so continuous landmark ≠ static civic pad alone.
 */
export function cityNoticeBoardLandmarkVsCivicPadContrast(): number {
  return cssHexRgbDistance(
    CITY_NOTICE_BOARD_LANDMARK_CUE.emissive,
    CITY_HUB_VISUAL.civicPadColor,
  );
}

/**
 * Soft City notice atmosphere leftover (PL187.2).
 * Quiet cool pulsing civic mist over existing notice board pad while on City —
 * complements board landmark PL153.2 + unread flicker PL117.2. Tip ids /
 * layouts unchanged; mute ok. Continuous City leftover (not unread-gated).
 * Distinct wider/slower/quieter mist — not a duplicate of
 * `CITY_NOTICE_BOARD_LANDMARK_CUE`.
 */
export const CITY_NOTICE_BOARD_ATMOSPHERE_CUE = {
  /** Quiet cool civic ash — ≠ landmark #6a8898 / unread gold / plaza cyan / civic pad. */
  emissive: "#3e5c6e",
  intensityBase: 0.025,
  intensityPeak: 0.09,
  hazeColor: "#101820",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Wider than landmark disc (1.2) so leftover mist reads as notice-zone atmosphere. */
  hazeRadius: 1.55,
  /** Above landmark haze (y=0.025) so leftover mist stacks quietly. */
  hazeY: 0.048,
  /** Slower than landmark (3400) so continuous mist stays glanceable. */
  pulsePeriodMs: 4400,
} as const;

export interface CityNoticeBoardAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft City notice atmosphere leftover fields (PL187.2).
 * Always-on while notice board is mounted on City — not unread-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool civic mist fields; `show` false off City.
 */
export function cityNoticeBoardAtmosphereCue(
  landKind?: string | null,
): CityNoticeBoardAtmosphereCueVisual {
  const c = CITY_NOTICE_BOARD_ATMOSPHERE_CUE;
  if (!landKind || !isCityLandKind(String(landKind))) {
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
 * Soft sine envelope for City notice atmosphere leftover (PL187.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityNoticeBoardAtmospherePulseEnvelope(nowMs: number): number {
  const period = CITY_NOTICE_BOARD_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the City notice atmosphere leftover (PL187.2).
 *
 * @param pulseEnvelope - 0..1 from `cityNoticeBoardAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function cityNoticeBoardAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_NOTICE_BOARD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity on the City notice board pad (PL187.2).
 *
 * @param pulseEnvelope - 0..1 from `cityNoticeBoardAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function cityNoticeBoardAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } =
    CITY_NOTICE_BOARD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between notice leftover mist and board landmark (PL187.2).
 *
 * @returns Soft distinct cool so leftover mist ≠ landmark slate alone.
 */
export function cityNoticeBoardAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive,
    CITY_NOTICE_BOARD_LANDMARK_CUE.emissive,
  );
}
