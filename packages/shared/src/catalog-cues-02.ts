/**
 * Visual cue configs part 2/30 (RF6.4) — split from catalog.ts.
 */

  import { lerpByEnvelope, sinePulseEnvelope } from "./visual-cue-math.js";
import {
  isPlayerLandStationType
} from "./catalog-buildings.js";
import { BUILD_PLACE_SPAWN_FLASH } from "./catalog-cues-01.js";

/**
 * Soft decay envelope for build-place spawn flash (PL134.1).
 * Peaks at place edge (1) and reaches 0 at durationMs — not a continuous loop.
 *
 * @param elapsedMs - Milliseconds since place success (0 at start).
 * @returns Envelope in [0, 1]; 0 when outside the flash window.
 */
export function buildPlaceSpawnFlashEnvelope(elapsedMs: number): number {
  const { durationMs } = BUILD_PLACE_SPAWN_FLASH;
  if (!(durationMs > 0) || !Number.isFinite(elapsedMs) || elapsedMs < 0) return 0;
  if (elapsedMs >= durationMs) return 0;
  const t = 1 - elapsedMs / durationMs;
  // Reason: ease-out so spawn reads at the place edge then softens quickly.
  return t * t;
}

/**
 * Pad opacity for build-place spawn flash (PL134.1).
 *
 * @param envelope - 0..1 from `buildPlaceSpawnFlashEnvelope`.
 * @returns Opacity.
 */
export function buildPlaceSpawnFlashOpacity(envelope: number): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * BUILD_PLACE_SPAWN_FLASH.opacityPeak;
}

/**
 * Pad emissive intensity for build-place spawn flash (PL134.1).
 *
 * @param envelope - 0..1 from `buildPlaceSpawnFlashEnvelope`.
 * @returns Emissive intensity.
 */
export function buildPlaceSpawnFlashEmissiveIntensity(
  envelope: number,
): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * BUILD_PLACE_SPAWN_FLASH.intensityPeak;
}

/**
 * True when this building should show the build-place spawn flash (PL134.1).
 * Matches by building id so multi-station yards flash the right pad.
 *
 * @param buildingId - World building id.
 * @param flashBuildingId - Id currently flashing, or null.
 * @returns True when this station should render the spawn pad.
 */
export function shouldShowBuildPlaceSpawnFlash(
  buildingId: string,
  flashBuildingId: string | null,
): boolean {
  return flashBuildingId != null && flashBuildingId === buildingId;
}

/**
 * Id of the newly placed station after a successful build (PL134.1).
 * Prefers matching `placedType` among ids absent from the prior set.
 *
 * @param prevIds - Building ids before the place call.
 * @param nextBuildings - Buildings after applyState.
 * @param placedType - Station type requested in the place call.
 * @returns New building id, or null when none found.
 */
export function newlyPlacedStationBuildingId(
  prevIds: ReadonlySet<string> | ReadonlyArray<string>,
  nextBuildings: ReadonlyArray<{ id: string; type: string }>,

  placedType: string,
): string | null {
  const prior =
    prevIds instanceof Set ? prevIds : new Set(prevIds);
  if (!isPlayerLandStationType(placedType)) return null;
  const match = nextBuildings.find(
    (b) => !prior.has(b.id) && b.type === placedType,
  );
  return match?.id ?? null;
}

/**
 * Soft scarce-city presence lock geometry lives in `world.isStationContendedByPresence`
 * (CL52.3 / PL8.1) — server + CityEnvironment + interact prompt share that SoT.
 */

/** World + pad palette when a city scarce station is soft-busy (PL8.1). */
export const CITY_SCARCE_STATION_BUSY_CUE = {
  worldLabel: "Busy",
  padColor: "#c45a4a",
  haloColor: "#e87850",
  /**
   * Cooler free pad (PL135.1) — kept on Busy cue for PL8.1 free≠busy asserts;
   * canonical Free sticky palette lives on `CITY_SCARCE_STATION_FREE_CUE`.
   */
  freePadColor: "#6a8fa0",
} as const;

/**
 * Quiet sticky Free world cue while a city scarce station is free (PL135.1).
 * Pairs with sticky Busy (PL8.1) + settle flash (PL119.1); cooler pad/halo so
 * Free stays glanceable without matching Busy warmth. Contention unchanged; mute ok.
 */
export const CITY_SCARCE_STATION_FREE_CUE = {
  worldLabel: "Free",
  padColor: "#6a8fa0",
  haloColor: "#8ab0bc",
  /** Soft free halo baseline — quieter than Busy peer pulse. */
  haloOpacity: 0.55,
  haloEmissiveIntensity: 0.28,
} as const;

