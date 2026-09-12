/**
 * City camera-near (+Z) river — screen-bottom in the isometric follow camera.
 * Fishing interact stays `fishing_dock` (scarce city station); only the hub
 * visual and bank placement change. Player-land docks stay wooden piers.
 */

/** World-space river strip along the city +Z edge (camera-near / screen bottom). */
export const CITY_RIVER = {
  centerX: 0,
  /** Water plane center Z. */
  centerZ: 31.2,
  width: 86,
  depth: 12.1,
  waterY: -0.09,
  bedY: -0.2,
  /** Dirt bank between scarce-yard grass and water. */
  bankCenterZ: 22.75,
  bankWidth: 86,
  /** Slight overlap with water so countryside grass does not flash in the seam. */
  bankDepth: 4.9,
  bankY: -0.04,
  /** World units per dirt tile — keeps bank soil from stretching into boards. */
  bankTileWorld: 1.05,
  /**
   * Players cannot walk past this world Z into the water.
   * Bank + fishing spot stay inland of this line.
   */
  walkMaxZ: 25.05,
  waterColor: "#2a6280",
  waterDeepColor: "#1a4258",
  waterEmissive: "#3a7a98",
  bankColor: "#6b5a3e",
  bedColor: "#1a3544",
  foamColor: "#d7eaf2",
  rockColor: "#5a5854",
  shimmerPeriodMs: 2200,
  foamOpacityMin: 0.16,
  foamOpacityMax: 0.42,
  /** World units/sec along +X (looping band helpers). */
  flowSpeed: 2.8,
  /** UV units/sec along the current (U). */
  flowUvPerSec: 0.22,
  /** Slow cross-ripple so the map does not read as sliding wood grain. */
  flowUvVPerSec: 0.048,
  foamUvPerSec: 0.34,
  waveAmplitude: 0.07,
  waveLength: 5.4,
  waveSegsX: 56,
  waveSegsZ: 14,
  highlightCount: 5,
  foamCount: 4,
  foamSpeed: 1.85,
} as const;

/** City scarce fishing interact on the riverbank (grid cells × WORLD.GRID). */
export const CITY_RIVER_FISHING_DOCK = {
  type: "fishing_dock" as const,
  slotIndex: 27,
  x: 8,
  z: 11,
};

/** Fisher tutor stands beside the river fishing spot. */
export const CITY_RIVER_FISHER_NPC = {
  type: "tutorial_npc" as const,
  slotIndex: 22,
  x: 6,
  z: 11,
  tutorialNpcId: "fisher" as const,
};

/**
 * City river layout SoT (hub environment + walk clamp).
 *
 * @returns Frozen river strip / bank / water colors.
 */
export function cityRiverLayout(): typeof CITY_RIVER {
  return CITY_RIVER;
}

/**
 * True when a world Z is in the unwalkable river water.
 *
 * @param worldZ - Avatar / probe Z in world units.
 * @returns True past the bank line into the water.
 */
export function isCityRiverWaterWorldZ(worldZ: number): boolean {
  return Number.isFinite(worldZ) && worldZ > CITY_RIVER.walkMaxZ;
}

/**
 * City fishing-spot world name (not the wooden land dock).
 *
 * @returns Floating label title while the city river spot is catch-ready.
 */
export function cityFishingSpotWorldName(): string {
  return "Fishing Spot";
}

/**
 * Wraps a UV scroll into [0, 1).
 *
 * @param nowMs - Clock ms.
 * @param rate - UV units per second.
 * @returns Wrapped offset, or 0 when inputs are invalid.
 */
function cityRiverWrapUvOffset(nowMs: number, rate: number): number {
  if (!Number.isFinite(nowMs) || !(rate > 0)) return 0;
  const u = (nowMs / 1000) * rate;
  return ((u % 1) + 1) % 1;
}

/**
 * Scrolling U offset for the city river albedo (loops in [0, 1)).
 *
 * @param nowMs - Clock ms.
 * @returns Wrapped UV offset, or 0 when the clock is invalid.
 */
export function cityRiverFlowUvOffset(nowMs: number): number {
  return cityRiverWrapUvOffset(nowMs, CITY_RIVER.flowUvPerSec);
}

/**
 * Cross-current V offset so ripples do not slide as parallel boards.
 *
 * @param nowMs - Clock ms.
 * @returns Wrapped V offset, or 0 when the clock is invalid.
 */
