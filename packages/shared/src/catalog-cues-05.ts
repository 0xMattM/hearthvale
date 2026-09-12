/**
 * Visual cue configs part 5/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isWarriorLandKind
} from "./catalog-buildings.js";
import { PORTAL_HIGHLIGHT_FREE_PULSE, portalHighlightFreePulseEnvelope } from "./catalog-cues-04.js";

/**
 * Quiet cooler free-travel pulse on the portal threshold while interact-highlighted
 * (PL144.1 leftover). Complements veil Free pulse (PL120.2) + Travel · free soft
 * (PL37.1) + walk-up tip (PL42.2). Shared cool cyan so Arena warm map tint still
 * reads fare-free underfoot; destinations / fares unchanged; mute ok.
 */
export const PORTAL_FREE_TRAVEL_SOFT_PULSE = {
  /** Same period as veil Free pulse so threshold + veil stay in phase. */
  periodMs: PORTAL_HIGHLIGHT_FREE_PULSE.periodMs,
  /** Cooler free-travel cyan (city veil kinship — not map-warm Arena orange). */
  emissive: "#6ec8ff",
  /** Threshold stays dark when not highlighted. */
  emissiveIdle: 0,
  /** Highlighted pulse floor — quiet underfoot read. */
  emissiveBase: 0.14,
  /** Highlighted pulse peak — glanceable Free without a strobe. */
  emissivePeak: 0.42,
} as const;

/**
 * True when the portal threshold should soft-pulse free-travel (PL144.1).
 *
 * @param highlighted - True when portal is nearest interact target.
 * @returns True when the cooler threshold pulse should run.
 */
export function portalFreeTravelSoftPulseActive(highlighted: boolean): boolean {
  return highlighted === true;
}

/**
 * Soft sine envelope for portal free-travel threshold pulse (PL144.1).
 * Locked to the same phase as `portalHighlightFreePulseEnvelope`.
 *
 * @param nowMs - Clock ms (e.g. `performance.now()` / scene now).
 * @returns Envelope in [0, 1].
 */
export function portalFreeTravelSoftPulseEnvelope(nowMs: number): number {
  return portalHighlightFreePulseEnvelope(nowMs);
}

/**
 * Threshold emissive color — cooler free-travel cyan while highlighted (PL144.1).
 *
 * @param highlighted - True when portal is nearest interact target.
 * @returns Emissive hex for the portal threshold slab.
 */
export function portalFreeTravelSoftPulseEmissive(
  highlighted: boolean,
): string {
  if (!portalFreeTravelSoftPulseActive(highlighted)) return "#000000";
  return PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive;
}

/**
 * Threshold emissive intensity — pulses only while interact-highlighted (PL144.1).
 *
 * @param highlighted - True when portal is nearest interact target.
 * @param pulseEnvelope - 0..1 from `portalFreeTravelSoftPulseEnvelope`.
 * @returns Emissive intensity for the portal threshold slab.
 */
export function portalFreeTravelSoftPulseEmissiveIntensity(
  highlighted: boolean,
  pulseEnvelope: number,
): number {
  const { emissiveIdle, emissiveBase, emissivePeak } =
    PORTAL_FREE_TRAVEL_SOFT_PULSE;
  if (!portalFreeTravelSoftPulseActive(highlighted)) return emissiveIdle;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return emissiveBase + e * (emissivePeak - emissiveBase);
}

/**
 * Soft portal Free landmark cue leftover (PL168.2).
 * Quiet cool Free cyan haze/emissive on existing portal while Free —
 * complements Free portal pulse PL144.1 (interact-gated) + travel rim PL164.1.
 * Always-on on non-Arena portals (fare-free circuit identity); Arena keeps Exit
 * pulse PL147.2 as the primary underfoot cue. Fares free; mute ok.
 */
export const PORTAL_FREE_LANDMARK_CUE = {
  /** Quieter Free cyan — ≠ highlight threshold #6ec8ff / Exit amber. */
  emissive: "#5eb0e0",
  intensityBase: 0.05,
  intensityPeak: 0.15,
  hazeColor: "#2a4860",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  hazeRadius: 1.12,
  /** Slower than interact Free pulse so continuous landmark stays glanceable. */
  pulsePeriodMs: 3400,
} as const;

export interface PortalFreeLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft portal Free landmark fields (PL168.2).
 * Always-on while a fare-free portal mesh is mounted on a non-Arena map —
 * not interact-gated (PL144.1 stays the highlight pulse).
 *
 * @param landKind - Active map where the portal stands; cue off on Warrior.
 * @returns Cool Free cyan haze fields; `show` false on Arena / missing kind.
 */