/**
 * Whether a scarce station should show the sticky Free world label (PL135.1).
 * True while not contended; Busy owns the contended label; land unlimited unchanged.
 *
 * @param isBusy - Current contended state from presence SoT.
 * @returns True when the quiet Free world label should show.
 */
export function shouldShowScarceFreeStickyWorldLabel(isBusy: boolean): boolean {
  return isBusy === false;
}

/**
 * World floor chrome for city scarce stations — pad discs, yard mist, pulsing haze.
 * Off by default: users found circles + Free/Busy labels cluttered the practice yard.
 */
export const CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED = false;

/**
 * Whether scarce-station floor pads, haze discs, and yard pulsing mist render.
 *
 * @returns True when world floor chrome should show on City scarce stations.
 */
export function cityScarceStationFloorChromeVisible(): boolean {
  return CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED;
}

/**
 * Hidden landmark cue fields when floor chrome is disabled (PL135.1 / PL173.2).
 *
 * @param c - Landmark constant with emissive / haze palette.
 * @returns Cue visual with `show: false` and zero pulse intensity.
 */
export function cityScarceLandmarkCueHidden(c: {
  emissive: string;
  hazeColor: string;
  hazeRadius: number;
}) {
  return {
    show: false as const,
    emissive: c.emissive,
    intensity: 0,
    hazeColor: c.hazeColor,
    hazeOpacity: 0,
    hazeRadius: c.hazeRadius,
  };
}

/**
 * Brief pad/halo boost when a scarce city station edges free→busy (PL115.1).
 * Complements sticky Busy world cue (PL8.1); contention rules unchanged; mute ok.
 */
export const CITY_SCARCE_BUSY_PEER_PULSE = {
  durationMs: 520,
  /** Sticky busy halo baseline (matches CityEnvironment PL8.1). */
  intensityBase: 0.55,
  /** Peak emissive during free→busy edge pulse. */
  intensityPeak: 1.18,
  padOpacityBase: 0.72,
  padOpacityPeak: 0.96,
  haloOpacityBase: 0.85,
  haloOpacityPeak: 1,
} as const;

/**
 * Whether a scarce station should start a brief busy-edge pulse (PL115.1).
 * True only on free → busy; sticky busy / busy→free / idle stay quiet for pulse start.
 *
 * @param wasBusy - Prior contended state.
 * @param isBusy - Current contended state.
 * @returns True when the pad/halo should briefly pulse.
 */
export function shouldPulseScarceBusyPeerEdge(
  wasBusy: boolean,
  isBusy: boolean,
): boolean {
  return wasBusy === false && isBusy === true;
}

/**
 * Soft decay envelope for the busy-edge pulse (PL115.1).
 * Peaks at edge start (1) and reaches 0 at durationMs — not a continuous loop.
 *
 * @param elapsedMs - Milliseconds since free→busy edge (0 at start).
 * @returns Envelope in [0, 1]; 0 when outside the pulse window.
 */
export function cityScarceBusyPeerPulseEnvelope(elapsedMs: number): number {
  const { durationMs } = CITY_SCARCE_BUSY_PEER_PULSE;
  if (!(elapsedMs >= 0) || elapsedMs >= durationMs) return 0;
  const t = elapsedMs / Math.max(1, durationMs);
  // Reason: cosine ease-out reads as a brief peer flash, not a linear fade.
  return Math.cos((t * Math.PI) / 2);
}

/**
 * Halo emissive intensity for sticky busy + optional edge pulse (PL115.1).
 *
 * @param pulseEnvelope - 0..1 from `cityScarceBusyPeerPulseEnvelope` (0 = sticky only).
 * @returns Emissive intensity between intensityBase and intensityPeak.
 */
export function cityScarceBusyHaloEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = CITY_SCARCE_BUSY_PEER_PULSE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Pad opacity for sticky busy + optional edge pulse (PL115.1).
 *
 * @param pulseEnvelope - 0..1 from `cityScarceBusyPeerPulseEnvelope`.
 * @returns Pad opacity between padOpacityBase and padOpacityPeak.
 */
export function cityScarceBusyPadOpacity(pulseEnvelope: number): number {
  const { padOpacityBase, padOpacityPeak } = CITY_SCARCE_BUSY_PEER_PULSE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return padOpacityBase + e * (padOpacityPeak - padOpacityBase);
}

/**
 * Halo ring opacity for sticky busy + optional edge pulse (PL115.1).
 *
 * @param pulseEnvelope - 0..1 from `cityScarceBusyPeerPulseEnvelope`.
 * @returns Halo opacity between haloOpacityBase and haloOpacityPeak.
 */
export function cityScarceBusyHaloOpacity(pulseEnvelope: number): number {
  const { haloOpacityBase, haloOpacityPeak } = CITY_SCARCE_BUSY_PEER_PULSE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return haloOpacityBase + e * (haloOpacityPeak - haloOpacityBase);
}

