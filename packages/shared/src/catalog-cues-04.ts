/**
 * Visual cue configs part 4/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isExploreLandKind
} from "./catalog-buildings.js";
import { EXPLORE_PREMIUM_NODE_GLOW, ExplorePremiumNodeGlowVisual, ExplorePremiumNodeKind } from "./catalog-cues-03.js";
import { CITY_HUB_VISUAL } from "./catalog-cues-09.js";

/**
 * Soft premium glow under Explore wood/ore when gather-ready (PL116.2).
 * City / player-land / warrior stay quiet; depleted uses PL12.2 pad only.
 *
 * @param landKind - Active map kind.
 * @param ready - True when the node can be chopped/chipped now.
 * @param node - `wood` (tree_stump) or `ore` (ore_node).
 * @returns Pad/emissive fields for TreeStumpBuilding / OreNodeMesh.
 */
export function explorePremiumNodeGlow(
  landKind: string,
  ready: boolean,
  node: ExplorePremiumNodeKind,
): ExplorePremiumNodeGlowVisual {
  const c = EXPLORE_PREMIUM_NODE_GLOW[node];
  if (!isExploreLandKind(landKind) || !ready) {
    return {
      show: false,
      padColor: c.padColor,
      padOpacity: 0,
      emissive: c.emissive,
      intensity: 0,
    };
  }
  return {
    show: true,
    padColor: c.padColor,
    padOpacity: c.padOpacity,
    emissive: c.emissive,
    intensity: c.intensity,
  };
}

/**
 * RGB distance between Explore premium wood vs ore ready pads (PL116.2).
 *
 * @returns Pad contrast so woodland and mine premiums stay distinct.
 */
export function explorePremiumWoodVsOrePadContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_PREMIUM_NODE_GLOW.wood.padColor,
    EXPLORE_PREMIUM_NODE_GLOW.ore.padColor,
  );
}

/** Interact-prompt availability tags for scarce city stations (PL8.2). */
export const CITY_SCARCE_STATION_BUSY_PROMPT_TAG = "Busy";
export const CITY_SCARCE_STATION_FREE_PROMPT_TAG = "Free";

/**
 * Appends Busy / Free detail to a city scarce-station interact prompt (PL8.2).
 * Does not invent qty caps — soft presence readability only.
 *
 * @param label - Base prompt from resolveInteractPrompt.
 * @param busy - True when another presence contends the station.
 * @returns Label with · Busy or · Free (idempotent).
 */
export function withCityScarceStationAvailabilityPrompt(
  label: string,
  busy: boolean,
): string {
  const trimmed = label.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  if (
    lower.endsWith(" · busy") ||
    lower.endsWith(" · free") ||
    lower.endsWith("· busy") ||
    lower.endsWith("· free")
  ) {
    return trimmed;
  }
  const tag = busy
    ? CITY_SCARCE_STATION_BUSY_PROMPT_TAG
    : CITY_SCARCE_STATION_FREE_PROMPT_TAG;
  return `${trimmed} · ${tag}`;
}

/**
 * Quiet warmer lantern / pad under market + vendor (PL117.1).
 * Civic commerce reads apart from warm scarce yard (PL1.1) and cool civic pads
 * (PL36.1). Complements awning/board kits (PL1.3). Prices / panels unchanged.
 */
export const CITY_COMMERCE_SERVICE_PAD = {
  vendor: {
    padColor: "#c89848",
    padOpacity: 0.4,
    lanternColor: "#e8b868",
    lanternEmissive: "#d4a050",
    lanternIntensity: 0.4,
  },
  market: {
    padColor: "#d0a858",
    padOpacity: 0.38,
    lanternColor: "#e8c078",
    lanternEmissive: "#d4a858",
    lanternIntensity: 0.36,
  },
} as const;

export type CityCommerceServiceKind = keyof typeof CITY_COMMERCE_SERVICE_PAD;

