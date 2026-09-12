/**
 * Visual cue configs part 9/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isCityLandKind,
  normalizeLandKind
} from "./catalog-buildings.js";
import { HOMESTEAD_YARD_VISUAL, HomesteadYardAtmosphereMode, HomesteadYardPresence, homesteadYardAtmosphereMode } from "./catalog-cues-08.js";

/**
 * Plot / path / optional pad colors for the homestead environment (PL22.1 / PL51.2 / PL114.1).
 *
 * @param mode - From `homesteadYardAtmosphereMode`.
 * @param presence - `visit` applies cool guest tint; default warm home.
 * @returns Floor + fence palette for HomesteadEnvironment meshes.
 */
export function homesteadYardFloorColors(
  mode: HomesteadYardAtmosphereMode,
  presence: HomesteadYardPresence = "home",
): {
  meadowColor: string;
  plotColor: string;
  pathColor: string;
  padColor: string | null;
  hazeColor: string | null;
  hazeOpacity: number;
  fencePostColor: string;
  fenceRailColor: string;
} {
  const v = HOMESTEAD_YARD_VISUAL;
  if (presence === "visit") {
    const cool = v.visit;
    if (mode === "lived") {
      return {
        meadowColor: cool.meadowColor,
        plotColor: cool.lived.plotColor,
        pathColor: cool.lived.pathColor,
        padColor: cool.lived.padColor,
        hazeColor: cool.hazeColor,
        hazeOpacity: cool.hazeOpacity,
        fencePostColor: cool.fencePostColor,
        fenceRailColor: cool.fenceRailColor,
      };
    }
    return {
      meadowColor: cool.meadowColor,
      plotColor: cool.empty.plotColor,
      pathColor: cool.empty.pathColor,
      padColor: null,
      hazeColor: cool.hazeColor,
      hazeOpacity: cool.hazeOpacity,
      fencePostColor: cool.fencePostColor,
      fenceRailColor: cool.fenceRailColor,
    };
  }
  if (mode === "lived") {
    return {
      meadowColor: v.meadowColor,
      plotColor: v.lived.plotColor,
      pathColor: v.lived.pathColor,
      padColor: v.lived.padColor,
      hazeColor: null,
      hazeOpacity: 0,
      fencePostColor: v.lived.fencePostColor,
      fenceRailColor: v.lived.fenceRailColor,
    };
  }
  return {
    meadowColor: v.empty.meadowColor,
    plotColor: v.empty.plotColor,
    pathColor: v.empty.pathColor,
    padColor: null,
    hazeColor: null,
    hazeOpacity: 0,
    fencePostColor: v.empty.fencePostColor,
    fenceRailColor: v.empty.fenceRailColor,
  };
}

/**
 * RGB distance between empty and lived homestead plot floors (PL22.1).
 *
 * @returns Distance empty plot vs lived plot.
 */
export function homesteadYardPlotContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_YARD_VISUAL.empty.plotColor,
    HOMESTEAD_YARD_VISUAL.lived.plotColor,
  );
}

/**
 * RGB distance between empty and lived path tints (PL22.1).
 *
 * @returns Distance empty path vs lived path.
 */
export function homesteadYardPathContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_YARD_VISUAL.empty.pathColor,
    HOMESTEAD_YARD_VISUAL.lived.pathColor,
  );
}

/**
 * RGB distance between warm home meadow and cool visit meadow (PL51.2).
 *
 * @returns Contrast home vs visit meadow floors.
 */
export function homesteadVisitVsHomeMeadowContrast(): number {
  return cssHexRgbDistance(
    HOMESTEAD_YARD_VISUAL.meadowColor,
    HOMESTEAD_YARD_VISUAL.visit.meadowColor,
  );
}

/**
 * Whether the homestead scene should use the cool visit atmosphere (PL51.2).
 * Visit rules / trade hotkey unchanged — atmosphere only.
 *
 * @param visiting - True when viewing another player's land.
 * @param landKind - Active scene land kind.
 * @returns `visit` on player_land visits; otherwise `home`.
 */
export function homesteadYardPresenceFor(
  visiting: boolean,
  landKind: string | null | undefined,
): HomesteadYardPresence {
  if (!visiting) return "home";
  const kind = landKind ? normalizeLandKind(landKind) : null;
  return kind === "player_land" || kind === null ? "visit" : "home";
}

