/**
 * City stone perimeter — west / east / camera-far walls.
 * Camera-near (+Z) stays the river (`CITY_RIVER.walkMaxZ`).
 */

import { isCityLandKind } from "./catalog-land.js";
import { CITY_RIVER, isCityRiverWaterWorldZ } from "./catalog-city-river.js";

/** World-space town wall around the hub (inside the walk box, outside stations). */
export const CITY_PERIMETER = {
  wallMinX: -31.5,
  wallMaxX: 31.5,
  wallMinZ: -21.5,
  /** Meets the riverbank — no wall on the water. */
  wallMaxZ: CITY_RIVER.walkMaxZ,
  wallHeight: 2.45,
  wallThickness: 0.72,
  footingHeight: 0.42,
  capHeight: 0.2,
  postSpacing: 7.8,
  postRadius: 0.38,
} as const;

export interface CityPerimeterWallRun {
  id: "west" | "east" | "south";
  x: number;
  z: number;
  rotY: number;
  length: number;
}

export interface CityPerimeterPost {
  x: number;
  z: number;
}

/**
 * Frozen city wall SoT.
 *
 * @returns Wall extents + post spacing.
 */
export function cityPerimeterLayout(): typeof CITY_PERIMETER {
  return CITY_PERIMETER;
}

/**
 * Three wall runs: west, east, camera-far (south). River owns +Z.
 *
 * @returns Centered runs in world units (length along local X after yaw).
 */
export function cityPerimeterWallRuns(): CityPerimeterWallRun[] {
  const { wallMinX, wallMaxX, wallMinZ, wallMaxZ } = CITY_PERIMETER;
  const spanZ = wallMaxZ - wallMinZ;
  const spanX = wallMaxX - wallMinX;
  const midZ = (wallMinZ + wallMaxZ) / 2;
  return [
    { id: "west", x: wallMinX, z: midZ, rotY: Math.PI / 2, length: spanZ },
    { id: "east", x: wallMaxX, z: midZ, rotY: Math.PI / 2, length: spanZ },
    { id: "south", x: 0, z: wallMinZ, rotY: 0, length: spanX },
  ];
}

/**
 * Walkable box inside the walls + riverbank.
 *
 * @returns Inclusive inner min/max in world units.
 */
export function cityPerimeterWalkInner(): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
} {
  const inset = CITY_PERIMETER.wallThickness * 0.5 + 0.4;
  return {
    minX: CITY_PERIMETER.wallMinX + inset,
    maxX: CITY_PERIMETER.wallMaxX - inset,
    minZ: CITY_PERIMETER.wallMinZ + inset,
    maxZ: CITY_PERIMETER.wallMaxZ,
  };
}

/**
 * Keeps the avatar inside the city walls and off the river.
 *
 * @param x - Proposed world X.
 * @param z - Proposed world Z.
 * @param landKind - Active map (no-op unless city).
 * @returns Clamped position, or unchanged off-city.
 */
export function clampWalkInsideCityPerimeter(
  x: number,
  z: number,
  landKind: string | null | undefined,
): { x: number; z: number } {
  if (!isCityLandKind(String(landKind ?? ""))) return { x, z };
  const b = cityPerimeterWalkInner();
  return {
    x: Math.max(b.minX, Math.min(b.maxX, x)),
    z: Math.max(b.minZ, Math.min(b.maxZ, z)),
  };
}

/**
 * Stone posts at corners and along each wall run.
 *
 * @returns World XZ posts (corners included once).
 */
