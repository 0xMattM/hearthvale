/**
 * Visual cue configs part 12/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  LandKind,
  cssHexRgbDistance,
  isCityLandKind,
  isExploreLandKind
} from "./catalog-buildings.js";
import { CITY_COMMERCE_SERVICE_PAD } from "./catalog-cues-04.js";
import { CITY_MARKET_BOARD_LANDMARK_CUE, EXPLORE_MINES_LANDMARK_CUE, EXPLORE_VENDOR_LANDMARK_CUE } from "./catalog-cues-11.js";

/**
 * Soft City vendor stall landmark cue (PL151.1).
 * Quiet warm stall haze/emissive on the existing City vendor so hub NPC trade
 * reads at glance — complements Explore stall PL141.2 + market board PL150.2
 * + commerce pad PL117.1. Prices / layouts unchanged; no stall invent.
 */
export const CITY_VENDOR_LANDMARK_CUE = {
  /** Warm hub honey-copper — stall kinship, ≠ Explore amber / market parchment. */
  emissive: "#d0a050",
  intensityBase: 0.1,
  intensityPeak: 0.28,
  hazeColor: "#b88840",
  hazeOpacityBase: 0.07,
  hazeOpacityPeak: 0.18,
  hazeRadius: 1.4,
  pulsePeriodMs: 3100,
} as const;

export interface ExploreVendorLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

export interface CityMarketBoardLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

export interface CityVendorLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft Explore vendor landmark fields for VendorStall (PL141.2).
 * Always-on while on Explore — regional trade identity, not buy/sell gated.
 *
 * @param landKind - Active map; cue only on Explore.
 * @returns Warm stall haze fields; `show` false off Explore.
 */