export function portalFreeLandmarkCue(
  landKind?: string | null,
): PortalFreeLandmarkCueVisual {
  const c = PORTAL_FREE_LANDMARK_CUE;
  if (!landKind || isWarriorLandKind(String(landKind))) {
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
 * Soft sine envelope for portal Free landmark pulse (PL168.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function portalFreeLandmarkPulseEnvelope(nowMs: number): number {
  const period = PORTAL_FREE_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the portal Free landmark (PL168.2).
 *
 * @param pulseEnvelope - 0..1 from `portalFreeLandmarkPulseEnvelope`.
 * @returns Emissive intensity for footing / haze.
 */
export function portalFreeLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = PORTAL_FREE_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under a Free portal (PL168.2).
 *
 * @param pulseEnvelope - 0..1 from `portalFreeLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function portalFreeLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = PORTAL_FREE_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between portal Free landmark and Free travel soft pulse (PL168.2).
 *
 * @returns Soft distinct Free cyan so continuous landmark ≠ highlight pulse alone.
 */
export function portalFreeLandmarkVsSoftPulseContrast(): number {
  return cssHexRgbDistance(
    PORTAL_FREE_LANDMARK_CUE.emissive,
    PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive,
  );
}

/**
 * Quiet warmer Exit pulse on warrior portal threshold while interact-highlighted
 * (PL147.2 leftover). Complements Exit · free soft (PL37.1) + cooler free-travel
 * cyan (PL144.1). Warm Arena / plaque kinship so Exit reads apart from city Free;
 * fare-free / destinations unchanged; mute ok.
 */
export const PORTAL_ARENA_EXIT_SOFT_PULSE = {
  /** Same period as Free pulses so veil + threshold stay in phase. */
  periodMs: PORTAL_HIGHLIGHT_FREE_PULSE.periodMs,
  /** Warmer Exit amber — Arena accent / plaque kinship (not cool Free cyan). */
  emissive: "#e09060",
  /** Threshold stays dark when not highlighted. */
  emissiveIdle: 0,
  /** Highlighted pulse floor — quiet underfoot Exit read. */
  emissiveBase: 0.16,
  /** Highlighted pulse peak — glanceable Exit without a strobe. */
  emissivePeak: 0.46,
} as const;

/**
 * RGB distance between portal Free landmark and Arena Exit pulse (PL168.2).
 *
 * @returns Soft distinct Free cyan so continuous landmark ≠ Exit amber.
 */
export function portalFreeLandmarkVsArenaExitContrast(): number {
  return cssHexRgbDistance(
    PORTAL_FREE_LANDMARK_CUE.emissive,
    PORTAL_ARENA_EXIT_SOFT_PULSE.emissive,
  );
}

/**
 * Soft portal Free atmosphere leftover (PL186.1).
 * Quiet cool pulsing mist tint/haze over existing Free portal footing while on
 * non-Arena maps — complements Free landmark PL168.2 + threshold pulse PL144.1.
 * Distinct deeper cool (not a second identical Free cyan disc); destinations /
 * fares unchanged; mute ok. Continuous leftover on fare-free portals; Arena keeps
 * Exit pulse PL147.2 as the primary underfoot cue.
 */
export const PORTAL_FREE_ATMOSPHERE_CUE = {
  /** Deeper cool Free mist — ≠ landmark #5eb0e0 / soft pulse #6ec8ff / Exit amber. */
  emissive: "#3a7090",
  intensityBase: 0.03,
  intensityPeak: 0.1,
  hazeColor: "#142838",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Wider than landmark disc (1.12) so leftover mist reads as portal-zone atmosphere. */
  hazeRadius: 1.55,
  /** Above landmark haze (y=0.012) so leftover mist stacks quietly. */
  hazeY: 0.028,
  /** Slower than landmark (3400) so continuous mist stays glanceable. */
  pulsePeriodMs: 4400,
} as const;

export interface PortalFreeAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft portal Free atmosphere leftover fields (PL186.1).
 * Always-on while a fare-free portal mesh is mounted on a non-Arena map —
 * not interact-gated (PL144.1 stays the highlight pulse; PL168.2 stays landmark).
 *
 * @param landKind - Active map where the portal stands; cue off on Warrior.
 * @returns Cool Free mist fields; `show` false on Arena / missing kind.
 */
export function portalFreeAtmosphereCue(
  landKind?: string | null,
): PortalFreeAtmosphereCueVisual {
  const c = PORTAL_FREE_ATMOSPHERE_CUE;
  if (!landKind || isWarriorLandKind(String(landKind))) {
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
 * Soft sine envelope for portal Free atmosphere leftover (PL186.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function portalFreeAtmospherePulseEnvelope(nowMs: number): number {
  const period = PORTAL_FREE_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the portal Free atmosphere leftover (PL186.1).
 *
 * @param pulseEnvelope - 0..1 from `portalFreeAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function portalFreeAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = PORTAL_FREE_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity under a Free portal (PL186.1).
 *
 * @param pulseEnvelope - 0..1 from `portalFreeAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function portalFreeAtmosphereHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = PORTAL_FREE_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between portal Free atmosphere mist and Free landmark (PL186.1).
 *
 * @returns Soft distinct cool so leftover mist ≠ landmark Free cyan alone.
 */
export function portalFreeAtmosphereVsLandmarkContrast(): number {
  return cssHexRgbDistance(
    PORTAL_FREE_ATMOSPHERE_CUE.emissive,
    PORTAL_FREE_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between portal Free atmosphere mist and Free travel soft pulse
 * (PL186.1).
 *
 * @returns Soft distinct cool so leftover mist ≠ highlight threshold alone.
 */
export function portalFreeAtmosphereVsSoftPulseContrast(): number {
  return cssHexRgbDistance(
    PORTAL_FREE_ATMOSPHERE_CUE.emissive,
    PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive,
  );
}

/**
 * RGB distance between portal Free atmosphere mist and Arena Exit pulse (PL186.1).
 *
 * @returns Soft distinct cool so Free mist ≠ Exit amber.
 */
export function portalFreeAtmosphereVsArenaExitContrast(): number {
  return cssHexRgbDistance(
    PORTAL_FREE_ATMOSPHERE_CUE.emissive,
    PORTAL_ARENA_EXIT_SOFT_PULSE.emissive,
  );
}

/**
 * True when a warrior portal threshold should soft-pulse Exit warmth (PL147.2).
 *
 * @param highlighted - True when portal is nearest interact target.
 * @param landKind - Active map where the portal stands.
 * @returns True when the warmer Exit threshold pulse should run.
 */
export function portalArenaExitSoftPulseActive(
  highlighted: boolean,
  landKind?: string | null,
): boolean {
  if (highlighted !== true) return false;
  if (landKind == null || landKind === "") return false;
  return isWarriorLandKind(String(landKind));
}

/**
 * Soft sine envelope for warrior Exit threshold pulse (PL147.2).
 * Locked to the same phase as free-travel / veil Free pulses.
 *
 * @param nowMs - Clock ms (e.g. `performance.now()` / scene now).
 * @returns Envelope in [0, 1].
 */
export function portalArenaExitSoftPulseEnvelope(nowMs: number): number {
  return portalHighlightFreePulseEnvelope(nowMs);
}

/**
 * Threshold emissive color — warmer Exit amber on warrior portals (PL147.2).
 *
 * @param highlighted - True when portal is nearest interact target.
 * @param landKind - Active map where the portal stands.
 * @returns Emissive hex for the portal threshold slab.
 */
export function portalArenaExitSoftPulseEmissive(
  highlighted: boolean,
  landKind?: string | null,
): string {
  if (!portalArenaExitSoftPulseActive(highlighted, landKind)) return "#000000";
  return PORTAL_ARENA_EXIT_SOFT_PULSE.emissive;
}

/**
 * Threshold emissive intensity — warmer Exit pulse on warrior portals (PL147.2).
 *
 * @param highlighted - True when portal is nearest interact target.
 * @param landKind - Active map where the portal stands.
 * @param pulseEnvelope - 0..1 from `portalArenaExitSoftPulseEnvelope`.
 * @returns Emissive intensity for the portal threshold slab.
 */
export function portalArenaExitSoftPulseEmissiveIntensity(
  highlighted: boolean,
  landKind: string | null | undefined,
  pulseEnvelope: number,
): number {
  const { emissiveIdle, emissiveBase, emissivePeak } =
    PORTAL_ARENA_EXIT_SOFT_PULSE;
  if (!portalArenaExitSoftPulseActive(highlighted, landKind)) return emissiveIdle;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return emissiveBase + e * (emissivePeak - emissiveBase);
}

/**
 * Soft world tip line on first portal proximity (PL42.2).
 * One-shot with ephemeral TopBar; not sticky forever.
 */
export const PORTAL_FIRST_WALKUP_WORLD_TIP = "Fare-free · E";

/**
 * Soft world tip copy for first portal walk-up (PL42.2).
 *
 * @returns Short Html secondary line (fare-free interact hint).
 */
export function portalFirstWalkUpWorldTip(): string {
  return PORTAL_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first Explore map presence (PL45.1).
 * One-shot with ephemeral TopBar; spawn rates unchanged; not sticky forever.
 */
export const EXPLORE_FIRST_WALKUP_WORLD_TIP = "Hunt + gather";

/**
 * Soft world tip copy for first Explore walk-up (PL45.1).
 *
 * @returns Short Html line (wilds hunt+gather cue).
 */
export function exploreFirstWalkUpWorldTip(): string {
  return EXPLORE_FIRST_WALKUP_WORLD_TIP;
}