export function cityRiverFlowUvOffsetV(nowMs: number): number {
  return cityRiverWrapUvOffset(nowMs, CITY_RIVER.flowUvVPerSec);
}

/**
 * Shore foam UV scroll along the current.
 *
 * @param nowMs - Clock ms.
 * @returns Wrapped U offset, or 0 when the clock is invalid.
 */
export function cityRiverFoamUvOffset(nowMs: number): number {
  return cityRiverWrapUvOffset(nowMs, CITY_RIVER.foamUvPerSec);
}

/**
 * Dirt UV tiles for the riverbank plane (isotropic, not wood-stretched).
 *
 * @returns `[repeatU, repeatV]` matching bank width/depth.
 */
export function cityRiverBankUvRepeat(): [number, number] {
  const t = CITY_RIVER.bankTileWorld;
  const tile = Number.isFinite(t) && t > 0 ? t : 1;
  return [CITY_RIVER.bankWidth / tile, CITY_RIVER.bankDepth / tile];
}

/**
 * Tapers wave height toward the inland edge so crests do not climb the bank.
 *
 * @param localY - Plane Y (positive = inland / bank side after floor rotation).
 * @returns Scale in [0, 1].
 */
export function cityRiverWaveTaper(localY: number): number {
  if (!Number.isFinite(localY)) return 0;
  const half = CITY_RIVER.depth / 2;
  const fromBank = half - localY;
  if (fromBank <= 0) return 0;
  const band = 1.5;
  if (fromBank >= band) return 1;
  return fromBank / band;
}

/**
 * Shore foam opacity pulse.
 *
 * @param nowMs - Clock ms.
 * @returns Opacity between foam min/max, or min when the clock is invalid.
 */
export function cityRiverFoamOpacity(nowMs: number): number {
  const lo = CITY_RIVER.foamOpacityMin;
  const hi = CITY_RIVER.foamOpacityMax;
  if (!Number.isFinite(nowMs) || !(hi > lo)) return lo;
  const period = CITY_RIVER.shimmerPeriodMs;
  if (!(period > 0)) return lo;
  const w = 0.5 + 0.5 * Math.sin((nowMs / period) * Math.PI * 2);
  return lo + w * (hi - lo);
}

/**
 * Wraps a world X onto the river strip so flow bands loop.
 *
 * @param x - Unwrapped world X.
 * @returns X in ±width/2, or 0 when inputs are invalid.
 */
export function cityRiverWrapX(x: number): number {
  const w = CITY_RIVER.width;
  if (!(w > 0) || !Number.isFinite(x)) return 0;
  const half = w / 2;
  return ((((x + half) % w) + w) % w) - half;
}

/**
 * Looping X for a flow highlight or foam dash along the river.
 *
 * @param index - Band index in `[0, count)`.
 * @param count - How many evenly spaced bands.
 * @param nowMs - Clock ms.
 * @param speed - World units per second along +X.
 * @returns Wrapped world X on the river strip.
 */
export function cityRiverLoopedX(
  index: number,
  count: number,
  nowMs: number,
  speed: number,
): number {
  const { width } = CITY_RIVER;
  if (
    !(count > 0) ||
    !(width > 0) ||
    !Number.isFinite(index) ||
    !Number.isFinite(nowMs) ||
    !Number.isFinite(speed)
  ) {
    return 0;
  }
  const spacing = width / count;
  const traveled = (nowMs / 1000) * speed;
  const base = -width / 2 + (index + 0.5) * spacing;
  return cityRiverWrapX(base + traveled);
}

/**
 * Traveling wave height on the river plane (local XY before the floor rotation).
 *
 * @param localX - Plane X (along the river).
 * @param localY - Plane Y (across the river).
 * @param nowMs - Clock ms.
 * @returns Local Z displacement (world Y after the mesh rotation).
 */
export function cityRiverWaveHeight(
  localX: number,
  localY: number,
  nowMs: number,
): number {
  if (
    !Number.isFinite(localX) ||
    !Number.isFinite(localY) ||
    !Number.isFinite(nowMs)
  ) {
    return 0;
  }
  const { waveAmplitude, waveLength, flowSpeed } = CITY_RIVER;
  if (!(waveLength > 0)) return 0;
  const t = nowMs / 1000;
  const k = (Math.PI * 2) / waveLength;
  const phase = t * flowSpeed * k;
  return (
    Math.sin(localX * k - phase) * waveAmplitude +
    Math.sin(localY * 1.7 + t * 1.15) * waveAmplitude * 0.35
  );
}
