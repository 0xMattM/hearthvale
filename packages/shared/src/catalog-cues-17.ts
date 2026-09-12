/**
 * Visual cue configs part 17/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isCityLandKind,
  isPlayerLandKind
} from "./catalog-buildings.js";
import {
  CITY_SCARCE_STATION_FREE_CUE,
  cityScarceLandmarkCueHidden,
  cityScarceStationFloorChromeVisible,
} from "./catalog-cues-02.js";
import { GATHER_NODE_DEPLETED_CUE } from "./catalog-cues-03.js";
import { CITY_FISHING_DOCK_LANDMARK_CUE } from "./catalog-cues-14.js";
import { CITY_CROP_PLOT_LANDMARK_CUE, CITY_TREE_STUMP_LANDMARK_CUE, cityTreeStumpLandmarkPulseEnvelope } from "./catalog-cues-16.js";

/**
 * Cut-face / haze emissive intensity for the City tree-stump landmark (PL171.2).
 *
 * @param pulseEnvelope - 0..1 from `cityTreeStumpLandmarkPulseEnvelope`.
 * @returns Emissive intensity for stump top / haze.
 */
export function cityTreeStumpLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_TREE_STUMP_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City tree stump (PL171.2).
 *
 * @param pulseEnvelope - 0..1 from `cityTreeStumpLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityTreeStumpLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_TREE_STUMP_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City stump landmark and ready cut-top (PL171.2).
 *
 * @returns Soft distinct cool so continuous landmark ≠ ready moss top.
 */
export function cityTreeStumpLandmarkVsReadyContrast(): number {
  return cssHexRgbDistance(
    CITY_TREE_STUMP_LANDMARK_CUE.emissive,
    GATHER_NODE_DEPLETED_CUE.stumpReadyTop,
  );
}

/**
 * RGB distance between City stump landmark and sticky Free pad (PL171.2).
 *
 * @returns Soft distinct cool so woodland landmark ≠ Free sticky cyan.
 */
export function cityTreeStumpLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_TREE_STUMP_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * RGB distance between City stump and crop-plot landmarks (PL171.2).
 *
 * @returns Soft distinct cool so stump woodland ≠ crop soil warm.
 */
export function cityTreeStumpLandmarkVsCropContrast(): number {
  return cssHexRgbDistance(
    CITY_TREE_STUMP_LANDMARK_CUE.emissive,
    CITY_CROP_PLOT_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between City stump and fishing-dock landmarks (PL171.2).
 *
 * @returns Soft distinct woodland so stump ≠ dock deep-water cool.
 */
export function cityTreeStumpLandmarkVsDockContrast(): number {
  return cssHexRgbDistance(
    CITY_TREE_STUMP_LANDMARK_CUE.emissive,
    CITY_FISHING_DOCK_LANDMARK_CUE.emissive,
  );
}

/**
 * Quiet cool pulsing wood mist over existing tree stump on player land (PL191.2) —
 * complements ready / depleted cues + City landmark PL171.2. Chop cooldown SoT
 * unchanged; mute ok. Continuous leftover (not ready-gated). Distinct
 * wider/slower/quieter mist — City kinship covered by landmark alone (no second
 * identical woodland disc on City).
 */
export const TREE_STUMP_ATMOSPHERE_CUE = {
  /** Quiet cool wood-moss — ≠ City landmark #3a6858 / ready top #6a8a4a / Explore premium. */
  emissive: "#284840",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#142420",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than City landmark disc (1.08) so leftover mist reads as stump-zone atmosphere. */
  hazeRadius: 1.46,
  /** Above depleted/ready pads (y≈0.02–0.025) so leftover mist stacks quietly. */
  hazeY: 0.036,
  /** Slower than City landmark (3750) so continuous mist stays glanceable. */
  pulsePeriodMs: 4600,
} as const;

export interface TreeStumpAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft tree-stump atmosphere leftover fields (PL191.2).
 * Always-on while stump is mounted on player_land — not ready-gated / not City.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Cool wood mist fields; `show` false off player land.
 */
export function treeStumpAtmosphereCue(
  landKind?: string | null,
): TreeStumpAtmosphereCueVisual {
  const c = TREE_STUMP_ATMOSPHERE_CUE;
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
 * Soft sine envelope for tree-stump atmosphere leftover (PL191.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function treeStumpAtmospherePulseEnvelope(nowMs: number): number {
  const period = TREE_STUMP_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the tree-stump atmosphere leftover (PL191.2).
 *
 * @param pulseEnvelope - 0..1 from `treeStumpAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function treeStumpAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = TREE_STUMP_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under a tree stump (PL191.2).
 *
 * @param pulseEnvelope - 0..1 from `treeStumpAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function treeStumpAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = TREE_STUMP_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between stump leftover mist and City landmark (PL191.2).
 *
 * @returns Soft distinct cool so leftover mist ≠ City woodland landmark alone.
 */
export function treeStumpAtmosphereVsCityLandmarkContrast(): number {
  return cssHexRgbDistance(
    TREE_STUMP_ATMOSPHERE_CUE.emissive,
    CITY_TREE_STUMP_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between stump leftover mist and ready cut-top (PL191.2).
 *
 * @returns Soft distinct cool so leftover mist ≠ chop-ready moss alone.
 */
export function treeStumpAtmosphereVsReadyTopContrast(): number {
  return cssHexRgbDistance(
    TREE_STUMP_ATMOSPHERE_CUE.emissive,
    GATHER_NODE_DEPLETED_CUE.stumpReadyTop,
  );
}

/**
 * Soft City ore-node landmark cue leftover (PL172.1).
 * Quiet cool mineral haze/emissive on existing city scarce ore_node while on
 * City — complements ore ready + Free/Busy pads; yields unchanged; mute ok.
 * Always-on City identity (not ready / Explore-premium / interact-gated).
 */
export const CITY_ORE_NODE_LANDMARK_CUE = {
  /** Cool slate mineral blue — ≠ ready rock / Explore ore glow / Free sticky / stump. */
  emissive: "#4a6280",
  intensityBase: 0.05,
  intensityPeak: 0.14,
  hazeColor: "#243040",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  hazeRadius: 1.08,
  /** Slower than ready glance so continuous landmark stays glanceable. */
  pulsePeriodMs: 3800,
} as const;

export interface CityOreNodeLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft City ore-node landmark fields (PL172.1).
 * Always-on while a scarce ore mesh is mounted on City — not ready-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool mineral haze fields; `show` false off City.
 */
export function cityOreNodeLandmarkCue(
  landKind?: string | null,
): CityOreNodeLandmarkCueVisual {
  const c = CITY_ORE_NODE_LANDMARK_CUE;
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
 * Soft sine envelope for City ore-node landmark pulse (PL172.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityOreNodeLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_ORE_NODE_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Vein / haze emissive intensity for the City ore-node landmark (PL172.1).
 *
 * @param pulseEnvelope - 0..1 from `cityOreNodeLandmarkPulseEnvelope`.
 * @returns Emissive intensity for ore body / haze.
 */
export function cityOreNodeLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_ORE_NODE_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a City ore node (PL172.1).
 *
 * @param pulseEnvelope - 0..1 from `cityOreNodeLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityOreNodeLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_ORE_NODE_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between City ore landmark and ready rock tint (PL172.1).
 *
 * @returns Soft distinct cool so continuous landmark ≠ ready ore rock.
 */