export function cityPerimeterPosts(): CityPerimeterPost[] {
  const { wallMinX, wallMaxX, wallMinZ, wallMaxZ, postSpacing } =
    CITY_PERIMETER;
  const runs: Array<readonly [number, number, number, number]> = [
    [wallMinX, wallMinZ, wallMinX, wallMaxZ],
    [wallMaxX, wallMinZ, wallMaxX, wallMaxZ],
    [wallMinX, wallMinZ, wallMaxX, wallMinZ],
  ];
  const seen = new Set<string>();
  const out: CityPerimeterPost[] = [];
  for (const [x1, z1, x2, z2] of runs) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const n = Math.max(1, Math.round(len / postSpacing));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = x1 + (x2 - x1) * t;
      const z = z1 + (z2 - z1) * t;
      const key = `${x.toFixed(2)},${z.toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ x, z });
    }
  }
  return out;
}

/**
 * True when a world point is outside the walkable city hub (wall or river).
 *
 * @param worldX - World X.
 * @param worldZ - World Z.
 * @returns True past the inner walk box.
 */
export function isOutsideCityPerimeter(worldX: number, worldZ: number): boolean {
  if (!Number.isFinite(worldX) || !Number.isFinite(worldZ)) return true;
  const b = cityPerimeterWalkInner();
  return (
    worldX < b.minX ||
    worldX > b.maxX ||
    worldZ < b.minZ ||
    worldZ > b.maxZ
  );
}

/** Scenic countryside beyond the three stone walls (not walkable). */
export const CITY_PERIMETER_OUTSIDE = {
  grassY: -0.165,
  grassWidth: 96,
  grassDepth: 88,
  grassCenterZ: -2,
  grassColor: "#4a6e38",
  grassRepeat: 14,
  dirtKind: "dirt" as const,
  dirtColor: "#6e5a40",
  dirtY: -0.155,
  grassKind: "grass" as const,
  stoneY: -0.14,
  /** Pull inner stone slightly inside the wall so it does not leak outside. */
  stoneTuck: 0.22,
} as const;

export interface CityPerimeterOutsideDecor {
  x: number;
  z: number;
  scale: number;
}

export interface CityPerimeterOutsideDirtPatch {
  x: number;
  z: number;
  radius: number;
}

export interface CityPerimeterInnerStoneFloor {
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
}

export interface CityPerimeterOutsideGround {
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  grassKind: "grass";
  grassColor: string;
  grassRepeat: number;
  dirtKind: "dirt";
  dirtColor: string;
  dirtY: number;
  dirtPatches: CityPerimeterOutsideDirtPatch[];
}

/**
 * True when a world point sits past the outer face of a stone wall.
 * The river (+Z) has no wall, so it is never "beyond the wall".
 *
 * @param worldX - World X.
 * @param worldZ - World Z.
 * @returns True west / east / camera-far of the wall, else false.
 */
export function isBeyondCityWallOuter(worldX: number, worldZ: number): boolean {
  if (!Number.isFinite(worldX) || !Number.isFinite(worldZ)) return false;
  const half = CITY_PERIMETER.wallThickness * 0.5;
  return (
    worldX < CITY_PERIMETER.wallMinX - half ||
    worldX > CITY_PERIMETER.wallMaxX + half ||
    worldZ < CITY_PERIMETER.wallMinZ - half
  );
}

/**
 * Hub stone streets that stay inside the wall box.
 *
 * @returns Centered plane in world units, tucked under the wall.
 */
export function cityPerimeterInnerStoneFloor(): CityPerimeterInnerStoneFloor {
  const { wallMinX, wallMaxX, wallMinZ, wallMaxZ } = CITY_PERIMETER;
  const tuck = CITY_PERIMETER_OUTSIDE.stoneTuck;
  return {
    x: 0,
    y: CITY_PERIMETER_OUTSIDE.stoneY,
    z: (wallMinZ + wallMaxZ) / 2,
    width: wallMaxX - wallMinX - tuck,
    depth: wallMaxZ - wallMinZ - tuck,
  };
}

/**
 * Dirt pads on the countryside verge (outside the wall, off the river).
 *
 * @returns World-space dirt circles.
 */
export function cityPerimeterOutsideDirtPatches(): CityPerimeterOutsideDirtPatch[] {
  return [
    { x: -34.2, z: -8.5, radius: 2.4 },
    { x: -35.8, z: 6.2, radius: 1.9 },
    { x: -33.6, z: 16.4, radius: 2.1 },
    { x: 34.5, z: -10.2, radius: 2.2 },
    { x: 36.1, z: 4.8, radius: 1.8 },
    { x: 34.2, z: 17.5, radius: 2.3 },
    { x: -12.4, z: -24.6, radius: 2.6 },
    { x: 8.5, z: -25.8, radius: 2.2 },
    { x: 22.0, z: -23.9, radius: 1.9 },
    { x: -22.8, z: -26.4, radius: 2.0 },
    { x: 0.6, z: -28.2, radius: 2.8 },
    { x: -38.5, z: -18.0, radius: 2.1 },
    { x: 39.2, z: -16.5, radius: 1.85 },
  ];
}

/**
 * Grass + dirt countryside under and beyond the stone walls.
 *
 * @returns Outer ground recipe (larger than the inner stone streets).
 */
export function cityPerimeterOutsideGround(): CityPerimeterOutsideGround {
  const o = CITY_PERIMETER_OUTSIDE;
  return {
    x: 0,
    y: o.grassY,
    z: o.grassCenterZ,
    width: o.grassWidth,
    depth: o.grassDepth,
    grassKind: o.grassKind,
    grassColor: o.grassColor,
    grassRepeat: o.grassRepeat,
    dirtKind: o.dirtKind,
    dirtColor: o.dirtColor,
    dirtY: o.dirtY,
    dirtPatches: cityPerimeterOutsideDirtPatches(),
  };
}

/**
 * Deterministic 0..1 hash for countryside jitter.
 *
 * @param n - Seed sample.
 * @returns Fractional value in [0, 1).
 */
function cityPerimeterUnitHash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface CityPerimeterBeltDecorOpts {
  alongStep: number;
  outStart: number;
  outEnd: number;
  outStep: number;
  skipBelow: number;
  scaleMin: number;
  scaleMax: number;
  seed: number;
}

/**
 * Plants one decor if it sits past the wall and off the river.
 *
 * @param out - Accumulator.
 * @param x - World X.
 * @param z - World Z.
 * @param scale - Uniform scale.
 */
function pushCityPerimeterOutsideDecor(
  out: CityPerimeterOutsideDecor[],
  x: number,
  z: number,
  scale: number,
): void {
  if (!(scale > 0)) return;
  if (!isBeyondCityWallOuter(x, z)) return;
  if (isCityRiverWaterWorldZ(z)) return;
  out.push({ x, z, scale });
}

/**
 * Jittered tree/bush belt on west, east, and camera-far walls.
 *
 * @param opts - Spacing and scale recipe.
 * @returns Decor placements (scenic only — no walk collision).
 */
function cityPerimeterOutsideBeltDecor(
  opts: CityPerimeterBeltDecorOpts,
): CityPerimeterOutsideDecor[] {
  const { wallMinX, wallMaxX, wallMinZ, wallMaxZ } = CITY_PERIMETER;
  const out: CityPerimeterOutsideDecor[] = [];
  let i = 0;

  const plant = (
    along: number,
    outDist: number,
    jitterAlong: number,
    jitterOut: number,
    toXZ: (along: number, outDist: number) => { x: number; z: number },
  ): void => {
    const n = opts.seed + i;
    i += 1;
    if (cityPerimeterUnitHash(n) < opts.skipBelow) return;
    const a =
      along + (cityPerimeterUnitHash(n + 0.3) - 0.5) * jitterAlong;
    const o =
      outDist + (cityPerimeterUnitHash(n + 0.7) - 0.5) * jitterOut;
    const { x, z } = toXZ(a, o);
    const scale =
      opts.scaleMin +
      cityPerimeterUnitHash(n + 1.1) * (opts.scaleMax - opts.scaleMin);
    pushCityPerimeterOutsideDecor(out, x, z, Number(scale.toFixed(3)));
  };

  for (
    let along = wallMinZ + 1;
    along <= wallMaxZ - 1.2;
    along += opts.alongStep
  ) {
    for (
      let od = opts.outStart;
      od <= opts.outEnd;
      od += opts.outStep
    ) {
      plant(along, od, 1.4, 0.9, (a, o) => ({ x: wallMinX - o, z: a }));
      plant(along, od, 1.4, 0.9, (a, o) => ({ x: wallMaxX + o, z: a }));
    }
  }

  for (
    let along = wallMinX - opts.outEnd;
    along <= wallMaxX + opts.outEnd;
    along += opts.alongStep
  ) {
    for (
      let od = opts.outStart;
      od <= opts.outEnd;
      od += opts.outStep
    ) {
      plant(along, od, 1.5, 0.95, (a, o) => ({ x: a, z: wallMinZ - o }));
    }
  }

  return out;
}

/**
 * Large trees beyond the stone walls (west / east / camera-far).
 *
 * @returns Scenic placements; players cannot walk here.
 */
export function cityPerimeterOutsideTrees(): CityPerimeterOutsideDecor[] {
  return cityPerimeterOutsideBeltDecor({
    alongStep: 5.15,
    outStart: 2.55,
    outEnd: 11.2,
    outStep: 4.35,
    skipBelow: 0.16,
    scaleMin: 1.55,
    scaleMax: 2.55,
    seed: 17,
  });
}

/**
 * Bush clusters filling the countryside verge around the walls.
 *
 * @returns Scenic placements; walk-through if ever reachable.
 */
export function cityPerimeterOutsideBushes(): CityPerimeterOutsideDecor[] {
  return cityPerimeterOutsideBeltDecor({
    alongStep: 3.35,
    outStart: 1.85,
    outEnd: 10.4,
    outStep: 2.85,
    skipBelow: 0.12,
    scaleMin: 0.82,
    scaleMax: 1.35,
    seed: 91,
  });
}