export function exploreVendorLandmarkCue(
  landKind: LandKind | string,
): ExploreVendorLandmarkCueVisual {
  const c = EXPLORE_VENDOR_LANDMARK_CUE;
  if (!isExploreLandKind(landKind)) {
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
 * Soft sine envelope for Explore vendor stall landmark pulse (PL141.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function exploreVendorLandmarkPulseEnvelope(nowMs: number): number {
  const period = EXPLORE_VENDOR_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Pad / lantern emissive intensity for the Explore vendor landmark (PL141.2).
 *
 * @param pulseEnvelope - 0..1 from `exploreVendorLandmarkPulseEnvelope`.
 * @returns Emissive intensity for stall pad / haze.
 */
export function exploreVendorLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EXPLORE_VENDOR_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under the Explore vendor stall (PL141.2).
 *
 * @param pulseEnvelope - 0..1 from `exploreVendorLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function exploreVendorLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = EXPLORE_VENDOR_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between Explore vendor landmark and city commerce pad (PL141.2).
 *
 * @returns Soft distinct warmth so Explore stall ≠ City commerce pad alone.
 */
export function exploreVendorLandmarkVsCityCommerceContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_VENDOR_LANDMARK_CUE.emissive,
    CITY_COMMERCE_SERVICE_PAD.vendor.padColor,
  );
}

/**
 * RGB distance between Explore vendor landmark and mines stone cue (PL141.2).
 *
 * @returns Contrast so warm stall ≠ cooler mines stone.
 */
export function exploreVendorLandmarkVsMinesContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_VENDOR_LANDMARK_CUE.emissive,
    EXPLORE_MINES_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft City market board landmark fields (PL150.2).
 * Always-on while on City — hub listing identity, not buy/sell gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm board haze fields; `show` false off City.
 */
export function cityMarketBoardLandmarkCue(
  landKind: LandKind | string,
): CityMarketBoardLandmarkCueVisual {
  const c = CITY_MARKET_BOARD_LANDMARK_CUE;
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
 * Soft sine envelope for City market board landmark pulse (PL150.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityMarketBoardLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_MARKET_BOARD_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Pad / board emissive intensity for the City market landmark (PL150.2).
 *
 * @param pulseEnvelope - 0..1 from `cityMarketBoardLandmarkPulseEnvelope`.
 * @returns Emissive intensity for board pad / haze.
 */
export function cityMarketBoardLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_MARKET_BOARD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under the City market board (PL150.2).
 *
 * @param pulseEnvelope - 0..1 from `cityMarketBoardLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityMarketBoardLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_MARKET_BOARD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City market landmark and Explore vendor stall (PL150.2).
 *
 * @returns Soft distinct warmth so City board ≠ Explore stall.
 */
export function cityMarketBoardLandmarkVsExploreVendorContrast(): number {
  return cssHexRgbDistance(
    CITY_MARKET_BOARD_LANDMARK_CUE.emissive,
    EXPLORE_VENDOR_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between City market landmark and market commerce pad (PL150.2).
 *
 * @returns Soft distinct warmth so continuous landmark ≠ static pad alone.
 */
export function cityMarketBoardLandmarkVsCommercePadContrast(): number {
  return cssHexRgbDistance(
    CITY_MARKET_BOARD_LANDMARK_CUE.emissive,
    CITY_COMMERCE_SERVICE_PAD.market.padColor,
  );
}

/**
 * Soft City market-board atmosphere leftover (PL186.2).
 * Quiet warm pulsing parchment mist over existing market board pad while on
 * City — complements board landmark PL150.2 + commerce pad PL117.1. Prices /
 * layouts unchanged; mute ok. Continuous City leftover (not buy/sell gated).
 */
export const CITY_MARKET_BOARD_ATMOSPHERE_CUE = {
  /** Quiet warm parchment ash — ≠ landmark #d4b060 / Explore stall / commerce pad. */
  emissive: "#a88848",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#2a2010",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than landmark disc (1.35) so leftover mist reads as board-zone atmosphere. */
  hazeRadius: 1.72,
  /** Above landmark haze (y=0.035) so leftover mist stacks quietly. */
  hazeY: 0.052,
  /** Slower than landmark (3200) so continuous mist stays glanceable. */
  pulsePeriodMs: 4200,
} as const;

export interface CityMarketBoardAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft City market-board atmosphere leftover fields (PL186.2).
 * Always-on while market board is mounted on City — not buy/sell gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm parchment mist fields; `show` false off City.
 */
export function cityMarketBoardAtmosphereCue(
  landKind?: string | null,
): CityMarketBoardAtmosphereCueVisual {
  const c = CITY_MARKET_BOARD_ATMOSPHERE_CUE;
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
 * Soft sine envelope for City market-board atmosphere leftover (PL186.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityMarketBoardAtmospherePulseEnvelope(nowMs: number): number {
  const period = CITY_MARKET_BOARD_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the City market-board atmosphere leftover (PL186.2).
 *
 * @param pulseEnvelope - 0..1 from `cityMarketBoardAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function cityMarketBoardAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_MARKET_BOARD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity on the City market board pad (PL186.2).
 *
 * @param pulseEnvelope - 0..1 from `cityMarketBoardAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function cityMarketBoardAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_MARKET_BOARD_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between market-board leftover mist and board landmark (PL186.2).
 *
 * @returns Soft distinct warm so leftover mist ≠ landmark parchment alone.
 */
export function cityMarketBoardAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive,
    CITY_MARKET_BOARD_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between market-board leftover mist and commerce pad (PL186.2).
 *
 * @returns Soft distinct warm so leftover mist ≠ static pad alone.
 */
export function cityMarketBoardAtmosphereVsCommercePadContrast(): number {
  return cssHexRgbDistance(
    CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive,
    CITY_COMMERCE_SERVICE_PAD.market.padColor,
  );
}

/**
 * RGB distance between market-board leftover mist and Explore vendor (PL186.2).
 *
 * @returns Soft distinct warm so City board mist ≠ Explore stall alone.
 */
export function cityMarketBoardAtmosphereVsExploreVendorContrast(): number {
  return cssHexRgbDistance(
    CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive,
    EXPLORE_VENDOR_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft City vendor landmark fields for VendorStall (PL151.1).
 * Always-on while on City — hub NPC trade identity, not buy/sell gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Warm stall haze fields; `show` false off City.
 */
export function cityVendorLandmarkCue(
  landKind: LandKind | string,
): CityVendorLandmarkCueVisual {
  const c = CITY_VENDOR_LANDMARK_CUE;
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
 * Soft sine envelope for City vendor stall landmark pulse (PL151.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityVendorLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_VENDOR_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Pad / lantern emissive intensity for the City vendor landmark (PL151.1).
 *
 * @param pulseEnvelope - 0..1 from `cityVendorLandmarkPulseEnvelope`.
 * @returns Emissive intensity for stall pad / haze.
 */
export function cityVendorLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_VENDOR_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under the City vendor stall (PL151.1).
 *
 * @param pulseEnvelope - 0..1 from `cityVendorLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityVendorLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_VENDOR_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}