export function cityOreNodeLandmarkVsReadyContrast(): number {
  return cssHexRgbDistance(
    CITY_ORE_NODE_LANDMARK_CUE.emissive,
    GATHER_NODE_DEPLETED_CUE.oreReadyRock,
  );
}

/**
 * RGB distance between City ore landmark and sticky Free pad (PL172.1).
 *
 * @returns Soft distinct cool so mineral landmark ≠ Free sticky cyan.
 */
export function cityOreNodeLandmarkVsFreeStickyContrast(): number {
  return cssHexRgbDistance(
    CITY_ORE_NODE_LANDMARK_CUE.emissive,
    CITY_SCARCE_STATION_FREE_CUE.haloColor,
  );
}

/**
 * RGB distance between City ore and tree-stump landmarks (PL172.1).
 *
 * @returns Soft distinct mineral so ore ≠ stump woodland cool.
 */
export function cityOreNodeLandmarkVsTreeStumpContrast(): number {
  return cssHexRgbDistance(
    CITY_ORE_NODE_LANDMARK_CUE.emissive,
    CITY_TREE_STUMP_LANDMARK_CUE.emissive,
  );
}

/**
 * Quiet cool pulsing ore mist over existing ore node on player land (PL192.1) —
 * complements ready / depleted cues + City landmark PL172.1 + Explore premium
 * PL116.2. Mine cooldown SoT unchanged; mute ok. Continuous leftover (not
 * ready-gated). Distinct wider/slower/quieter mist — City kinship covered by
 * landmark alone (no second identical mineral disc on City); Explore premium
 * keeps its own ready glow.
 */
export const ORE_NODE_ATMOSPHERE_CUE = {
  /** Quiet cool deep mineral — ≠ City landmark #4a6280 / ready rock #6a727a / Explore premium #5a7a9a. */
  emissive: "#283848",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#141c28",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Wider than City landmark disc (1.08) so leftover mist reads as ore-zone atmosphere. */
  hazeRadius: 1.46,
  /** Above depleted/ready pads (y≈0.02–0.025) so leftover mist stacks quietly. */
  hazeY: 0.036,
  /** Slower than City landmark (3800) so continuous mist stays glanceable. */
  pulsePeriodMs: 4700,
} as const;

export interface OreNodeAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft ore-node atmosphere leftover fields (PL192.1).
 * Always-on while ore is mounted on player_land — not ready-gated / not City.
 *
 * @param landKind - Active map; cue only on player_land.
 * @returns Cool ore mist fields; `show` false off player land.
 */
export function oreNodeAtmosphereCue(
  landKind?: string | null,
): OreNodeAtmosphereCueVisual {
  const c = ORE_NODE_ATMOSPHERE_CUE;
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
 * Soft sine envelope for ore-node atmosphere leftover (PL192.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function oreNodeAtmospherePulseEnvelope(nowMs: number): number {
  const period = ORE_NODE_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the ore-node atmosphere leftover (PL192.1).
 *
 * @param pulseEnvelope - 0..1 from `oreNodeAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function oreNodeAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = ORE_NODE_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under an ore node (PL192.1).
 *
 * @param pulseEnvelope - 0..1 from `oreNodeAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function oreNodeAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = ORE_NODE_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}
