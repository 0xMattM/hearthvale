/**
 * Visual cue configs part 14/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  BuildingType,
  LandKind,
  cssHexRgbDistance,
  isCityLandKind
} from "./catalog-buildings.js";
import { CITY_HUB_VISUAL, CITY_PLAZA_LANDMARK_CUE } from "./catalog-cues-09.js";
import {
  cityScarceLandmarkCueHidden,
  cityScarceStationFloorChromeVisible,
} from "./catalog-cues-02.js";
import { CITY_NOTICE_BOARD_ATMOSPHERE_CUE, CITY_NOTICE_BOARD_LANDMARK_CUE } from "./catalog-cues-13.js";
import { NOTICE_UNREAD_WORLD_CUE } from "./catalog-cues-28.js";

/**
 * RGB distance between notice leftover mist and unread gold (PL187.2).
 *
 * @returns Soft distinct cool so leftover mist ≠ unread warm accent.
 */
export function cityNoticeBoardAtmosphereVsUnreadContrast(): number {
  return cssHexRgbDistance(
    CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive,
    NOTICE_UNREAD_WORLD_CUE.haloColor,
  );
}

/**
 * RGB distance between notice leftover mist and plaza fountain (PL187.2).
 *
 * @returns Soft distinct cool so notice mist ≠ plaza cyan alone.
 */
export function cityNoticeBoardAtmosphereVsPlazaContrast(): number {
  return cssHexRgbDistance(
    CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive,
    CITY_PLAZA_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between notice leftover mist and civic pad (PL187.2).
 *
 * @returns Soft distinct cool so leftover mist ≠ static civic pad alone.
 */
export function cityNoticeBoardAtmosphereVsCivicPadContrast(): number {
  return cssHexRgbDistance(
    CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive,
    CITY_HUB_VISUAL.civicPadColor,
  );
}

/**
 * Soft City deed-desk landmark cue leftover (PL165.1).
 * Quiet cool system slate haze/emissive on a civic atmosphere deed desk so the
 * wallet path (B / CreditcoinPanel) reads in the hub — complements open accent PL55.2.
 * Atmosphere prop only (no BuildingType / interact station); wallet path unchanged;
 * no combat / NFT power; mute ok.
 */
export const CITY_DEED_DESK_LANDMARK_CUE = {
  /** Cool system slate — deed kinship ≠ notice #6a8898 / plaza cyan / scarce amber. */
  emissive: "#5e7a8c",
  intensityBase: 0.08,
  intensityPeak: 0.24,
  hazeColor: "#3a5060",
  hazeOpacityBase: 0.06,
  hazeOpacityPeak: 0.15,
  hazeRadius: 1.05,
  pulsePeriodMs: 3500,
  /** World-space placement — inner-court flagstone, off the NE murito / column. */
  deskX: 3.4,
  deskY: 0,
  deskZ: -3.6,
  /** Soft wayfinding — B stays the wallet path (no E interact invent). */
  worldLabel: "Deed · B",
  deskTopColor: "#5a5048",
  ledgerColor: "#c8d0d6",
  legColor: "#3a342e",
} as const;

export interface CityDeedDeskLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  deskX: number;
  deskY: number;
  deskZ: number;
  worldLabel: string;
  deskTopColor: string;
  ledgerColor: string;
  legColor: string;
}

/**
 * Soft City deed-desk landmark fields (PL165.1).
 * Always-on while on City — hub wallet-path identity, not interact-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool system-slate haze fields + desk placement; `show` false off City.
 */
export function cityDeedDeskLandmarkCue(
  landKind: LandKind | string = "city",
): CityDeedDeskLandmarkCueVisual {
  const c = CITY_DEED_DESK_LANDMARK_CUE;
  if (!isCityLandKind(landKind)) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeRadius: c.hazeRadius,
      deskX: c.deskX,
      deskY: c.deskY,
      deskZ: c.deskZ,
      worldLabel: c.worldLabel,
      deskTopColor: c.deskTopColor,
      ledgerColor: c.ledgerColor,
      legColor: c.legColor,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeRadius: c.hazeRadius,
    deskX: c.deskX,
    deskY: c.deskY,
    deskZ: c.deskZ,
    worldLabel: c.worldLabel,
    deskTopColor: c.deskTopColor,
    ledgerColor: c.ledgerColor,
    legColor: c.legColor,
  };
}

/**
 * Soft sine envelope for City deed-desk landmark pulse (PL165.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityDeedDeskLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_DEED_DESK_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Desk / haze emissive intensity for the City deed-desk landmark (PL165.1).
 *
 * @param pulseEnvelope - 0..1 from `cityDeedDeskLandmarkPulseEnvelope`.
 * @returns Emissive intensity for desk top / haze.
 */
