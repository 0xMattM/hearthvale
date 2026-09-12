/**
 * Visual cue configs part 11/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  EXPLORE_SECTIONS,
  ExploreSectionId,
  cssHexRgbDistance
} from "./catalog-buildings.js";
import { WARRIOR_ARENA_VISUAL } from "./catalog-cues-04.js";
import { HOMESTEAD_YARD_VISUAL } from "./catalog-cues-08.js";
import { CITY_HUB_VISUAL, CITY_PLAZA_ATMOSPHERE_CUE, CITY_PLAZA_LANDMARK_CUE } from "./catalog-cues-09.js";
import { CITY_TUTOR_LANE_ATMOSPHERE_CUE, CITY_TUTOR_LANE_LANDMARK_CUE, cityTutorLaneAtmospherePulseEnvelope } from "./catalog-cues-10.js";
import { CITY_SCARCE_YARD_ATMOSPHERE_CUE } from "./catalog-cues-23.js";

/**
 * Soft leftover mist opacity on the City tutor-lane strip (PL185.1).
 *
 * @param pulseEnvelope - 0..1 from `cityTutorLaneAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist plane.
 */
export function cityTutorLaneAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_TUTOR_LANE_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between tutor-lane leftover mist and landmark strip (PL185.1).
 *
 * @returns Soft distinct cool so leftover mist ≠ landmark mint alone.
 */
export function cityTutorLaneAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    CITY_TUTOR_LANE_ATMOSPHERE_CUE.emissive,
    CITY_TUTOR_LANE_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between tutor-lane leftover mist and plaza mist (PL185.1).
 *
 * @returns Soft distinct cool so tutor mist ≠ plaza stone mist alone.
 */
export function cityTutorLaneAtmosphereVsPlazaMistContrast(): number {
  return cssHexRgbDistance(
    CITY_TUTOR_LANE_ATMOSPHERE_CUE.emissive,
    CITY_PLAZA_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * RGB distance between tutor-lane leftover mist and scarce-yard mist (PL185.1).
 *
 * @returns Soft distinct cool so tutor mist ≠ scarce warm mist alone.
 */
export function cityTutorLaneAtmosphereVsScarceYardMistContrast(): number {
  return cssHexRgbDistance(
    CITY_TUTOR_LANE_ATMOSPHERE_CUE.emissive,
    CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive,
  );
}

/**
 * City hub floor colors for CityEnvironment (PL36.1).
 *
 * @returns Street / plaza / scarce / civic pad palette.
 */
export function cityHubFloorColors(): typeof CITY_HUB_VISUAL {
  return CITY_HUB_VISUAL;
}

/**
 * RGB distance between warm scarce yard and cool civic pad (PL36.1).
 *
 * @returns Contrast scarce yard vs civic pad.
 */
export function cityScarceVsCivicPadContrast(): number {
  return cssHexRgbDistance(
    CITY_HUB_VISUAL.scarceYardColor,
    CITY_HUB_VISUAL.civicPadColor,
  );
}

/**
 * Explore wilds canopy palette (PL36.2) — cooler/sparser than homestead meadow.
 * Section floors (PL4.*) stay on EXPLORE_SECTIONS; this is outer atmosphere only.
 */
export const EXPLORE_WILDS_VISUAL = {
  canopyColor: "#243a38",
  pathColor: "#3a4238",
  hazeColor: "#1a2830",
  hazeOpacity: 0.2,
  treeTrunkColor: "#2e241c",
  treeCanopyColor: "#1a3a36",
  treeCanopyAltColor: "#204840",
} as const;

/**
 * Explore outer canopy / path / haze for ForestEnvironment (PL36.2).
 *
 * @returns Wilds atmosphere palette.
 */
export function exploreWildsFloorColors(): typeof EXPLORE_WILDS_VISUAL {
  return EXPLORE_WILDS_VISUAL;
}

/**
 * Warrior arena atmosphere for WarriorEnvironment (PL41.2).
 *
 * @returns Arena visual palette including warm haze.
 */
export function warriorArenaAtmosphere(): typeof WARRIOR_ARENA_VISUAL {
  return WARRIOR_ARENA_VISUAL;
}

/**
 * RGB distance between warrior warm haze and explore cool haze (PL41.2).
 *
 * @returns Contrast warrior haze vs explore wilds haze.
 */
export function warriorVsExploreHazeContrast(): number {
  return cssHexRgbDistance(
    WARRIOR_ARENA_VISUAL.hazeColor,
    EXPLORE_WILDS_VISUAL.hazeColor,
  );
}

/**
 * RGB distance between homestead meadow and explore canopy (PL36.2).
 *
 * @returns Contrast homestead meadow vs explore outer canopy.
 */
export function exploreVsHomesteadCanopyContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_YARD_VISUAL.meadowColor,
    EXPLORE_WILDS_VISUAL.canopyColor,
  );
}

