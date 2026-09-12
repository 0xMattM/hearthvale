/**
 * Cosmetic day/night cycle (F14.5) — lighting only; no gameplay power.
 */

export type DayPhase = "dawn" | "day" | "dusk" | "night";

/** Real-time length of one full cosmetic day (8 minutes). */
export const DAY_CYCLE_MS = 8 * 60 * 1000;

export interface DayNightPalette {
  phase: DayPhase;
  /** 0–1 through the cycle. */
  progress: number;
  background: string;
  fog: string;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  sunIntensity: number;
  sunPosition: [number, number, number];
  label: string;
}

const PHASE_LABEL: Record<DayPhase, string> = {
  dawn: "Dawn",
  day: "Day",
  dusk: "Dusk",
  night: "Night",
};

/**
 * Progress through the accelerated day cycle (0–1).
 */
export function dayCycleProgress(
  nowMs: number,
  cycleMs: number = DAY_CYCLE_MS,
): number {
  if (cycleMs <= 0) return 0;
  const t = ((nowMs % cycleMs) + cycleMs) % cycleMs;
  return t / cycleMs;
}

/**
 * Maps cycle progress to a named phase.
 */
export function dayPhaseFromProgress(progress: number): DayPhase {
  const p = ((progress % 1) + 1) % 1;
  if (p < 0.18) return "dawn";
  if (p < 0.52) return "day";
  if (p < 0.72) return "dusk";
  return "night";
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ] as const;
  };
  const ca = parse(a);
  const cb = parse(b);
  const r = Math.round(lerp(ca[0], cb[0], t));
  const g = Math.round(lerp(ca[1], cb[1], t));
  const bl = Math.round(lerp(ca[2], cb[2], t));
  return `#${[r, g, bl].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

interface Keyframe {
  at: number;
  background: string;
  fog: string;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  sunIntensity: number;
  sunY: number;
  sunX: number;
}

const HOMESTEAD_KEYS: Keyframe[] = [
  {
    at: 0,
    background: "#7a8eb0",
    fog: "#9aacc4",
    hemiSky: "#e0d0b8",
    hemiGround: "#4a5e38",
    hemiIntensity: 0.55,
    sunIntensity: 1.05,
    sunY: 8,
    sunX: -8,
  },
  {
    at: 0.18,
    background: "#8eb4d4",
    fog: "#a8c0d4",
    hemiSky: "#e4f0ff",
    hemiGround: "#4a6238",
    hemiIntensity: 0.62,
    sunIntensity: 1.55,
    sunY: 18,
    sunX: 12,
  },
  {
    at: 0.52,
    background: "#8eb4d4",
    fog: "#a8c0d4",
    hemiSky: "#e4f0ff",
    hemiGround: "#4a6238",
    hemiIntensity: 0.62,
    sunIntensity: 1.55,
    sunY: 18,
    sunX: 12,
  },
  {
    at: 0.72,
    background: "#d4a070",
    fog: "#c8a888",
    hemiSky: "#f0d0a8",
    hemiGround: "#4a3c28",
    hemiIntensity: 0.55,
    sunIntensity: 1.15,
    sunY: 9,
    sunX: 14,
  },
  {
    at: 1,
    // Reason: night must stay readable — near-black fog made the world feel broken.
    background: "#2a3858",
    fog: "#3a4868",
    hemiSky: "#6a7a9a",
    hemiGround: "#2a3420",
    hemiIntensity: 0.5,
    sunIntensity: 0.85,
    sunY: 5,
    sunX: -6,
  },
];

const FOREST_KEYS: Keyframe[] = [
  {
    at: 0,
    background: "#4a6054",
    fog: "#5a7064",
    hemiSky: "#b0d0b8",
    hemiGround: "#2a3c22",
    hemiIntensity: 0.5,
    sunIntensity: 0.95,
    sunY: 8,
    sunX: -4,
  },
  {
    at: 0.18,
    background: "#4a6850",
    fog: "#5a7860",
    hemiSky: "#b8d8c0",
    hemiGround: "#2a3c22",
    hemiIntensity: 0.56,
    sunIntensity: 1.35,
    sunY: 15,
    sunX: 8,
  },
  {
    at: 0.52,
    background: "#4a6850",
    fog: "#5a7860",
    hemiSky: "#b8d8c0",
    hemiGround: "#2a3c22",
    hemiIntensity: 0.56,
    sunIntensity: 1.35,
    sunY: 15,
    sunX: 8,
  },
  {
    at: 0.72,
    background: "#6a5440",
    fog: "#786050",
    hemiSky: "#c8a888",
    hemiGround: "#2a2418",
    hemiIntensity: 0.5,
    sunIntensity: 1.0,
    sunY: 8,
    sunX: 10,
  },
  {
    at: 1,
    background: "#243438",
    fog: "#304448",
    hemiSky: "#4a6058",
    hemiGround: "#1a2818",
    hemiIntensity: 0.48,
    sunIntensity: 0.75,
    sunY: 4,
    sunX: -4,
  },
];

function sampleKeys(keys: Keyframe[], progress: number): Keyframe {
  const p = Math.min(1, Math.max(0, progress));
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (p >= a.at && p <= b.at) {
      const t = (p - a.at) / (b.at - a.at || 1);
      return {
        at: p,
        background: lerpHex(a.background, b.background, t),
        fog: lerpHex(a.fog, b.fog, t),
        hemiSky: lerpHex(a.hemiSky, b.hemiSky, t),
        hemiGround: lerpHex(a.hemiGround, b.hemiGround, t),
        hemiIntensity: lerp(a.hemiIntensity, b.hemiIntensity, t),
        sunIntensity: lerp(a.sunIntensity, b.sunIntensity, t),
        sunY: lerp(a.sunY, b.sunY, t),
        sunX: lerp(a.sunX, b.sunX, t),
      };
    }
  }
  return keys[keys.length - 1]!;
}

/**
 * Lighting palette for the current cosmetic time of day.
 * When disabled, locks to midday (no power change — visuals only).
 * City/warrior reuse homestead keys with slightly tighter fog (CL1.3).
 */
export function dayNightPalette(
  nowMs: number,
  landKind:
    | "city"
    | "player_land"
    | "explore"
    | "warrior"
    | "starter"
    | "forest" = "player_land",
  enabled = true,
): DayNightPalette {
  const progress = enabled ? dayCycleProgress(nowMs) : 0.35;
  const phase = dayPhaseFromProgress(progress);
  const explore = landKind === "explore" || landKind === "forest";
  const keys = explore ? FOREST_KEYS : HOMESTEAD_KEYS;
  const sample = sampleKeys(keys, progress);
  const sunZ =
    landKind === "warrior" ? 3.5 : explore ? 4 : landKind === "city" ? 5 : 6;
  return {
    phase,
    progress,
    background: sample.background,
    fog: sample.fog,
    hemiSky: sample.hemiSky,
    hemiGround: sample.hemiGround,
    hemiIntensity: sample.hemiIntensity,
    sunIntensity: sample.sunIntensity,
    sunPosition: [sample.sunX, sample.sunY, sunZ],
    label: PHASE_LABEL[phase],
  };
}

/**
 * Cool fill opposite the key sun so kit faces are not a single hard plane.
 *
 * @param sun - Key light world position.
 * @returns Fill light position (no shadow).
 */
export function fillLightPosition(
  sun: readonly [number, number, number],
): [number, number, number] {
  return [
    -sun[0] * 0.55,
    Math.max(3.5, sun[1] * 0.42),
    -sun[2] * 0.55,
  ];
}

/**
 * Readability floors so dusk/night stay playable (never crush to near-black).
 * Cosmetic only — no gameplay power.
 */
export const LIGHTING_READABILITY = {
  minHemi: 0.48,
  minSun: 0.62,
  ambient: 0.28,
  fillSunFactor: 0.34,
  keySunFactor: 1.05,
} as const;

/**
 * Clamps hemi/sun for readable world lighting.
 *
 * @param hemi - Palette hemi intensity.
 * @param sun - Palette sun intensity.
 * @returns Floored intensities.
 */
export function readableLightIntensities(
  hemi: number,
  sun: number,
): { hemi: number; sun: number } {
  return {
    hemi: Math.max(LIGHTING_READABILITY.minHemi, hemi),
    sun: Math.max(LIGHTING_READABILITY.minSun, sun),
  };
}

/**
 * True when night-ish (for HUD accent only — never gates actions).
 */
export function isCosmeticNight(phase: DayPhase): boolean {
  return phase === "night" || phase === "dusk";
}

/**
 * Soft world haze reinforce on dusk↔night / night↔dawn edges (PL122.2).
 * Complements day-night lighting + PL57.2 phase cues; cycle toggle unchanged.
 */
export const DAY_PHASE_EDGE_HAZE = {
  /** Half-width of reinforce window in cycle progress (0–1). */
  halfWidth: 0.045,
  /** Dusk↔night boundary (matches dayPhaseFromProgress dusk→night). */
  duskNightAt: 0.72,
  /** Night↔dawn wrap boundary. */
  nightDawnAt: 0,
  /** Pull fog nearer at peak reinforce. */
  fogNearPull: 5,
  /** Pull fog far plane nearer at peak reinforce. */
  fogFarPull: 8,
  /** Warm amber mix into fog at dusk↔night. */
  duskNightFog: "#c89868",
  /** Cool indigo mix into fog at night↔dawn. */
  nightDawnFog: "#3a4868",
  /** How far fog lerps toward edge cue color at peak. */
  fogColorMix: 0.42,
  /** Soft hemi sky bump at peak (readable light without power change). */
  hemiBoost: 0.1,
  /** Soft sun dip at peak so haze reads over glare. */
  sunDip: 0.15,
} as const;

/** Which day-phase edge is reinforcing haze (PL122.2). */
export type DayPhaseEdgeKind = "dusk_night" | "night_dawn";

/**
 * Circular distance on the [0,1) day cycle (wrap-aware).
 *
 * @param a - First progress.
 * @param b - Second progress.
 * @returns Shortest distance on the unit circle.
 */
export function dayCycleProgressDistance(a: number, b: number): number {
  const wrap = (p: number) => ((p % 1) + 1) % 1;
  const d = Math.abs(wrap(a) - wrap(b));
  return Math.min(d, 1 - d);
}

/**
 * Which phase-edge haze window contains this progress, if any (PL122.2).
 *
 * @param progress - Cycle progress 0–1.
 * @param cycleEnabled - Client dayNightCycle preference.
 * @returns Edge kind, or null when outside reinforce windows / disabled.
 */
export function dayPhaseEdgeHazeKind(
  progress: number,
  cycleEnabled = true,
): DayPhaseEdgeKind | null {
  if (!cycleEnabled || !Number.isFinite(progress)) return null;
  const { halfWidth, duskNightAt, nightDawnAt } = DAY_PHASE_EDGE_HAZE;
  if (dayCycleProgressDistance(progress, duskNightAt) <= halfWidth) {
    return "dusk_night";
  }
  if (dayCycleProgressDistance(progress, nightDawnAt) <= halfWidth) {
    return "night_dawn";
  }
  return null;
}

/**
 * Soft triangle envelope peaking at the nearest dusk/night or night/dawn edge (PL122.2).
 *
 * @param progress - Cycle progress 0–1.
 * @param cycleEnabled - Client dayNightCycle preference.
 * @returns Envelope in [0, 1]; 0 when disabled or far from edges.
 */
export function dayPhaseEdgeHazeEnvelope(
  progress: number,
  cycleEnabled = true,
): number {
  const kind = dayPhaseEdgeHazeKind(progress, cycleEnabled);
  if (!kind) return 0;
  const { halfWidth, duskNightAt, nightDawnAt } = DAY_PHASE_EDGE_HAZE;
  const at = kind === "dusk_night" ? duskNightAt : nightDawnAt;
  const dist = dayCycleProgressDistance(progress, at);
  if (halfWidth <= 0) return 0;
  return Math.max(0, 1 - dist / halfWidth);
}

/**
 * Fog near/far planes with soft edge pull (PL122.2).
 *
 * @param fogNear - Base fog near.
 * @param fogFar - Base fog far.
 * @param envelope - Edge haze envelope 0–1.
 * @returns Adjusted [near, far] (far stays above near).
 */
export function dayPhaseEdgeHazeFogRange(
  fogNear: number,
  fogFar: number,
  envelope: number,
): [number, number] {
  const e = Math.min(1, Math.max(0, Number.isFinite(envelope) ? envelope : 0));
  const near = fogNear - DAY_PHASE_EDGE_HAZE.fogNearPull * e;
  const far = fogFar - DAY_PHASE_EDGE_HAZE.fogFarPull * e;
  const safeNear = Math.max(4, near);
  const safeFar = Math.max(safeNear + 6, far);
  return [safeNear, safeFar];
}

/**
 * Fog color with soft edge reinforce mix (PL122.2).
 *
 * @param baseFog - Palette fog hex.
 * @param kind - Active edge kind, or null.
 * @param envelope - Edge haze envelope 0–1.
 * @returns Mixed fog hex.
 */
export function dayPhaseEdgeHazeFogColor(
  baseFog: string,
  kind: DayPhaseEdgeKind | null,
  envelope: number,
): string {
  const e = Math.min(1, Math.max(0, Number.isFinite(envelope) ? envelope : 0));
  if (!kind || e <= 0) return baseFog;
  const cue =
    kind === "dusk_night"
      ? DAY_PHASE_EDGE_HAZE.duskNightFog
      : DAY_PHASE_EDGE_HAZE.nightDawnFog;
  return lerpHex(baseFog, cue, DAY_PHASE_EDGE_HAZE.fogColorMix * e);
}

/**
 * Hemi intensity with soft edge bump (PL122.2).
 *
 * @param base - Palette hemi intensity.
 * @param envelope - Edge haze envelope 0–1.
 * @returns Boosted intensity.
 */
export function dayPhaseEdgeHazeHemiIntensity(
  base: number,
  envelope: number,
): number {
  const e = Math.min(1, Math.max(0, Number.isFinite(envelope) ? envelope : 0));
  return base + DAY_PHASE_EDGE_HAZE.hemiBoost * e;
}

/**
 * Sun intensity with soft edge dip so haze reads (PL122.2).
 *
 * @param base - Palette sun intensity.
 * @param envelope - Edge haze envelope 0–1.
 * @returns Dipped intensity (never below a quiet floor).
 */
export function dayPhaseEdgeHazeSunIntensity(
  base: number,
  envelope: number,
): number {
  const e = Math.min(1, Math.max(0, Number.isFinite(envelope) ? envelope : 0));
  return Math.max(0.08, base * (1 - DAY_PHASE_EDGE_HAZE.sunDip * e));
}
