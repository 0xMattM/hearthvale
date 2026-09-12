/**
 * Visual cue configs part 3/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  GATHER_READY_WORLD_SOFT,
  PLAYER_LAND_STATIONS,
  cssHexRgbDistance,
  isPlayerLandKind
} from "./catalog-buildings.js";
import { CROPS } from "./catalog-recipes.js";
import { ITEMS } from "./catalog-items.js";
import { CROP_GROWING_SOFT_SWAY, CROP_READY_WORLD_PULSE, cropGrowingSoftSwayActive } from "./catalog-cues-02.js";
import { CITY_CROP_PLOT_LANDMARK_CUE } from "./catalog-cues-16.js";

/**
 * Soft sine envelope for crop growing sway (PL121.1).
 *
 * @param nowMs - Clock ms (e.g. scene `nowMs`).
 * @returns Envelope in [0, 1].
 */
export function cropGrowingSoftSwayEnvelope(nowMs: number): number {
  const period = CROP_GROWING_SOFT_SWAY.periodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Quiet pad emissive while crop is growing (PL121.1).
 * Empty/ready stay 0 so ready pulse (PL12.1) owns ripe chrome.
 *
 * @param growing - True when sprout/growing.
 * @param swayEnvelope - 0..1 from `cropGrowingSoftSwayEnvelope`.
 * @returns Emissive intensity for the growing pad.
 */
export function cropGrowingPadEmissiveIntensity(
  growing: boolean,
  swayEnvelope: number,
): number {
  if (!growing) return 0;
  const { intensityMin, intensityMax } = CROP_GROWING_SOFT_SWAY;
  const e = Math.min(1, Math.max(0, swayEnvelope));
  return intensityMin + e * (intensityMax - intensityMin);
}

/**
 * Soft stem lean radians while crop is growing (PL121.1).
 * Signed sine via envelope so stems sway both ways; empty/ready stay 0.
 *
 * @param growing - True when sprout/growing.
 * @param swayEnvelope - 0..1 from `cropGrowingSoftSwayEnvelope`.
 * @returns Stem Z rotation in radians.
 */
export function cropGrowingStemSwayRadians(
  growing: boolean,
  swayEnvelope: number,
): number {
  if (!growing) return 0;
  const e = Math.min(1, Math.max(0, swayEnvelope));
  // Reason: envelope is 0.5+0.5*sin → map to [-1,1] for quiet breeze lean.
  return (e * 2 - 1) * CROP_GROWING_SOFT_SWAY.stemSwayRad;
}

/**
 * Soft stem emissive while crop is growing (PL121.1).
 *
 * @param growing - True when sprout/growing.
 * @param swayEnvelope - 0..1 from `cropGrowingSoftSwayEnvelope`.
 * @returns Stem emissive intensity.
 */
export function cropGrowingStemEmissiveIntensity(
  growing: boolean,
  swayEnvelope: number,
): number {
  if (!growing) return 0;
  const { stemEmissiveMin, stemEmissiveMax } = CROP_GROWING_SOFT_SWAY;
  const e = Math.min(1, Math.max(0, swayEnvelope));
  return stemEmissiveMin + e * (stemEmissiveMax - stemEmissiveMin);
}

/**
 * Quiet warm pulsing soil mist over growing (not ready) crop plots on player
 * land (PL190.1) — complements growing sway PL121.1 + ready pulse PL12.1.
 * GrowMs / yields unchanged; mute ok. Continuous leftover while sprout/growing
 * on player_land — not a duplicate of the growing pad chrome.
 */
export const CROP_GROWING_ATMOSPHERE_CUE = {
  /** Quiet warm tilled-soil amber — ≠ growing pad #4a7030 / ready #a0b830 / City crop landmark. */
  emissive: "#8a7038",
  intensityBase: 0.03,
  intensityPeak: 0.11,
  hazeColor: "#2a2010",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.12,
  /** Wider than growing pad radius (~1.05) so leftover mist reads as plot-zone atmosphere. */
  hazeRadius: 1.42,
  /** Above growing pad (y≈0.018) so leftover mist stacks quietly. */
  hazeY: 0.036,
  /** Slower than growing sway (2400) so continuous mist stays glanceable. */
  pulsePeriodMs: 3800,
} as const;

export interface CropGrowingAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft crop-growing atmosphere leftover fields (PL190.1).
 * Always-on while sprout/growing on player land — not ready / empty / off-land.
 *
 * @param landKind - Active map; cue only on player_land.
 * @param cropVisualState - Visual stage from `cropVisual`.
 * @returns Warm soil mist fields; `show` false when quiet.
 */
export function cropGrowingAtmosphereCue(
  landKind: string | null | undefined,
  cropVisualState: "empty" | "sprout" | "growing" | "ready",
): CropGrowingAtmosphereCueVisual {
  const c = CROP_GROWING_ATMOSPHERE_CUE;
  const growing = cropGrowingSoftSwayActive(cropVisualState);
  if (!landKind || !isPlayerLandKind(String(landKind)) || !growing) {
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
 * Soft sine envelope for crop-growing atmosphere leftover (PL190.1).
 *
 * @param nowMs - Clock ms (e.g. scene `nowMs` / `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cropGrowingAtmospherePulseEnvelope(nowMs: number): number {
  const period = CROP_GROWING_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the crop-growing atmosphere leftover (PL190.1).
 *
 * @param pulseEnvelope - 0..1 from `cropGrowingAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function cropGrowingAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CROP_GROWING_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity over growing crop soil (PL190.1).
 *
 * @param pulseEnvelope - 0..1 from `cropGrowingAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function cropGrowingAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CROP_GROWING_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between growing leftover mist and growing pad emissive (PL190.1).
 *
 * @returns Soft distinct warm so leftover mist ≠ growing sway pad alone.
 */
export function cropGrowingAtmosphereVsGrowingSwayContrast(): number {
  return cssHexRgbDistance(
    CROP_GROWING_ATMOSPHERE_CUE.emissive,
    CROP_GROWING_SOFT_SWAY.emissiveColor,
  );
}

/**
 * RGB distance between growing leftover mist and ready pulse (PL190.1).
 *
 * @returns Soft distinct warm so leftover mist ≠ ready lime alone.
 */
export function cropGrowingAtmosphereVsReadyPulseContrast(): number {
  return cssHexRgbDistance(
    CROP_GROWING_ATMOSPHERE_CUE.emissive,
    CROP_READY_WORLD_PULSE.emissiveColor,
  );
}

/**
 * RGB distance between growing leftover mist and City crop landmark (PL190.1).
 *
 * @returns Soft distinct warm so player-land mist ≠ City scarce landmark alone.
 */
export function cropGrowingAtmosphereVsCityLandmarkContrast(): number {
  return cssHexRgbDistance(
    CROP_GROWING_ATMOSPHERE_CUE.emissive,
    CITY_CROP_PLOT_LANDMARK_CUE.emissive,
  );
}

/**
 * World-label hierarchy when a crop plot is harvest-ready (PL40.1).
 * Name leads (crop harvest name, else Crop Plot); soft "Ready" secondary.
 * Complements pad pulse (PL12.1); empty/growing stay timer/quiet only.
 *
 * @param cropId - Planted crop id (`wheat`), or null when unknown.
 * @returns Bold-name + soft detail parts for world Html when ready.
 */
export function cropReadyWorldLabelParts(cropId: string | null): {
  name: string;
  soft: string;
} {
  const crop = cropId ? CROPS[cropId] : undefined;
  const harvestName = crop
    ? (ITEMS[crop.harvestItemId]?.name ?? crop.harvestItemId)
    : null;
  return {
    name: harvestName ?? PLAYER_LAND_STATIONS.crop_plot.name,
    soft: GATHER_READY_WORLD_SOFT,
  };
}

/**
 * Quiet world tint when tree/ore gather nodes are depleted / cooling (PL12.2).
 * Ready nodes keep bright tops/veins; depleted shows a muted pad + body.
 */
export const GATHER_NODE_DEPLETED_CUE = {
  stumpReadyBody: "#5a4028",
  stumpReadyTop: "#6a8a4a",
  stumpDepletedBody: "#3a3228",
  stumpDepletedTop: "#2a3426",
  stumpDepletedPad: "#2e3830",
  stumpDepletedPadOpacity: 0.52,
  oreDepletedPad: "#2a3038",
  oreDepletedPadOpacity: 0.48,
  oreDepletedRock: "#2e343c",
  oreReadyRock: "#6a727a",
} as const;

export interface GatherStumpWorldVisual {
  bodyColor: string;
  topColor: string;
  showDepletedPad: boolean;
  padColor: string;
  padOpacity: number;
}

/**
 * Tree-stump body/top/pad look for ready vs depleted (PL12.2).
 *
 * @param ready - True when the stump can be chopped now.
 * @param highlighted - Interact highlight boost.
 * @returns World tint fields for TreeStumpBuilding.
 */
export function gatherStumpWorldVisual(
  ready: boolean,
  highlighted: boolean,
): GatherStumpWorldVisual {
  const c = GATHER_NODE_DEPLETED_CUE;
  if (ready) {
    return {
      bodyColor: highlighted ? "#8a6a3a" : c.stumpReadyBody,
      topColor: c.stumpReadyTop,
      showDepletedPad: false,
      padColor: c.stumpDepletedPad,
      padOpacity: 0,
    };
  }
  return {
    bodyColor: highlighted ? "#5a4a38" : c.stumpDepletedBody,
    topColor: c.stumpDepletedTop,
    showDepletedPad: true,
    padColor: c.stumpDepletedPad,
    padOpacity: c.stumpDepletedPadOpacity,
  };
}

/**
 * Quiet depleted pad under ore when cooling (PL12.2). Ready ore: no pad.
 *
 * @param ready - True when the ore node can be chipped now.
 * @returns Pad fields for OreNodeMesh.
 */
export function gatherOreDepletedPad(ready: boolean): {
  show: boolean;
  color: string;
  opacity: number;
} {
  const c = GATHER_NODE_DEPLETED_CUE;
  if (ready) {
    return { show: false, color: c.oreDepletedPad, opacity: 0 };
  }
  return {
    show: true,
    color: c.oreDepletedPad,
    opacity: c.oreDepletedPadOpacity,
  };
}

/**
 * Quiet distinct pad/tint so Animal Hunter trails vs Monster Hunter thickets
 * read apart at a glance (PL116.1). Complements section labels PL4.1.
 * Hunt rules / spawns unchanged — atmosphere only.
 */
export const HUNT_TRAIL_WAYFINDING = {
  /** Animal Hunter — `game_trail`: warm sand / amber pad. */
  trail: {
    pathReady: "#7a6840",
    pathReadyHighlighted: "#9a8450",
    pathCooling: "#3a3424",
    pathCoolingHighlighted: "#4a4434",
    creatureReady: "#d4b078",
    creatureCooling: "#5a4a38",
    padColor: "#c4a060",
    padOpacityReady: 0.42,
    padOpacityCooling: 0.28,
    padEmissive: "#a88840",
    padEmissiveIntensity: 0.2,
  },
  /** Monster Hunter — `edge_thicket`: cool dusk mauve pad. */
  thicket: {
    pathReady: "#3e3a4a",
    pathReadyHighlighted: "#524e62",
    pathCooling: "#1c1e26",
    pathCoolingHighlighted: "#2a2c34",
    creatureReady: "#8a5048",
    creatureCooling: "#3a2828",
    padColor: "#6a4858",
    padOpacityReady: 0.44,
    padOpacityCooling: 0.3,
    padEmissive: "#704858",
    padEmissiveIntensity: 0.18,
  },
} as const;

export type HuntTrailWayfindingKind = keyof typeof HUNT_TRAIL_WAYFINDING;

export interface HuntTrailWayfindingVisual {
  pathColor: string;
  creatureColor: string;
  /** Always-on quiet wayfinding pad (ready stronger; cooling softer). */
  showWayfindingPad: boolean;
  padColor: string;
  padOpacity: number;
  padEmissive: string;
  padEmissiveIntensity: number;
}

/**
 * Pad / path / creature tint for hunt trail vs thicket wayfinding (PL116.1).
 *
 * @param kind - `trail` (Animal Hunter) or `thicket` (Monster Hunter).
 * @param ready - True when the node can be hunted now.
 * @param highlighted - Interact highlight boost.
 * @returns World tint fields for GameTrailMesh / EdgeThicketMesh.
 */
export function huntTrailWayfindingVisual(
  kind: HuntTrailWayfindingKind,
  ready: boolean,
  highlighted: boolean,
): HuntTrailWayfindingVisual {
  const c = HUNT_TRAIL_WAYFINDING[kind];
  if (ready) {
    return {
      pathColor: highlighted ? c.pathReadyHighlighted : c.pathReady,
      creatureColor: c.creatureReady,
      showWayfindingPad: true,
      padColor: c.padColor,
      padOpacity: c.padOpacityReady,
      padEmissive: c.padEmissive,
      padEmissiveIntensity: c.padEmissiveIntensity,
    };
  }
  return {
    pathColor: highlighted ? c.pathCoolingHighlighted : c.pathCooling,
    creatureColor: c.creatureCooling,
    showWayfindingPad: true,
    padColor: c.padColor,
    padOpacity: c.padOpacityCooling,
    padEmissive: c.padEmissive,
    // Reason: cooling keeps a quieter pad so trail≠thicket still reads at a glance.
    padEmissiveIntensity: c.padEmissiveIntensity * 0.45,
  };
}

/**
 * RGB distance between Animal vs Monster hunt wayfinding pads (PL116.1).
 *
 * @returns Pad contrast so trail and thicket stay glanceably distinct.
 */
export function animalVsMonsterHuntTrailPadContrast(): number {
  return cssHexRgbDistance(
    HUNT_TRAIL_WAYFINDING.trail.padColor,
    HUNT_TRAIL_WAYFINDING.thicket.padColor,
  );
}

/**
 * RGB distance between Animal vs Monster ready path tints (PL116.1).
 *
 * @returns Path-body contrast complementary to the pad cue.
 */
export function animalVsMonsterHuntTrailPathContrast(): number {
  return cssHexRgbDistance(
    HUNT_TRAIL_WAYFINDING.trail.pathReady,
    HUNT_TRAIL_WAYFINDING.thicket.pathReady,
  );
}

/**
 * Soft emissive / pad cue on Explore premium wood/ore nodes (PL116.2).
 * Explore gather sells at premium rates vs City/Land — glow marks that without
 * changing rates. Complements PL12.2 depleted pad (glow only while ready).
 */
export const EXPLORE_PREMIUM_NODE_GLOW = {
  wood: {
    padColor: "#7aaa58",
    padOpacity: 0.36,
    emissive: "#6a9a48",
    intensity: 0.26,
  },
  ore: {
    padColor: "#6a8aaa",
    padOpacity: 0.34,
    emissive: "#5a7a9a",
    intensity: 0.28,
  },
} as const;

export type ExplorePremiumNodeKind = keyof typeof EXPLORE_PREMIUM_NODE_GLOW;

export interface ExplorePremiumNodeGlowVisual {
  show: boolean;
  padColor: string;
  padOpacity: number;
  emissive: string;
  intensity: number;
}