export interface CityCommerceServicePadVisual {
  show: boolean;
  padColor: string;
  padOpacity: number;
  lanternColor: string;
  lanternEmissive: string;
  lanternIntensity: number;
}

/**
 * Warm commerce pad + lantern fields for market / vendor meshes (PL117.1).
 * Notice stays on PL17.1 unread cue — not this commerce warmth.
 *
 * @param kind - `vendor` (awning stall) or `market` (listing board).
 * @returns Always-on quiet warmth fields for City service meshes.
 */
export function cityCommerceServicePad(
  kind: CityCommerceServiceKind,
): CityCommerceServicePadVisual {
  const c = CITY_COMMERCE_SERVICE_PAD[kind];
  return {
    show: true,
    padColor: c.padColor,
    padOpacity: c.padOpacity,
    lanternColor: c.lanternColor,
    lanternEmissive: c.lanternEmissive,
    lanternIntensity: c.lanternIntensity,
  };
}

/**
 * RGB distance between vendor commerce pad and warm scarce yard (PL117.1).
 *
 * @returns Contrast so commerce warmth ≠ scarce craft yard.
 */
export function cityCommerceVsScarceYardContrast(): number {
  return cssHexRgbDistance(
    CITY_COMMERCE_SERVICE_PAD.vendor.padColor,
    CITY_HUB_VISUAL.scarceYardColor,
  );
}

/**
 * RGB distance between market commerce pad and cool civic pad (PL117.1).
 *
 * @returns Contrast so commerce warmth ≠ cool civic atmosphere.
 */
export function cityCommerceVsCivicPadContrast(): number {
  return cssHexRgbDistance(
    CITY_COMMERCE_SERVICE_PAD.market.padColor,
    CITY_HUB_VISUAL.civicPadColor,
  );
}

/**
 * RGB distance between vendor vs market commerce pads (PL117.1).
 *
 * @returns Soft distinct warmth so awning ≠ listing board at a glance.
 */
export function cityVendorVsMarketPadContrast(): number {
  return cssHexRgbDistance(
    CITY_COMMERCE_SERVICE_PAD.vendor.padColor,
    CITY_COMMERCE_SERVICE_PAD.market.padColor,
  );
}

/**
 * Warrior arena floor + plaque palette (PL11.1).
 * Scorched grounds + warm clay ring read apart from city grey / land & explore greens.
 * Peer grounds mirror City / Homestead / Forest environment base planes for contrast tests.
 * No combat balance — atmosphere only.
 */
export const WARRIOR_ARENA_VISUAL = {
  groundsColor: "#3a2820",
  ringFillColor: "#d4a048",
  ringBorderColor: "#8a4828",
  chalkColor: "#efe0b8",
  pathColor: "#5a3828",
  plaqueFace: "#a82828",
  plaqueFaceLit: "#d44038",
  plaqueBase: "#4a3020",
  plaqueBaseLit: "#6a4830",
  plaquePost: "#2a1a12",
  /** Accent for world labels + ArenaStubPanel chrome. */
  plaqueAccent: "#e07060",
  /** Soft warm emissive on plaque face (PL41.2) — optional-path polish only. */
  plaqueEmissive: "#c03828",
  plaqueEmissiveIntensity: 0.28,
  plaqueEmissiveIntensityLit: 0.45,
  /** Warm dusty haze — reads apart from Explore cool canopy haze (PL36.2 / PL41.2). */
  hazeColor: "#502818",
  hazeOpacity: 0.22,
  peerGrounds: {
    city: "#5a5f66",
    player_land: "#4d6b3f",
    explore: "#2f4a32",
  },
} as const;

/**
 * Minimum RGB distance between warrior grounds and other map base floors (PL11.1).
 *
 * @returns Smallest distance vs city / land / explore peer grounds.
 */
export function warriorArenaGroundContrastMin(): number {
  const g = WARRIOR_ARENA_VISUAL.groundsColor;
  let min = Number.POSITIVE_INFINITY;
  for (const peer of Object.values(WARRIOR_ARENA_VISUAL.peerGrounds)) {
    const d = cssHexRgbDistance(g, peer);
    if (d < min) min = d;
  }
  return Number.isFinite(min) ? min : 0;
}