/**
 * Soft Explore woodland section landmark cue (PL140.1).
 * Quiet cooler haze/emissive on the existing woodland floor so wilds read
 * apart from homestead/city — complements hunt-trail PL116.1 + Explore tip PL45.1.
 * Layouts / spawns unchanged; no station invent.
 */
export const EXPLORE_SECTION_LANDMARK_CUE = {
  /** Existing woodland section — SoT floor from EXPLORE_SECTIONS. */
  sectionId: "woodland" as const,
  /** Cool wilds teal-mist — ≠ hunt warm pads / city plaza blue / homestead meadow. */
  emissive: "#3a7888",
  intensityBase: 0.08,
  intensityPeak: 0.24,
  hazeColor: "#2a5060",
  hazeOpacityBase: 0.05,
  hazeOpacityPeak: 0.14,
  /** Slightly inset vs section floor so haze reads as woodland atmosphere. */
  hazeInset: 0.85,
  pulsePeriodMs: 3400,
} as const;

export interface ExploreSectionLandmarkCueVisual {
  sectionId: ExploreSectionId;
  floorColor: string;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeWidth: number;
  hazeDepth: number;
  /** Building-grid center (× WORLD.GRID in ForestEnvironment). */
  gridX: number;
  gridZ: number;
  floorY: number;
  floorWidth: number;
  floorDepth: number;
}

/**
 * Soft woodland landmark fields for ForestEnvironment (PL140.1).
 * Always-on while on Explore — section identity, not gather-gated.
 *
 * @returns Floor / emissive / haze fields for the woodland section patch.
 */
export function exploreSectionLandmarkCue(): ExploreSectionLandmarkCueVisual {
  const c = EXPLORE_SECTION_LANDMARK_CUE;
  const section =
    EXPLORE_SECTIONS.find((s) => s.id === c.sectionId) ?? EXPLORE_SECTIONS[0]!;
  const [floorWidth, floorDepth] = section.floorSize;
  return {
    sectionId: section.id,
    floorColor: section.floorColor,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeWidth: floorWidth * c.hazeInset,
    hazeDepth: floorDepth * c.hazeInset,
    gridX: section.x,
    gridZ: section.z,
    floorY: -0.07,
    floorWidth,
    floorDepth,
  };
}

/**
 * Soft sine envelope for Explore woodland landmark pulse (PL140.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function exploreSectionLandmarkPulseEnvelope(nowMs: number): number {
  const period = EXPLORE_SECTION_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Floor emissive intensity for the Explore woodland landmark cue (PL140.1).
 *
 * @param pulseEnvelope - 0..1 from `exploreSectionLandmarkPulseEnvelope`.
 * @returns Emissive intensity for the woodland floor mesh.
 */