/**
 * Brief pad dim/settle when a scarce city station edges busy→free (PL119.1).
 * Complements free→busy peer pulse (PL115.1) + sticky Free/Busy (PL8).
 * Contention rules unchanged; mute ok.
 */
export const CITY_SCARCE_FREE_SETTLE_FLASH = {
  durationMs: 480,
  /** Steady free pad opacity (matches CityEnvironment free baseline). */
  padOpacityBase: 0.55,
  /** Brief dim at busy→free edge so Free settle reads at a glance. */
  padOpacityDim: 0.22,
  /** Soft free pad emissive at flash peak. */
  emissive: "#d4b078",
  intensityPeak: 0.38,
} as const;

/**
 * Whether a scarce station should start a brief free-settle flash (PL119.1).
 * True only on busy → free; sticky free / free→busy / idle stay quiet for flash start.
 *
 * @param wasBusy - Prior contended state.
 * @param isBusy - Current contended state.
 * @returns True when the free pad should briefly dim/settle.
 */
export function shouldFlashScarceFreeSettleEdge(
  wasBusy: boolean,
  isBusy: boolean,
): boolean {
  return wasBusy === true && isBusy === false;
}

/**
 * Soft decay envelope for the free-settle flash (PL119.1).
 * Peaks at edge start (1) and reaches 0 at durationMs — not a continuous loop.
 *
 * @param elapsedMs - Milliseconds since busy→free edge (0 at start).
 * @returns Envelope in [0, 1]; 0 when outside the flash window.
 */
export function cityScarceFreeSettleFlashEnvelope(elapsedMs: number): number {
  const { durationMs } = CITY_SCARCE_FREE_SETTLE_FLASH;
  if (!(elapsedMs >= 0) || elapsedMs >= durationMs) return 0;
  const t = elapsedMs / Math.max(1, durationMs);
  // Reason: cosine ease-out mirrors busy peer pulse so Free settle feels paired.
  return Math.cos((t * Math.PI) / 2);
}

/**
 * Free pad opacity during optional settle flash (PL119.1).
 * Dims toward padOpacityDim at peak, then returns to free baseline.
 *
 * @param settleEnvelope - 0..1 from `cityScarceFreeSettleFlashEnvelope` (0 = steady free).
 * @returns Pad opacity between padOpacityDim and padOpacityBase.
 */
export function cityScarceFreeSettlePadOpacity(settleEnvelope: number): number {
  const { padOpacityBase, padOpacityDim } = CITY_SCARCE_FREE_SETTLE_FLASH;
  const e = Math.min(1, Math.max(0, settleEnvelope));
  return padOpacityBase - e * (padOpacityBase - padOpacityDim);
}

/**
 * Soft free-pad emissive during settle flash (PL119.1).
 * Steady free stays dark (0); flash peaks at intensityPeak.
 *
 * @param settleEnvelope - 0..1 from `cityScarceFreeSettleFlashEnvelope`.
 * @returns Emissive intensity for the free scarce pad.
 */
export function cityScarceFreeSettleEmissiveIntensity(
  settleEnvelope: number,
): number {
  const { intensityPeak } = CITY_SCARCE_FREE_SETTLE_FLASH;
  const e = Math.min(1, Math.max(0, settleEnvelope));
  return e * intensityPeak;
}

/**
 * Quiet floor ring under a remote avatar when they enter interact range (PL15.2).
 * Not a HUD list — clears when the peer walks out; zero peers stay quiet.
 */
export const NEARBY_PEER_PING = {
  ringInner: 0.55,
  ringOuter: 0.88,
  color: "#6a8e78",
  emissiveIntensity: 0.32,
  opacity: 0.72,
} as const;

/**
 * Soft halo/ring fade when a nearby peer leaves interact range (PL134.2).
 * Complements enter ping (PL15.2) + silhouette (PL40.3); no nearby-list growth.
 * Presence rules unchanged; zero peers stay quiet; mute ok.
 */
export const NEARBY_PEER_EXIT_FADE = {
  durationMs: 420,
} as const;

/**
 * Whether a peer should start a soft range-exit fade (PL134.2).
 * True only on in-range → out-of-range; enter / stay / idle stay quiet for fade start.
 *
 * @param wasInRange - Prior interact-range state.
 * @param isInRange - Current interact-range state.
 * @returns True when the ping ring should briefly fade out.
 */
export function shouldStartPeerRangeExitFade(
  wasInRange: boolean,
  isInRange: boolean,
): boolean {
  return wasInRange === true && isInRange === false;
}

