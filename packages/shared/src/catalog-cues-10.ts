/**
 * Visual cue configs part 10/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isCityLandKind
} from "./catalog-buildings.js";
import { cityScarceStationFloorChromeVisible } from "./catalog-cues-02.js";
import { CITY_HUB_VISUAL, CITY_PLAZA_ATMOSPHERE_CUE, CITY_PLAZA_LANDMARK_CUE } from "./catalog-cues-09.js";
import { CITY_DEED_DESK_LANDMARK_CUE } from "./catalog-cues-14.js";
import { CITY_SCARCE_YARD_ATMOSPHERE_CUE } from "./catalog-cues-23.js";

/**
 * Soft sine envelope for City plaza atmosphere leftover (PL182.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityPlazaAtmospherePulseEnvelope(nowMs: number): number {
  const period = CITY_PLAZA_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the City plaza atmosphere leftover (PL182.1).
 *
 * @param pulseEnvelope - 0..1 from `cityPlazaAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist plane.
 */
export function cityPlazaAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_PLAZA_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity on the City plaza floor (PL182.1).
 *
 * @param pulseEnvelope - 0..1 from `cityPlazaAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist plane.
 */
export function cityPlazaAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_PLAZA_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City plaza leftover mist and fountain landmark (PL182.1).
 *
 * @returns Soft distinct cool so plaza mist ≠ fountain alone.
 */
export function cityPlazaAtmosphereVsFountainContrast(): number {
  return cssHexRgbDistance(
    CITY_PLAZA_ATMOSPHERE_CUE.emissive,
    CITY_PLAZA_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between City plaza leftover mist and scarce-yard mist (PL182.1).
 *
 * @returns Soft distinct cool so plaza mist ≠ scarce warm mist alone.
 */
export function cityPlazaAtmosphereVsScarceYardMistContrast(): number {
  return cssHexRgbDistance(
    CITY_PLAZA_ATMOSPHERE_CUE.emissive,
    CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * RGB distance between City plaza leftover mist and civic pad (PL182.1).
 *
 * @returns Soft distinct cool so plaza mist ≠ static civic pad alone.
 */
export function cityPlazaAtmosphereVsCivicPadContrast(): number {
  return cssHexRgbDistance(
    CITY_PLAZA_ATMOSPHERE_CUE.emissive,
    CITY_HUB_VISUAL.civicPadColor,
  );
}

/**
 * Soft City civic-pad landmark leftover (PL182.2).
 * Quiet cool civic haze/emissive on existing city civic/service pads while on
 * City — complements plaza mist PL182.1 + deed desk PL165.1; layouts unchanged;
 * mute ok. Continuous City leftover on CivicBlock pads (not tip / interact-gated).
 */
export const CITY_CIVIC_PAD_LANDMARK_CUE = {
  /** Cool civic service-slate — ≠ plaza mist #4a7898 / deed #5e7a8c / fountain cyan / pad body. */
  emissive: "#486878",
  intensityBase: 0.04,
  intensityPeak: 0.12,
  hazeColor: "#1a2834",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Slight inset over CivicBlock pad plane (w+1.1 × d+1.1). */
  hazeInset: 0.15,
  hazeY: 0.02,
  /** Slower than deed desk / plaza mist so continuous pad landmark stays glanceable. */
  pulsePeriodMs: 4300,
} as const;

export interface CityCivicPadLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeInset: number;
  hazeY: number;
}

/**
 * Soft City civic-pad landmark leftover fields (PL182.2).
 * Always-on while CityEnvironment is mounted — not tip / interact-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool civic pad haze fields; `show` false off City.
 */
export function cityCivicPadLandmarkCue(
  landKind?: string | null,
): CityCivicPadLandmarkCueVisual {
  const c = CITY_CIVIC_PAD_LANDMARK_CUE;
  if (!landKind || !isCityLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeInset: c.hazeInset,
      hazeY: c.hazeY,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeInset: c.hazeInset,
    hazeY: c.hazeY,
  };
}

/**
 * Soft sine envelope for City civic-pad landmark leftover (PL182.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityCivicPadLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_CIVIC_PAD_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Pad / haze emissive intensity for the City civic-pad landmark leftover (PL182.2).
 *
 * @param pulseEnvelope - 0..1 from `cityCivicPadLandmarkPulseEnvelope`.
 * @returns Emissive intensity for pad footing / haze.
 */
export function cityCivicPadLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_CIVIC_PAD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover haze opacity on City civic/service pads (PL182.2).
 *
 * @param pulseEnvelope - 0..1 from `cityCivicPadLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze plane.
 */