export function exploreSectionLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EXPLORE_SECTION_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity over the Explore woodland section (PL140.1).
 *
 * @param pulseEnvelope - 0..1 from `exploreSectionLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze plane.
 */
export function exploreSectionLandmarkHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = EXPLORE_SECTION_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between Explore woodland landmark and homestead meadow (PL140.1).
 *
 * @returns Contrast so wilds teal ≠ homestead meadow.
 */
export function exploreSectionLandmarkVsHomesteadContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_SECTION_LANDMARK_CUE.emissive,
    HOMESTEAD_YARD_VISUAL.meadowColor,
  );
}

/**
 * RGB distance between Explore woodland and city plaza fountain emissives (PL140.1).
 *
 * @returns Contrast so wilds teal ≠ plaza civic blue.
 */
export function exploreSectionLandmarkVsPlazaContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_SECTION_LANDMARK_CUE.emissive,
    CITY_PLAZA_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between Explore woodland landmark and hunt warm floor (PL140.1).
 *
 * @returns Contrast so woodland cue ≠ hunt grounds warmth (PL116.1 kinship).
 */
export function exploreSectionLandmarkVsHuntFloorContrast(): number {
  const hunt = EXPLORE_SECTIONS.find((s) => s.id === "hunt");
  return cssHexRgbDistance(
    EXPLORE_SECTION_LANDMARK_CUE.emissive,
    hunt?.floorColor ?? "#6b5434",
  );
}

/**
 * Soft Explore mines section landmark cue (PL141.1).
 * Quiet cooler stone haze/emissive on the existing mines floor so ore grounds
 * read apart from woodland landmark PL140.1 + hunt warmth — complements
 * section floors PL4.2. Layouts / spawns unchanged; no station invent.
 */
export const EXPLORE_MINES_LANDMARK_CUE = {
  /** Existing mines section — SoT floor from EXPLORE_SECTIONS. */
  sectionId: "mines" as const,
  /** Cooler stone slate — ≠ woodland teal-mist / hunt warm / homestead meadow. */
  emissive: "#586878",
  intensityBase: 0.07,
  intensityPeak: 0.22,
  hazeColor: "#3a4858",
  hazeOpacityBase: 0.05,
  hazeOpacityPeak: 0.13,
  /** Slightly inset vs section floor so haze reads as stone atmosphere. */
  hazeInset: 0.85,
  pulsePeriodMs: 3600,
} as const;

export interface ExploreMinesLandmarkCueVisual {
  sectionId: ExploreSectionId;
  floorColor: string;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeWidth: number;
  hazeDepth: number;
  /** Building-grid center (× WORLD.GRID in ForestEnvironment). */
  gridX: number;
  gridZ: number;
  floorY: number;
  floorWidth: number;
  floorDepth: number;
}

/**
 * Soft mines landmark fields for ForestEnvironment (PL141.1).
 * Always-on while on Explore — section identity, not gather-gated.
 *
 * @returns Floor / emissive / haze fields for the mines section patch.
 */
export function exploreMinesLandmarkCue(): ExploreMinesLandmarkCueVisual {
  const c = EXPLORE_MINES_LANDMARK_CUE;
  const section =
    EXPLORE_SECTIONS.find((s) => s.id === c.sectionId) ??
    EXPLORE_SECTIONS.find((s) => s.id === "mines")!;
  const [floorWidth, floorDepth] = section.floorSize;
  return {
    sectionId: section.id,
    floorColor: section.floorColor,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeWidth: floorWidth * c.hazeInset,
    hazeDepth: floorDepth * c.hazeInset,
    gridX: section.x,
    gridZ: section.z,
    floorY: -0.07,
    floorWidth,
    floorDepth,
  };
}

/**
 * Soft sine envelope for Explore mines landmark pulse (PL141.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function exploreMinesLandmarkPulseEnvelope(nowMs: number): number {
  const period = EXPLORE_MINES_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Floor emissive intensity for the Explore mines landmark cue (PL141.1).
 *
 * @param pulseEnvelope - 0..1 from `exploreMinesLandmarkPulseEnvelope`.
 * @returns Emissive intensity for the mines floor mesh.
 */
export function exploreMinesLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EXPLORE_MINES_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity over the Explore mines section (PL141.1).
 *
 * @param pulseEnvelope - 0..1 from `exploreMinesLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze plane.
 */
export function exploreMinesLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = EXPLORE_MINES_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between Explore mines landmark and woodland teal (PL141.1).
 *
 * @returns Contrast so stone slate ≠ woodland mist.
 */
export function exploreMinesLandmarkVsWoodlandContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_MINES_LANDMARK_CUE.emissive,
    EXPLORE_SECTION_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between Explore mines landmark and hunt warm floor (PL141.1).
 *
 * @returns Contrast so stone cue ≠ hunt grounds warmth.
 */
export function exploreMinesLandmarkVsHuntFloorContrast(): number {
  const hunt = EXPLORE_SECTIONS.find((s) => s.id === "hunt");
  return cssHexRgbDistance(
    EXPLORE_MINES_LANDMARK_CUE.emissive,
    hunt?.floorColor ?? "#6b5434",
  );
}

/**
 * RGB distance between Explore mines landmark and homestead meadow (PL141.1).
 *
 * @returns Contrast so stone slate ≠ homestead meadow.
 */
export function exploreMinesLandmarkVsHomesteadContrast(): number {
  return cssHexRgbDistance(
    EXPLORE_MINES_LANDMARK_CUE.emissive,
    HOMESTEAD_YARD_VISUAL.meadowColor,
  );
}

/**
 * Soft Explore vendor stall landmark cue (PL141.2).
 * Quiet warm stall haze/emissive on the existing Explore vendor so regional
 * trade reads at entry — complements vendor tip PL59.2 + premium glow PL116.2.
 * Prices / layouts unchanged; no stall invent.
 */
export const EXPLORE_VENDOR_LANDMARK_CUE = {
  /** Warm stall amber — kinship with commerce pad, louder at Explore entry. */
  emissive: "#c88840",
  intensityBase: 0.12,
  intensityPeak: 0.32,
  hazeColor: "#a87030",
  hazeOpacityBase: 0.08,
  hazeOpacityPeak: 0.2,
  hazeRadius: 1.45,
  pulsePeriodMs: 3000,
} as const;

/**
 * Soft City market board landmark cue (PL150.2).
 * Quiet warm listing-board haze so hub trade reads at glance —
 * complements market tip PL59.1 + commerce pad PL117.1; prices unchanged.
 */
export const CITY_MARKET_BOARD_LANDMARK_CUE = {
  /** Warm parchment-gold listing — hub board kinship, ≠ Explore stall amber. */
  emissive: "#d4b060",
  intensityBase: 0.1,
  intensityPeak: 0.28,
  hazeColor: "#b89848",
  hazeOpacityBase: 0.07,
  hazeOpacityPeak: 0.18,
  hazeRadius: 1.35,
  pulsePeriodMs: 3200,
} as const;