export function cityDeedDeskLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_DEED_DESK_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under the City deed desk (PL165.1).
 *
 * @param pulseEnvelope - 0..1 from `cityDeedDeskLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityDeedDeskLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_DEED_DESK_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City deed-desk landmark and notice-board slate (PL165.1).
 *
 * @returns Soft distinct cool so deed system slate ≠ notice civic slate.
 */
export function cityDeedDeskLandmarkVsNoticeContrast(): number {
  return cssHexRgbDistance(
    CITY_DEED_DESK_LANDMARK_CUE.emissive,
    CITY_NOTICE_BOARD_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between City deed-desk landmark and plaza fountain (PL165.1).
 *
 * @returns Soft distinct cool so deed slate ≠ plaza cyan.
 */
export function cityDeedDeskLandmarkVsPlazaContrast(): number {
  return cssHexRgbDistance(
    CITY_DEED_DESK_LANDMARK_CUE.emissive,
    CITY_PLAZA_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between City deed-desk landmark and warm scarce yard (PL165.1).
 *
 * @returns Soft distinct cool so hub desk ≠ scarce amber.
 */
export function cityDeedDeskLandmarkVsScarceYardContrast(): number {
  return cssHexRgbDistance(
    CITY_DEED_DESK_LANDMARK_CUE.emissive,
    CITY_HUB_VISUAL.scarceYardColor,
  );
}

/**
 * Soft City deed-desk atmosphere leftover (PL199.1).
 * Quiet cool pulsing civic mist over existing deed desk while on City —
 * complements desk landmark PL165.1 + mint/link rims. Stub / wallet-free path
 * unchanged; no NFT combat; mute ok. Continuous City leftover (not panel-gated).
 * Distinct wider/slower/quieter mist — landmark system-slate stays identity rim
 * (kinship with notice/vendor/workshop leftover discs, not a second #5e7a8c disc).
 */
export const CITY_DEED_DESK_ATMOSPHERE_CUE = {
  /** Quiet cool civic desk ash — ≠ landmark #5e7a8c / notice leftover #3e5c6e / plaza cyan. */
  emissive: "#2e4a5c",
  intensityBase: 0.025,
  intensityPeak: 0.085,
  hazeColor: "#0c141c",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Wider than landmark disc (1.05) so leftover mist reads as deed-zone atmosphere. */
  hazeRadius: 1.42,
  /** Above landmark haze (y≈0.02) so leftover mist stacks quietly. */
  hazeY: 0.04,
  /** Slower than landmark (3500) so continuous mist stays glanceable. */
  pulsePeriodMs: 4600,
} as const;

export interface CityDeedDeskAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft City deed-desk atmosphere leftover fields (PL199.1).
 * Always-on while deed desk is mounted on City — not panel / mint-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool civic mist fields; `show` false off City.
 */
export function cityDeedDeskAtmosphereCue(
  landKind?: string | null,
): CityDeedDeskAtmosphereCueVisual {
  const c = CITY_DEED_DESK_ATMOSPHERE_CUE;
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
 * Soft sine envelope for City deed-desk atmosphere leftover (PL199.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityDeedDeskAtmospherePulseEnvelope(nowMs: number): number {
  const period = CITY_DEED_DESK_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the City deed-desk atmosphere leftover (PL199.1).
 *
 * @param pulseEnvelope - 0..1 from `cityDeedDeskAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function cityDeedDeskAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_DEED_DESK_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under the City deed desk (PL199.1).
 *
 * @param pulseEnvelope - 0..1 from `cityDeedDeskAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function cityDeedDeskAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_DEED_DESK_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between deed leftover mist and desk landmark (PL199.1).
 *
 * @returns Soft distinct cool so leftover mist ≠ landmark system-slate alone.
 */
export function cityDeedDeskAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    CITY_DEED_DESK_ATMOSPHERE_CUE.emissive,
    CITY_DEED_DESK_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between deed leftover mist and notice leftover (PL199.1).
 *
 * @returns Soft distinct cool so deed mist ≠ notice civic ash alone.
 */
export function cityDeedDeskAtmosphereVsNoticeAtmosphereContrast(): number {
  return cssHexRgbDistance(
    CITY_DEED_DESK_ATMOSPHERE_CUE.emissive,
    CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * RGB distance between deed leftover mist and plaza fountain (PL199.1).
 *
 * @returns Soft distinct cool so deed mist ≠ plaza cyan alone.
 */
export function cityDeedDeskAtmosphereVsPlazaContrast(): number {
  return cssHexRgbDistance(
    CITY_DEED_DESK_ATMOSPHERE_CUE.emissive,
    CITY_PLAZA_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft City fishing-dock landmark cue leftover (PL169.1).
 * Quiet cool water haze/emissive on existing city scarce fishing_dock while on
 * City — complements dock tip + Free/Busy pads; catch rates unchanged; mute ok.
 * Always-on City identity (not ready-shimmer / interact-gated).
 */
export const CITY_FISHING_DOCK_LANDMARK_CUE = {
  /** Cooler deep dock water — ≠ ready shimmer #6ab0d0 / Free sticky #8ab0bc. */
  emissive: "#3e7a92",
  intensityBase: 0.05,
  intensityPeak: 0.14,
  hazeColor: "#2a4858",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  hazeRadius: 1.05,
  /** Slower than ready shimmer so continuous landmark stays glanceable. */
  pulsePeriodMs: 3600,
} as const;

export interface CityFishingDockLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City fishing-dock landmark fields (PL169.1).
 * Always-on while a scarce dock mesh is mounted on City — not ready-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool water haze fields; `show` false off City.
 */
export function cityFishingDockLandmarkCue(
  landKind?: string | null,
): CityFishingDockLandmarkCueVisual {
  const c = CITY_FISHING_DOCK_LANDMARK_CUE;
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
 * Soft sine envelope for City fishing-dock landmark pulse (PL169.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityFishingDockLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_FISHING_DOCK_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the City fishing-dock landmark (PL169.1).
 *
 * @param pulseEnvelope - 0..1 from `cityFishingDockLandmarkPulseEnvelope`.
 * @returns Emissive intensity for piles / haze.
 */
export function cityFishingDockLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_FISHING_DOCK_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City fishing dock (PL169.1).
 *
 * @param pulseEnvelope - 0..1 from `cityFishingDockLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityFishingDockLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_FISHING_DOCK_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}