export function cityCivicPadLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_CIVIC_PAD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City civic-pad landmark and plaza leftover mist (PL182.2).
 *
 * @returns Soft distinct cool so civic pad ≠ plaza mist alone.
 */
export function cityCivicPadLandmarkVsPlazaMistContrast(): number {
  return cssHexRgbDistance(
    CITY_CIVIC_PAD_LANDMARK_CUE.emissive,
    CITY_PLAZA_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * RGB distance between City civic-pad landmark and deed-desk slate (PL182.2).
 *
 * @returns Soft distinct cool so civic pad ≠ deed desk alone.
 */
export function cityCivicPadLandmarkVsDeedDeskContrast(): number {
  return cssHexRgbDistance(
    CITY_CIVIC_PAD_LANDMARK_CUE.emissive,
    CITY_DEED_DESK_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between City civic-pad landmark and fountain cyan (PL182.2).
 *
 * @returns Soft distinct cool so civic pad ≠ fountain alone.
 */
export function cityCivicPadLandmarkVsFountainContrast(): number {
  return cssHexRgbDistance(
    CITY_CIVIC_PAD_LANDMARK_CUE.emissive,
    CITY_PLAZA_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft tutor-lane landmark strip (PL129.1).
 * Quiet cooler emissive + haze on the existing tutor-lane floor so tutorials
 * read apart from warm scarce yard — complements plaza landmark PL125.1.
 * Tutor claim rules / layouts unchanged; no station invent.
 */
export const CITY_TUTOR_LANE_LANDMARK_CUE = {
  /** Matches CITY_HUB_VISUAL.tutorLaneColor — existing strip body. */
  stripColor: "#5e6860",
  /** Cool mint-teal emissive — kinship with tutors, not scarce amber / plaza blue. */
  emissive: "#5a9888",
  intensityBase: 0.1,
  intensityPeak: 0.28,
  hazeColor: "#3a7068",
  hazeOpacityBase: 0.06,
  hazeOpacityPeak: 0.16,
  /** Soft cool wash over the spaced practice yard (tutors stand by stations). */
  hazeWidth: 50,
  hazeDepth: 28,
  /** World position — matches expanded scarce yard center. */
  stripX: 0,
  stripY: -0.05,
  stripZ: 6.6,
  stripWidth: 52,
  stripDepth: 30,
  pulsePeriodMs: 3200,
} as const;

export interface CityTutorLaneLandmarkCueVisual {
  stripColor: string;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeWidth: number;
  hazeDepth: number;
  stripX: number;
  stripY: number;
  stripZ: number;
  stripWidth: number;
  stripDepth: number;
}

/**
 * Soft tutor-lane landmark fields for CityEnvironment strip (PL129.1).
 * Always-on while in City — lane identity, not claim-gated.
 *
 * @returns Strip / emissive / haze fields for the tutor lane.
 */
export function cityTutorLaneLandmarkCue(): CityTutorLaneLandmarkCueVisual {
  const c = CITY_TUTOR_LANE_LANDMARK_CUE;
  return {
    stripColor: c.stripColor,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeWidth: c.hazeWidth,
    hazeDepth: c.hazeDepth,
    stripX: c.stripX,
    stripY: c.stripY,
    stripZ: c.stripZ,
    stripWidth: c.stripWidth,
    stripDepth: c.stripDepth,
  };
}

/**
 * Soft sine envelope for tutor-lane landmark pulse (PL129.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityTutorLaneLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_TUTOR_LANE_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Strip emissive intensity for the tutor-lane landmark cue (PL129.1).
 *
 * @param pulseEnvelope - 0..1 from `cityTutorLaneLandmarkPulseEnvelope`.
 * @returns Emissive intensity for the lane strip mesh.
 */
export function cityTutorLaneLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_TUTOR_LANE_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity over the tutor-lane strip (PL129.1).
 *
 * @param pulseEnvelope - 0..1 from `cityTutorLaneLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze plane.
 */
export function cityTutorLaneLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_TUTOR_LANE_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between tutor-lane emissive and warm scarce yard (PL129.1).
 *
 * @returns Contrast so tutor lane ≠ scarce amber.
 */
export function cityTutorLaneLandmarkVsScarceYardContrast(): number {
  return cssHexRgbDistance(
    CITY_TUTOR_LANE_LANDMARK_CUE.emissive,
    CITY_HUB_VISUAL.scarceYardColor,
  );
}

/**
 * RGB distance between tutor-lane and plaza fountain emissives (PL129.1).
 *
 * @returns Contrast so tutor mint ≠ plaza civic blue.
 */
export function cityTutorLaneLandmarkVsPlazaContrast(): number {
  return cssHexRgbDistance(
    CITY_TUTOR_LANE_LANDMARK_CUE.emissive,
    CITY_PLAZA_LANDMARK_CUE.emissive,
  );
}

/**
 * Soft City tutor-lane atmosphere leftover (PL185.1).
 * Quiet cool pulsing mist tint/haze over existing tutor lane while on City —
 * complements lane landmark strip PL129.1 + plaza mist PL182.1; claim rules /
 * layouts unchanged; mute ok. Continuous City leftover over the tutor strip
 * (not tip / claim-gated).
 */
export const CITY_TUTOR_LANE_ATMOSPHERE_CUE = {
  /** Cool tutor service mist — ≠ landmark mint #5a9888 / plaza #4a7898 / scarce warm. */
  emissive: "#3a7880",
  intensityBase: 0.025,
  intensityPeak: 0.09,
  hazeColor: "#122028",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Soft cool wash over spaced practice yard (matches landmark strip). */
  hazeWidth: 48,
  hazeDepth: 26,
  /** Matches tutor-lane strip / scarce yard center. */
  laneCenterX: 0,
  laneCenterZ: 6.6,
  /** Above landmark strip haze (stripY+0.02) so leftover mist stacks quietly. */
  hazeY: 0.08,
  /** Slower than landmark strip (3200) so continuous mist stays glanceable. */
  pulsePeriodMs: 4400,
} as const;

export interface CityTutorLaneAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeWidth: number;
  hazeDepth: number;
  laneCenterX: number;
  laneCenterZ: number;
  hazeY: number;
}

/**
 * Soft City tutor-lane atmosphere leftover fields (PL185.1).
 * Always-on while CityEnvironment is mounted — not tip / claim-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool tutor-lane mist fields; `show` false off City.
 */
export function cityTutorLaneAtmosphereCue(
  landKind?: string | null,
): CityTutorLaneAtmosphereCueVisual {
  const c = CITY_TUTOR_LANE_ATMOSPHERE_CUE;
  if (!landKind || !isCityLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeWidth: c.hazeWidth,
      hazeDepth: c.hazeDepth,
      laneCenterX: c.laneCenterX,
      laneCenterZ: c.laneCenterZ,
      hazeY: c.hazeY,
    };
  }
  if (!cityScarceStationFloorChromeVisible()) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeWidth: c.hazeWidth,
      hazeDepth: c.hazeDepth,
      laneCenterX: c.laneCenterX,
      laneCenterZ: c.laneCenterZ,
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
    laneCenterX: c.laneCenterX,
    laneCenterZ: c.laneCenterZ,
    hazeY: c.hazeY,
  };
}

/**
 * Soft sine envelope for City tutor-lane atmosphere leftover (PL185.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityTutorLaneAtmospherePulseEnvelope(nowMs: number): number {
  const period = CITY_TUTOR_LANE_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the City tutor-lane atmosphere leftover (PL185.1).
 *
 * @param pulseEnvelope - 0..1 from `cityTutorLaneAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist plane.
 */
export function cityTutorLaneAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_TUTOR_LANE_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}