/**
 * RGB distance between packed sand ring and dusty grounds (PL11.1 inner contrast).
 *
 * @returns Distance ring fill vs grounds.
 */
export function warriorArenaRingContrast(): number {
  return cssHexRgbDistance(
    WARRIOR_ARENA_VISUAL.ringFillColor,
    WARRIOR_ARENA_VISUAL.groundsColor,
  );
}

/** Shared arena plaque panel copy (CL11.1) — optional / no ladder / free exit. */
export interface ArenaPlaqueCopy {
  title: string;
  lead: string;
  body: string;
  exitHint: string;
  noLadderNote: string;
}

/**
 * Walk-up Warrior Arena plaque text (CL11.1).
 *
 * @returns Structured copy for ArenaStubPanel + tests.
 */
export function arenaPlaqueCopy(): ArenaPlaqueCopy {
  return {
    title: "Warrior Arena",
    lead: "Optional parallel combat path — not required, and not on the economy profession ladder.",
    body: "Placeholder arena stub only. No matches, combat gear ladder, or balance yet. Train professions and produce on City / Your Land / Exploration instead.",
    exitHint:
      "Leave anytime — press N for the travel map, or walk north to the Exit portal (free, instant).",
    noLadderNote:
      "No combat gear ladder here. Warrior training never belongs on your homestead.",
  };
}

/**
 * Interact prompt for arena plaques (CL11.1).
 *
 * @returns Player-facing E-prompt label.
 */
export function arenaInteractPrompt(): string {
  return "Arena info · optional, no ladder";
}

/**
 * Floating world label above the warrior exit portal (CL11.1).
 *
 * @returns Short wayfinding label.
 */
export function warriorArenaExitLabel(): string {
  return "Exit · Travel · free (N)";
}

/**
 * Secondary hint under the exit label (CL11.1).
 *
 * @returns Short supporting line.
 */
export function warriorArenaExitHint(): string {
  return "North portal · leave freely";
}

/**
 * Floating label on arena plaques (CL11.1).
 *
 * @returns Short plaque wayfinding label.
 */
export function arenaBoardWorldLabel(): string {
  return "Optional · no ladder";
}

/**
 * Soft plaque emissive sine while arena board is interact-highlighted (PL129.2).
 * Complements warm haze / static plaque emissive (PL41.2 / PL11.1).
 * Arena stub / no balance invent; mute ok.
 * Idle/base mirror `WARRIOR_ARENA_VISUAL.plaqueEmissiveIntensity*`.
 */
export const ARENA_PLAQUE_HIGHLIGHT_PULSE = {
  periodMs: 1400,
  /** Steady plaque emissive when not highlighted. */
  intensityIdle: 0.28,
  /** Highlighted pulse floor (matches prior static lit). */
  intensityBase: 0.45,
  /** Highlighted pulse peak — glanceable optional path without a strobe. */
  intensityPeak: 0.68,
  /** First walk-up tip keeps a bright floor above the pulse. */
  intensityWalkUp: 0.6,
} as const;

/**
 * Soft sine envelope for arena plaque highlight pulse (PL129.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()` / scene now).
 * @returns Envelope in [0, 1].
 */