/**
 * Soft visit-land atmosphere leftover (PL175.2).
 * Quiet cool visit mist tint/haze while visiting another player's land —
 * complements visit tip + leave cue + PL51.2 static cool floors; visit rules
 * unchanged; mute ok. Always-on while presence is visit (not tip-gated).
 */
export const VISIT_LAND_ATMOSPHERE_CUE = {
  /** Cool guest mist — ≠ home path amber / nameplate teal alone / leave HUD text. */
  emissive: "#2a5868",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#142430",
  hazeOpacityBase: 0.05,
  hazeOpacityPeak: 0.14,
  hazeWidth: 42,
  hazeDepth: 34,
  /** Slower than nameplate reinforce so continuous mist stays glanceable. */
  pulsePeriodMs: 4200,
} as const;

export interface VisitLandAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeWidth: number;
  hazeDepth: number;
}

/**
 * Soft visit-land atmosphere leftover fields (PL175.2).
 * Always-on while homestead presence is `visit` — complements PL51.2 static haze.
 *
 * @param presence - From `homesteadYardPresenceFor`.
 * @returns Cool mist haze fields; `show` false on home.
 */
export function visitLandAtmosphereCue(
  presence: HomesteadYardPresence,
): VisitLandAtmosphereCueVisual {
  const c = VISIT_LAND_ATMOSPHERE_CUE;
  if (presence !== "visit") {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeWidth: c.hazeWidth,
      hazeDepth: c.hazeDepth,
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
  };
}

/**
 * Soft sine envelope for visit-land atmosphere leftover pulse (PL175.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function visitLandAtmospherePulseEnvelope(nowMs: number): number {
  const period = VISIT_LAND_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the visit-land atmosphere leftover (PL175.2).
 *
 * @param pulseEnvelope - 0..1 from `visitLandAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist plane.
 */
export function visitLandAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = VISIT_LAND_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity while visiting (PL175.2).
 *
 * @param pulseEnvelope - 0..1 from `visitLandAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist plane.
 */
export function visitLandAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = VISIT_LAND_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between visit leftover mist and PL51.2 static visit haze (PL175.2).
 *
 * @returns Soft distinct cool so leftover mist ≠ static guest haze alone.
 */
export function visitLandAtmosphereVsStaticHazeContrast(): number {
  return cssHexRgbDistance(
    VISIT_LAND_ATMOSPHERE_CUE.hazeColor,
    HOMESTEAD_YARD_VISUAL.visit.hazeColor,
  );
}

/**
 * RGB distance between visit leftover mist and home lived path (PL175.2).
 *
 * @returns Soft distinct cool so visit mist ≠ home path warmth.
 */
export function visitLandAtmosphereVsHomePathContrast(): number {
  return cssHexRgbDistance(
    VISIT_LAND_ATMOSPHERE_CUE.emissive,
    HOMESTEAD_YARD_VISUAL.lived.pathColor,
  );
}

/**
 * City hub floor palette (PL36.1) — cooler civic streets/plaza vs warm scarce yard.
 * Complements PL1.1 scarce pads; does not invent stations.
 */
export const CITY_HUB_VISUAL = {
  /** Lighter than early grey so night fog does not erase outer streets into void. */
  streetsColor: "#6a727c",
  plazaColor: "#8a9098",
  /** Warm shared-yard pad (PL1.1) — stays distinct from cool civic tint. */
  scarceYardColor: "#9a7a58",
  tutorLaneColor: "#5e6860",
  plazaInlayColor: "#8a9098",
  /** Paved plaza walk (cobble) — cooler than scarce dirt, darker than plaza stone. */
  roadColor: "#747c84",
  /** Quiet cool ground under civic blocks so they read apart from the scarce yard. */
  civicPadColor: "#6a7380",
} as const;

/**
 * Soft fountain landmark cue at city plaza center (PL125.1).
 * Quiet cool emissive + haze on the existing fountain so hub center reads apart
 * from warm scarce yards — no new stations; contention / layouts unchanged.
 */
export const CITY_PLAZA_LANDMARK_CUE = {
  /** Basin / pillar body (matches existing plaza fountain stone). */
  basinColor: "#6a7a8a",
  spoutColor: "#8aa0b0",
  /** Cool civic emissive — kinship with civic pads, not scarce amber. */
  emissive: "#6a98b8",
  intensityBase: 0.14,
  intensityPeak: 0.36,
  hazeColor: "#4a7088",
  hazeOpacityBase: 0.08,
  hazeOpacityPeak: 0.2,
  hazeRadius: 2.4,
  pulsePeriodMs: 2800,
} as const;

export interface CityPlazaLandmarkCueVisual {
  basinColor: string;
  spoutColor: string;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft plaza landmark fields for CityEnvironment fountain (PL125.1).
 * Always-on while in City — hub identity, not busy-gated.
 *
 * @returns Basin / spout / emissive / haze fields for the plaza fountain.
 */
export function cityPlazaLandmarkCue(): CityPlazaLandmarkCueVisual {
  const c = CITY_PLAZA_LANDMARK_CUE;
  return {
    basinColor: c.basinColor,
    spoutColor: c.spoutColor,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeRadius: c.hazeRadius,
  };
}

/**
 * Soft sine envelope for plaza fountain landmark pulse (PL125.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function cityPlazaLandmarkPulseEnvelope(nowMs: number): number {
  const period = CITY_PLAZA_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Fountain emissive intensity for the plaza landmark cue (PL125.1).
 *
 * @param pulseEnvelope - 0..1 from `cityPlazaLandmarkPulseEnvelope`.
 * @returns Emissive intensity for basin / spout meshes.
 */
export function cityPlazaLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_PLAZA_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under the plaza fountain (PL125.1).
 *
 * @param pulseEnvelope - 0..1 from `cityPlazaLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function cityPlazaLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CITY_PLAZA_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between plaza landmark emissive and warm scarce yard (PL125.1).
 *
 * @returns Contrast so hub fountain ≠ scarce amber.
 */
