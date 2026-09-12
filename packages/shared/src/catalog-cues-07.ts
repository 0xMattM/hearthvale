/**
 * Visual cue configs part 7/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance
} from "./catalog-buildings.js";

/**
 * Soft world tip on first workshop proximity (PL74.2).
 * One-shot with ephemeral TopBar; craft recipes unchanged.
 */
export const WORKSHOP_FIRST_WALKUP_WORLD_TIP = "Saw · E";

/**
 * Soft world tip copy for first workshop walk-up (PL74.2).
 *
 * @returns Short Html secondary line (saw interact hint).
 */
export function workshopFirstWalkUpWorldTip(): string {
  return WORKSHOP_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first forge proximity (PL74.3).
 * One-shot with ephemeral TopBar; craft recipes unchanged.
 */
export const FORGE_FIRST_WALKUP_WORLD_TIP = "Smelt · E";

/**
 * Soft world tip copy for first forge walk-up (PL74.3).
 *
 * @returns Short Html secondary line (smelt interact hint).
 */
export function forgeFirstWalkUpWorldTip(): string {
  return FORGE_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first loom proximity (PL77.1).
 * One-shot with ephemeral TopBar; craft recipes unchanged.
 */
export const LOOM_FIRST_WALKUP_WORLD_TIP = "Weave · E";

/**
 * Soft world tip copy for first loom walk-up (PL77.1).
 *
 * @returns Short Html secondary line (weave interact hint).
 */
export function loomFirstWalkUpWorldTip(): string {
  return LOOM_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first alchemy bench proximity (PL77.2).
 * One-shot with ephemeral TopBar; craft recipes unchanged.
 */
export const ALCHEMY_BENCH_FIRST_WALKUP_WORLD_TIP = "Brew · E";

/**
 * Soft world tip copy for first alchemy bench walk-up (PL77.2).
 *
 * @returns Short Html secondary line (brew interact hint).
 */
export function alchemyBenchFirstWalkUpWorldTip(): string {
  return ALCHEMY_BENCH_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first claim-node proximity (PL80.1).
 * One-shot with ephemeral TopBar; claim / war rules unchanged.
 */
export const CLAIM_NODE_FIRST_WALKUP_WORLD_TIP = "Claim · E";

/**
 * Soft world tip copy for first claim-node walk-up (PL80.1).
 *
 * @returns Short Html secondary line (claim interact hint).
 */
export function claimNodeFirstWalkUpWorldTip(): string {
  return CLAIM_NODE_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Quiet ownership tint on claim_node while held by your guild (PL145.1).
 * Complements first walk-up tip (PL80.1) + soft-war cues (PL31.2); no wars invent.
 * Claim rules / produce / storage unchanged; mute ok; rival + unclaimed stay quiet.
 */
export const CLAIM_NODE_HELD_SOFT_CUE = {
  /** Soft ownership green — kinship with yours banner. */
  emissive: "#6a9e5a",
  intensityBase: 0.1,
  intensityPeak: 0.28,
  pulsePeriodMs: 2800,
  /** Existing banner ownership colors (ClaimNodeBuilding SoT). */
  bannerYours: "#6a9e5a",
  bannerHeldOther: "#9e5a5a",
  bannerUnclaimed: "#c4a35a",
  /** Tip gold while first walk-up tip owns the banner (PL80.1). */
  tipEmissive: "#c4a35a",
  tipIntensity: 0.35,
} as const;

/**
 * True when the claim beacon should soft-pulse ownership (PL145.1).
 * Only while `claim.isYours`; rival / unclaimed stay dark.
 *
 * @param isYours - From `ClaimNodeDto.isYours`.
 * @returns True when the held soft cue should run.
 */
export function claimNodeHeldSoftCueActive(isYours: boolean): boolean {
  return isYours === true;
}

/**
 * Soft sine envelope for claim-node held ownership cue (PL145.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()` / scene now).
 * @returns Envelope in [0, 1].
 */
export function claimNodeHeldSoftCueEnvelope(nowMs: number): number {
  const period = CLAIM_NODE_HELD_SOFT_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Banner/footing emissive color while yours (PL145.1).
 * Walk-up tip gold takes precedence when the tip is showing.
 *
 * @param isYours - From `ClaimNodeDto.isYours`.
 * @param showWalkUpTip - True while PL80.1 tip Html is up.
 * @returns Emissive hex for banner / footing.
 */
export function claimNodeHeldSoftCueEmissive(
  isYours: boolean,
  showWalkUpTip = false,
): string {
  if (showWalkUpTip) return CLAIM_NODE_HELD_SOFT_CUE.tipEmissive;
  if (!claimNodeHeldSoftCueActive(isYours)) return "#000000";
  return CLAIM_NODE_HELD_SOFT_CUE.emissive;
}

/**
 * Banner/footing emissive intensity while yours (PL145.1).
 * Tip intensity wins while walk-up tip shows; rival / unclaimed stay 0.
 *
 * @param isYours - From `ClaimNodeDto.isYours`.
 * @param pulseEnvelope - 0..1 from `claimNodeHeldSoftCueEnvelope`.
 * @param showWalkUpTip - True while PL80.1 tip Html is up.
 * @returns Emissive intensity for banner / footing meshes.
 */
export function claimNodeHeldSoftCueEmissiveIntensity(
  isYours: boolean,
  pulseEnvelope: number,
  showWalkUpTip = false,
): number {
  if (showWalkUpTip) return CLAIM_NODE_HELD_SOFT_CUE.tipIntensity;
  if (!claimNodeHeldSoftCueActive(isYours)) return 0;
  const { intensityBase, intensityPeak } = CLAIM_NODE_HELD_SOFT_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Resolves static banner color from claim ownership (PL145.1 SoT helper).
 * Unchanged vs prior ClaimNodeBuilding ternary — kept shared for tests.
 *
 * @param held - True when any guild name is set.
 * @param isYours - True when the holding guild is yours.
 * @returns Banner hex.
 */
export function claimNodeOwnershipBannerColor(
  held: boolean,
  isYours: boolean,
): string {
  const c = CLAIM_NODE_HELD_SOFT_CUE;
  if (isYours) return c.bannerYours;
  if (held) return c.bannerHeldOther;
  return c.bannerUnclaimed;
}

/**
 * Quiet contest tint/pulse on claim_node while a soft war is open (PL146.1).
 * Complements held ownership (PL145.1) + Soft war ephemeral (PL31.2); no wars invent.
 * Soft-war rules / window / deliver scoring unchanged; mute ok.
 */
export const CLAIM_NODE_CONTEST_SOFT_CUE = {
  /** Warm ember contest tint — distinct from ownership green + tip gold. */
  emissive: "#c4784a",
  intensityBase: 0.14,
  intensityPeak: 0.4,
  /** Slightly quicker than held ownership so contest reads active. */
  pulsePeriodMs: 1900,
} as const;

/**
 * True when the claim beacon should soft-pulse contest atmosphere (PL146.1).
 * Active only while `contestEndsAt` is in the future.
 *
 * @param contestEndsAt - From `ClaimNodeDto.contestEndsAt` (ms wall clock).
 * @param nowMs - Current clock ms (e.g. `Date.now()`).
 * @returns True when the contest soft cue should run.
 */
export function claimNodeContestSoftCueActive(
  contestEndsAt: number | null | undefined,
  nowMs: number,
): boolean {
  if (contestEndsAt == null || !Number.isFinite(contestEndsAt)) return false;
  if (!Number.isFinite(nowMs)) return false;
  return contestEndsAt > nowMs;
}

/**
 * Soft sine envelope for claim-node contest cue (PL146.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()` / scene now).
 * @returns Envelope in [0, 1].
 */
export function claimNodeContestSoftCueEnvelope(nowMs: number): number {
  const period = CLAIM_NODE_CONTEST_SOFT_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Banner/footing emissive color while soft war is open (PL146.1).
 * Walk-up tip gold takes precedence when the tip is showing.
 *
 * @param contestActive - From `claimNodeContestSoftCueActive`.
 * @param showWalkUpTip - True while PL80.1 tip Html is up.
 * @returns Emissive hex for banner / footing.
 */
export function claimNodeContestSoftCueEmissive(
  contestActive: boolean,
  showWalkUpTip = false,
): string {
  if (showWalkUpTip) return CLAIM_NODE_HELD_SOFT_CUE.tipEmissive;
  if (!contestActive) return "#000000";
  return CLAIM_NODE_CONTEST_SOFT_CUE.emissive;
}

/**
 * Banner/footing emissive intensity while soft war is open (PL146.1).
 * Tip intensity wins while walk-up tip shows; idle contest stays 0.
 *
 * @param contestActive - From `claimNodeContestSoftCueActive`.
 * @param pulseEnvelope - 0..1 from `claimNodeContestSoftCueEnvelope`.
 * @param showWalkUpTip - True while PL80.1 tip Html is up.
 * @returns Emissive intensity for banner / footing meshes.
 */
export function claimNodeContestSoftCueEmissiveIntensity(
  contestActive: boolean,
  pulseEnvelope: number,
  showWalkUpTip = false,
): number {
  if (showWalkUpTip) return CLAIM_NODE_HELD_SOFT_CUE.tipIntensity;
  if (!contestActive) return 0;
  const { intensityBase, intensityPeak } = CLAIM_NODE_CONTEST_SOFT_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft claim-empty landmark cue leftover (PL163.2).
 * Quiet cool grove mist haze/emissive on existing claim_node while unheld /
 * no contest — complements tip PL80.1 + held PL145.1 + contest PL146.1.
 * Claim / war rules unchanged; mute ok; held / contest stay primary cues.
 */
export const CLAIM_EMPTY_LANDMARK_CUE = {
  /** Cool grove mist — ≠ held green / contest ember / tip gold. */
  emissive: "#5a8a78",
  intensityBase: 0.055,
  intensityPeak: 0.16,
  hazeColor: "#2e4840",
  hazeOpacityBase: 0.04,
  hazeOpacityPeak: 0.11,
  hazeRadius: 0.72,
  pulsePeriodMs: 3100,
} as const;

export interface ClaimEmptyLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft claim-empty landmark fields (PL163.2).
 * Always-on while unheld and no soft war — not interact-gated.
 *
 * @param held - True when any guild name is set on the claim.
 * @param contestActive - From `claimNodeContestSoftCueActive`.
 * @returns Cool grove mist haze fields; `show` false when held or contested.
 */
export function claimEmptyLandmarkCue(
  held: boolean,
  contestActive: boolean,
): ClaimEmptyLandmarkCueVisual {
  const c = CLAIM_EMPTY_LANDMARK_CUE;
  if (held || contestActive) {
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
 * Soft sine envelope for claim-empty landmark pulse (PL163.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function claimEmptyLandmarkPulseEnvelope(nowMs: number): number {
  const period = CLAIM_EMPTY_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Footing / haze emissive intensity for the claim-empty landmark (PL163.2).
 *
 * @param pulseEnvelope - 0..1 from `claimEmptyLandmarkPulseEnvelope`.
 * @returns Emissive intensity for footing / haze.
 */
export function claimEmptyLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CLAIM_EMPTY_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under an unheld claim node (PL163.2).
 *
 * @param pulseEnvelope - 0..1 from `claimEmptyLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function claimEmptyLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = CLAIM_EMPTY_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between claim-empty landmark and held ownership green (PL163.2).
 *
 * @returns Soft distinct mist so empty cue ≠ yours ownership alone.
 */
export function claimEmptyLandmarkVsHeldContrast(): number {
  return cssHexRgbDistance(
    CLAIM_EMPTY_LANDMARK_CUE.emissive,
    CLAIM_NODE_HELD_SOFT_CUE.emissive,
  );
}

/**
 * RGB distance between claim-empty landmark and contest ember (PL163.2).
 *
 * @returns Soft distinct mist so empty cue ≠ soft-war pulse alone.
 */
export function claimEmptyLandmarkVsContestContrast(): number {
  return cssHexRgbDistance(
    CLAIM_EMPTY_LANDMARK_CUE.emissive,
    CLAIM_NODE_CONTEST_SOFT_CUE.emissive,
  );
}

/**
 * RGB distance between claim-empty landmark and tip gold (PL163.2).
 *
 * @returns Soft distinct mist so empty cue ≠ first walk-up tip alone.
 */
export function claimEmptyLandmarkVsTipContrast(): number {
  return cssHexRgbDistance(
    CLAIM_EMPTY_LANDMARK_CUE.emissive,
    CLAIM_NODE_HELD_SOFT_CUE.tipEmissive,
  );
}

/**
 * Soft soft-war contest atmosphere leftover (PL183.2).
 * Quiet ember mist tint/haze while a soft-war contest is open — complements
 * contest pulse PL146.1 + deliver rim; scoring / window unchanged; mute ok.
 * Continuous contest leftover under the claim beacon (not tip-gated).
 */
export const SOFT_WAR_CONTEST_ATMOSPHERE_CUE = {
  /** Quiet ember ash mist — ≠ contest beacon #c4784a / empty grove / tip gold / deliver rim. */
  emissive: "#8a5438",
  intensityBase: 0.04,
  intensityPeak: 0.12,
  hazeColor: "#2a1810",
  hazeOpacityBase: 0.045,
  hazeOpacityPeak: 0.12,
  /** Slightly wider than empty grove disc so contest reads as zone mist. */
  hazeRadius: 0.95,
  hazeY: 0.025,
  /** Slower than contest beacon pulse so continuous mist stays glanceable. */
  pulsePeriodMs: 3600,
} as const;

export interface SoftWarContestAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}