export function arenaPlaqueHighlightPulseEnvelope(nowMs: number): number {
  const period = ARENA_PLAQUE_HIGHLIGHT_PULSE.periodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Arena plaque emissive — pulses while highlighted; walk-up tip stays bright (PL129.2).
 *
 * @param highlighted - True when arena board is nearest interact target.
 * @param showFirstWalkUpTip - True during PL45.2 first walk-up tip.
 * @param pulseEnvelope - 0..1 from `arenaPlaqueHighlightPulseEnvelope`.
 * @returns Emissive intensity.
 */
export function arenaPlaqueHighlightPulseEmissiveIntensity(
  highlighted: boolean,
  showFirstWalkUpTip: boolean,
  pulseEnvelope: number,
): number {
  const {
    intensityIdle,
    intensityBase,
    intensityPeak,
    intensityWalkUp,
  } = ARENA_PLAQUE_HIGHLIGHT_PULSE;
  if (showFirstWalkUpTip) {
    const e = Math.min(1, Math.max(0, pulseEnvelope));
    // Reason: tip stays brighter than idle highlight; soft pulse still reads optional.
    return intensityWalkUp + e * (intensityPeak - intensityWalkUp);
  }
  if (!highlighted) return intensityIdle;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

export const PORTAL_WORLD_SOFT = "Travel · free";

/** Soft secondary on warrior portal world Html (PL37.1) — Exit-first. */
export const PORTAL_WORLD_SOFT_WARRIOR = "Exit · free";

/**
 * Soft veil/frame pulse while a portal is interact-highlighted (PL120.2).
 * Complements world Travel · free label (PL37.1) + circuit tint (PL14.2).
 * Destinations / fare-free rules unchanged; mute ok.
 */
export const PORTAL_HIGHLIGHT_FREE_PULSE = {
  periodMs: 1300,
  /** Steady veil opacity when not highlighted. */
  opacityIdle: 0.35,
  /** Highlighted pulse floor. */
  opacityBase: 0.4,
  /** Highlighted pulse peak — glanceable Travel · free without a strobe. */
  opacityPeak: 0.62,
  /** Steady veil emissive when not highlighted. */
  emissiveIdle: 0.35,
  /** Highlighted pulse floor (matches prior static highlight). */
  emissiveBase: 0.8,
  /** Highlighted pulse peak. */
  emissivePeak: 1.12,
  /** First walk-up tip keeps a bright floor above the pulse. */
  emissiveWalkUp: 1.05,
} as const;

/**
 * Soft sine envelope for portal highlight Free pulse (PL120.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()` / scene now).
 * @returns Envelope in [0, 1].
 */
export function portalHighlightFreePulseEnvelope(nowMs: number): number {
  const period = PORTAL_HIGHLIGHT_FREE_PULSE.periodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Portal veil opacity — pulses only while interact-highlighted (PL120.2).
 *
 * @param highlighted - True when portal is nearest interact target.
 * @param pulseEnvelope - 0..1 from `portalHighlightFreePulseEnvelope`.
 * @returns Veil opacity.
 */
export function portalHighlightFreePulseOpacity(
  highlighted: boolean,
  pulseEnvelope: number,
): number {
  const { opacityIdle, opacityBase, opacityPeak } = PORTAL_HIGHLIGHT_FREE_PULSE;
  if (!highlighted) return opacityIdle;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return opacityBase + e * (opacityPeak - opacityBase);
}

/**
 * Portal veil emissive — pulses while highlighted; walk-up tip stays bright (PL120.2).
 *
 * @param highlighted - True when portal is nearest interact target.
 * @param showFirstWalkUpTip - True during PL42.2 first walk-up tip.
 * @param pulseEnvelope - 0..1 from `portalHighlightFreePulseEnvelope`.
 * @returns Emissive intensity.
 */
export function portalHighlightFreePulseEmissiveIntensity(
  highlighted: boolean,
  showFirstWalkUpTip: boolean,
  pulseEnvelope: number,
): number {
  const {
    emissiveIdle,
    emissiveBase,
    emissivePeak,
    emissiveWalkUp,
  } = PORTAL_HIGHLIGHT_FREE_PULSE;
  if (showFirstWalkUpTip) {
    const e = Math.min(1, Math.max(0, pulseEnvelope));
    // Reason: tip stays brighter than idle highlight; soft pulse still reads Free.
    return emissiveWalkUp + e * (emissivePeak - emissiveWalkUp);
  }
  if (!highlighted) return emissiveIdle;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return emissiveBase + e * (emissivePeak - emissiveBase);
}