/**
 * Whether a peer first entering interact range should flash soft world reinforce (PL184.2).
 * True only on out-of-range → in-range; stay / exit / idle stay quiet.
 * Complements nearby peer ping (PL15.2) + silhouette (PL40.3); presence rules unchanged.
 *
 * @param wasInRange - Prior interact-range state.
 * @param isInRange - Current interact-range state.
 * @returns True when the soft nearby-peer HUD rim should briefly flash.
 */
export function shouldFlashNearbyPeerWorldReinforce(
  wasInRange: boolean,
  isInRange: boolean,
): boolean {
  return wasInRange === false && isInRange === true;
}

/**
 * Soft decay envelope for peer range-exit fade (PL134.2).
 * Peaks at exit edge (1) and reaches 0 at durationMs — not a continuous loop.
 *
 * @param elapsedMs - Milliseconds since range exit (0 at start).
 * @returns Envelope in [0, 1]; 0 when outside the fade window.
 */
export function peerRangeExitFadeEnvelope(elapsedMs: number): number {
  const { durationMs } = NEARBY_PEER_EXIT_FADE;
  if (!(durationMs > 0) || !Number.isFinite(elapsedMs) || elapsedMs < 0) return 0;
  if (elapsedMs >= durationMs) return 0;
  const t = 1 - elapsedMs / durationMs;
  // Reason: ease-out so leave reads softly instead of a hard ring snap-off.
  return t * t;
}

/**
 * Ping ring opacity during range-exit fade (PL134.2).
 *
 * @param envelope - 0..1 from `peerRangeExitFadeEnvelope`.
 * @returns Opacity scaled from NEARBY_PEER_PING.
 */
export function peerRangeExitFadeOpacity(envelope: number): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * NEARBY_PEER_PING.opacity;
}

/**
 * Ping ring emissive during range-exit fade (PL134.2).
 *
 * @param envelope - 0..1 from `peerRangeExitFadeEnvelope`.
 * @returns Emissive intensity scaled from NEARBY_PEER_PING.
 */
export function peerRangeExitFadeEmissiveIntensity(envelope: number): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * NEARBY_PEER_PING.emissiveIntensity;
}

/**
 * Soft always-on peer silhouette halo (PL40.3) — cooler teal tint so nearby
 * players read apart from warm tutor cloaks / station pads (city/visit).
 * Presence rules unchanged; not a HUD column. Complements interact-range ping.
 */
export const PRESENCE_PEER_SILHOUETTE = {
  haloInner: 0.22,
  haloOuter: 0.48,
  color: "#5a8a9a",
  emissiveIntensity: 0.22,
  opacity: 0.48,
  /** Soft nameplate border when peer is present (not interact-near only). */
  nameBorder: "#5a8a9a",
} as const;

/**
 * Soft pad + emissive pulse when a crop plot is harvest-ready (PL12.1).
 * Empty stays quiet; growing uses soft sway (PL121.1) — not this ready pad.
 */
export const CROP_READY_WORLD_PULSE = {
  padColor: "#c8d868",
  emissiveColor: "#a0b830",
  opacity: 0.55,
  intensityMin: 0.28,
  intensityMax: 0.72,
  periodMs: 1600,
  headEmissive: "#a08020",
} as const;

/**
 * Deterministic soft emissive intensity for ripe-crop world pulse (PL12.1).
 * Call only when the plot is harvest-ready; do not render a pad otherwise.
 *
 * @param nowMs - Client/game clock milliseconds.
 * @returns Emissive intensity between intensityMin and intensityMax.
 */
export function cropReadyWorldPulseIntensity(nowMs: number): number {
  const { intensityMin, intensityMax, periodMs } = CROP_READY_WORLD_PULSE;
  return lerpByEnvelope(
    intensityMin,
    intensityMax,
    sinePulseEnvelope(nowMs, periodMs),
  );
}

/**
 * Soft stem sway + quiet pad while a crop is growing (not ready) (PL121.1).
 * Complements ready pulse (PL12.1); empty stays quiet; grow timers unchanged.
 */
export const CROP_GROWING_SOFT_SWAY = {
  padColor: "#6a8a48",
  emissiveColor: "#4a7030",
  opacity: 0.32,
  intensityMin: 0.1,
  intensityMax: 0.26,
  periodMs: 2400,
  /** Peak stem lean radians (soft breeze). */
  stemSwayRad: 0.08,
  stemEmissive: "#3a6028",
  stemEmissiveMin: 0.05,
  stemEmissiveMax: 0.16,
} as const;

/**
 * True while crop visual is sprout/growing — soft sway applies (PL121.1).
 *
 * @param cropVisualState - Visual stage from `cropVisual`.
 * @returns True for sprout/growing only (not empty/ready).
 */
export function cropGrowingSoftSwayActive(
  cropVisualState: "empty" | "sprout" | "growing" | "ready",
): boolean {
  return cropVisualState === "sprout" || cropVisualState === "growing";
}