export function cityPlazaLandmarkVsScarceYardContrast(): number {
  return cssHexRgbDistance(
    CITY_PLAZA_LANDMARK_CUE.emissive,
    CITY_HUB_VISUAL.scarceYardColor,
  );
}

/**
 * Soft City plaza atmosphere leftover (PL182.1).
 * Quiet cool pulsing plaza mist tint/haze over existing city plaza floor while
 * on City — complements fountain landmark PL125.1 + scarce-yard mist PL177.2;
 * layouts unchanged; mute ok. Continuous City leftover over the cool plaza
 * (not tip / fountain-gated).
 */
export const CITY_PLAZA_ATMOSPHERE_CUE = {
  /** Cool plaza stone mist — ≠ fountain cyan #6a98b8 / scarce warm mist / civic pad. */
  emissive: "#4a7898",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#142028",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  /** Matches CityEnvironment plaza plane (32×28), slight inset. */
  hazeWidth: 30,
  hazeDepth: 26,
  plazaCenterX: 0,
  plazaCenterZ: 0,
  hazeY: 0.09,
  /** Slower than fountain landmark so continuous mist stays glanceable. */
  pulsePeriodMs: 4200,
} as const;

export interface CityPlazaAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeWidth: number;
  hazeDepth: number;
  plazaCenterX: number;
  plazaCenterZ: number;
  hazeY: number;
}

/**
 * Soft City plaza atmosphere leftover fields (PL182.1).
 * Always-on while CityEnvironment is mounted — not tip / fountain-gated.
 *
 * @param landKind - Active map; cue only on City.
 * @returns Cool plaza mist fields; `show` false off City.
 */
export function cityPlazaAtmosphereCue(
  landKind?: string | null,
): CityPlazaAtmosphereCueVisual {
  const c = CITY_PLAZA_ATMOSPHERE_CUE;
  if (!landKind || !isCityLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeWidth: c.hazeWidth,
      hazeDepth: c.hazeDepth,
      plazaCenterX: c.plazaCenterX,
      plazaCenterZ: c.plazaCenterZ,
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
    plazaCenterX: c.plazaCenterX,
    plazaCenterZ: c.plazaCenterZ,
    hazeY: c.hazeY,
  };
}
