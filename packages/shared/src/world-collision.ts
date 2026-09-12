/**
 * Client walk collision against building footprints (world units).
 * Radii stay under INTERACT_RANGE so E still reaches stations after contact.
 */

import { CITY_RIVER } from "./catalog-city-river.js";
import { cityCivicHouseWalkObstacles } from "./city-civic-houses.js";
import { exploreWildsTreeObstacles } from "./explore-wilds-mix.js";
import type { BuildingType, LandKind } from "./catalog-land.js";
import { normalizeLandKind } from "./catalog-land.js";
import { PLAYER_LAND_GATE, homesteadYardHalf, homesteadYardLayout, WORLD } from "./world.js";

/** Local avatar collision radius (world units). */
export const PLAYER_COLLISION_RADIUS = 0.32;

/**
 * Solid core radius per building type (world units, around grid×GRID center).
 * Tuned so `PLAYER_COLLISION_RADIUS + radius < WORLD.INTERACT_RANGE`.
 */
export const BUILDING_COLLISION_RADIUS: Record<BuildingType, number> = {
  crop_plot: 0.58,
  mill: 0.7,
  forge: 0.68,
  vendor_stall: 0.7,
  ore_node: 0.58,
  kitchen: 0.7,
  /** Wildlife dens are not solids — walk the grass. */
  game_trail: 0,
  edge_thicket: 0,
  tree_stump: 0.58,
  workshop: 0.68,
  portal: 0.55,
  decor_pad: 0.48,
  decor_planter: 0.5,
  decor_banner: 0.42,
  claim_node: 0.52,
  tutorial_npc: 0.45,
  market_board: 0.7,
  realm_market: 0.7,
  build_board: 0.55,
  arena_board: 0.55,
  arena_dummy: 0.5,
  notice_board: 0.55,
  loom: 0.65,
  fishing_dock: 0.7,
  animal_pen: 0.72,
  alchemy_bench: 0.65,
};

export interface WalkObstacle {
  worldX: number;
  worldZ: number;
  radius: number;
}

/**
 * Builds a walk obstacle from a catalog building cell, or null when unknown type.
 *
 * @param type - Building type id.
 * @param gridX - Catalog grid X.
 * @param gridZ - Catalog grid Z.
 * @returns Obstacle in world space, or null.
 */
export function buildingWalkObstacle(
  type: string,
  gridX: number,
  gridZ: number,
): WalkObstacle | null {
  const radius = BUILDING_COLLISION_RADIUS[type as BuildingType];
  if (!(radius > 0)) return null;
  return {
    worldX: gridX * WORLD.GRID,
    worldZ: gridZ * WORLD.GRID,
    radius,
  };
}

/**
 * Maps building rows to walk obstacles (skips unknown types).
 *
 * @param buildings - Rows with type + grid x/z.
 * @returns Obstacle list for resolveWalkAgainstObstacles.
 */
export function walkObstaclesFromBuildings(
  buildings: ReadonlyArray<{ type: string; x: number; z: number }>,
): WalkObstacle[] {
  const out: WalkObstacle[] = [];
  for (const b of buildings) {
    // Reason: retired walk-up marker — leftover rows must not block the yard.
    if (b.type === "build_board") continue;
    const o = buildingWalkObstacle(b.type, b.x, b.z);
    if (o) out.push(o);
  }
  return out;
}

/**
 * Pushes a world position out of overlapping circular obstacles (slide-friendly).
 *
 * @param x - Proposed world X.
 * @param z - Proposed world Z.
 * @param obstacles - Solid footprints.
 * @param playerRadius - Avatar radius (defaults to PLAYER_COLLISION_RADIUS).
 * @param iterations - Multi-body resolve passes.
 * @returns Position cleared of overlaps (best-effort).
 */
export function resolveWalkAgainstObstacles(
  x: number,
  z: number,
  obstacles: ReadonlyArray<WalkObstacle>,
  playerRadius = PLAYER_COLLISION_RADIUS,
  iterations = 5,
): { x: number; z: number } {
  let px = x;
  let pz = z;
  if (!(playerRadius > 0) || obstacles.length === 0) return { x: px, z: pz };

  for (let pass = 0; pass < iterations; pass++) {
    for (const o of obstacles) {
      if (!(o.radius > 0)) continue;
      const dx = px - o.worldX;
      const dz = pz - o.worldZ;
      const dist = Math.hypot(dx, dz);
      const min = playerRadius + o.radius;
      if (dist >= min) continue;
      if (dist < 1e-6) {
        // Reason: spawned inside solid — nudge east so the next pass can separate.
        px = o.worldX + min;
        pz = o.worldZ;
        continue;
      }
      const push = (min - dist) / dist;
      px += dx * push;
      pz += dz * push;
    }
  }
  return { x: px, z: pz };
}

/** City plaza fountain solid (matches CityEnvironment landmark at origin). */
const CITY_FOUNTAIN_OBSTACLE: WalkObstacle = {
  worldX: 0,
  worldZ: 0,
  radius: 0.75,
};

/** Main decorative City Hall (matches CITY_ATMOSPHERE_MAIN_HALL + kit wings). */
const CITY_MAIN_HALL_OBSTACLE: WalkObstacle = {
  worldX: 0,
  worldZ: -13.4,
  radius: 4.0,
};

/** City atmosphere trees (matches CITY_ATMOSPHERE_TREE_PLACEMENTS). */
const CITY_DECOR_TREE_OBSTACLES: readonly WalkObstacle[] = [
  { worldX: -7.5, worldZ: -6.5, radius: 0.8 },
  { worldX: 9.5, worldZ: -8.5, radius: 0.78 },
  { worldX: -10.0, worldZ: 8.5, radius: 0.82 },
  { worldX: 10.0, worldZ: 8.5, radius: 0.75 },
  { worldX: -13.5, worldZ: -15.5, radius: 0.85 },
  { worldX: 15.5, worldZ: -11.5, radius: 0.8 },
  { worldX: -19.5, worldZ: 3.5, radius: 0.75 },
  { worldX: 19.5, worldZ: 5.0, radius: 0.9 },
  { worldX: -17.0, worldZ: 17.5, radius: 0.7 },
  { worldX: 22.0, worldZ: 13.5, radius: 0.85 },
  { worldX: -6.5, worldZ: 19.5, radius: 0.65 },
  { worldX: 4.5, worldZ: 23.0, radius: 0.75 },
  { worldX: 22.0, worldZ: -3.5, radius: 0.88 },
  { worldX: -24.0, worldZ: 14.5, radius: 0.8 },
  { worldX: 24.0, worldZ: 13.0, radius: 0.7 },
  { worldX: -3.5, worldZ: 21.5, radius: 0.82 },
  { worldX: 16.5, worldZ: 17.0, radius: 0.72 },
  { worldX: -12.0, worldZ: 22.0, radius: 0.8 },
];

/** City fence segment centers — perimeter wall uses AABB clamp, not these. */
const CITY_DECOR_FENCE_OBSTACLES: readonly WalkObstacle[] = [];

/** Lanterns / benches / plaza masonry (flowerpots walk-through). */
const CITY_DECOR_EXTRA_OBSTACLES: readonly WalkObstacle[] = [
  { worldX: -8.4, worldZ: -7.8, radius: 0.28 },
  { worldX: 8.4, worldZ: -7.8, radius: 0.28 },
  { worldX: -8.4, worldZ: 7.6, radius: 0.28 },
  { worldX: 8.4, worldZ: 7.6, radius: 0.28 },
  { worldX: -8.5, worldZ: -4.5, radius: 0.55 },
  { worldX: 8.5, worldZ: -4.5, radius: 0.55 },
  { worldX: -2.8, worldZ: -7.5, radius: 0.3 },
  { worldX: 2.8, worldZ: 8.5, radius: 0.3 },
  { worldX: -5.4, worldZ: -5.4, radius: 0.4 },
  { worldX: 5.4, worldZ: -5.4, radius: 0.4 },
  { worldX: -5.4, worldZ: 5.4, radius: 0.4 },
  { worldX: 5.4, worldZ: 5.4, radius: 0.4 },
  { worldX: -1.7, worldZ: -8.4, radius: 0.42 },
  { worldX: 1.7, worldZ: -8.4, radius: 0.42 },
  { worldX: -5.4, worldZ: -6.2, radius: 0.65 },
  { worldX: 5.4, worldZ: -6.2, radius: 0.65 },
  { worldX: -5.4, worldZ: 6.2, radius: 0.65 },
  { worldX: 5.4, worldZ: 6.2, radius: 0.65 },
  { worldX: -6.2, worldZ: -5.4, radius: 0.65 },
  { worldX: 6.2, worldZ: -5.4, radius: 0.65 },
  { worldX: -6.2, worldZ: 5.4, radius: 0.65 },
  { worldX: 6.2, worldZ: 5.4, radius: 0.65 },
  { worldX: -3.8, worldZ: 3.6, radius: 0.3 },
  { worldX: 3.8, worldZ: -3.6, radius: 0.28 },
];

/** Homestead corner trees (matches HomesteadEnvironment placements). */
function homesteadTreeWalkObstacles(nftSize?: string | null): WalkObstacle[] {
  const { half, gateZ } = homesteadYardLayout(homesteadYardHalf(nftSize));
  return [
    { worldX: -half, worldZ: -(gateZ - 1.2), radius: 0.7 },
    { worldX: half, worldZ: -(gateZ - 1.2), radius: 0.7 },
    { worldX: -half, worldZ: gateZ - 1.2, radius: 0.7 },
    { worldX: half - 0.2, worldZ: gateZ - 1.5, radius: 0.7 },
  ];
}

/** Homestead fence posts — corner + mid-rail solids (world units). */
function homesteadFenceWalkObstacles(nftSize?: string | null): WalkObstacle[] {
  const { fence, gateZ, farFenceZ } = homesteadYardLayout(
    homesteadYardHalf(nftSize),
  );
  return [
    { worldX: -fence, worldZ: farFenceZ, radius: 0.28 },
    { worldX: fence, worldZ: farFenceZ, radius: 0.28 },
    { worldX: -fence, worldZ: gateZ, radius: 0.28 },
    { worldX: fence, worldZ: gateZ, radius: 0.28 },
    { worldX: -fence, worldZ: 0, radius: 0.22 },
    { worldX: fence, worldZ: 0, radius: 0.22 },
    { worldX: 0, worldZ: farFenceZ, radius: 0.22 },
  ];
}

/**
 * Gate-post solids for the player-land yard exit.
 * Center of the +Z fence is a walkable opening (Travel interact).
 *
 * Args:
 *   nftSize: NFT plot size when on Creditcoin land; omit for the free yard.
 *
 * Returns:
 *   Left and right post obstacles in world units.
 */
export function playerLandGateWalkObstacles(
  nftSize?: string | null,
): WalkObstacle[] {
  const { postOffsetX, postRadius } = PLAYER_LAND_GATE;
  const gateZ = homesteadYardLayout(homesteadYardHalf(nftSize)).gateZ;
  return [
    { worldX: -postOffsetX, worldZ: gateZ, radius: postRadius },
    { worldX: postOffsetX, worldZ: gateZ, radius: postRadius },
  ];
}

/** City scarce-yard props (matches CITY_SCARCE_YARD_PROP_PLACEMENTS world units). */
const CITY_YARD_PROP_OBSTACLES: readonly WalkObstacle[] = [
  { worldX: -3.2, worldZ: 0.4, radius: 0.48 },
  { worldX: 3.0, worldZ: 1.2, radius: 0.48 },
  { worldX: 0.2, worldZ: 14.5, radius: 0.35 },
  { worldX: -16.2, worldZ: 6.0, radius: 0.35 },
  { worldX: 16.4, worldZ: 11.0, radius: 0.48 },
  { worldX: 14.8, worldZ: 0.6, radius: 0.48 },
];

/**
 * Keeps the avatar on the city riverbank — water past `CITY_RIVER.walkMaxZ` is solid.
 *
 * @param x - Proposed world X.
 * @param z - Proposed world Z.
 * @param landKind - Active map kind (no-op unless city).
 * @returns Position with Z clamped off the water, or unchanged off-city.
 */
export function clampWalkOutOfCityRiver(
  x: number,
  z: number,
  landKind: LandKind | string | null | undefined,
): { x: number; z: number } {
  const kind = normalizeLandKind(String(landKind ?? ""));
  if (kind !== "city") return { x, z };
  if (!(z > CITY_RIVER.walkMaxZ)) return { x, z };
  return { x, z: CITY_RIVER.walkMaxZ };
}

/**
 * Env / landmark solids that are not building DTOs (fountain, shed, yard props).
 *
 * @param landKind - Active map kind (aliases normalized).
 * @returns Extra walk obstacles for that map.
 */
export function staticMapWalkObstacles(
  landKind: LandKind | string | null | undefined,
  nftSize?: string | null,
): WalkObstacle[] {
  const kind = normalizeLandKind(String(landKind ?? ""));
  if (kind === "city") {
    return [
      CITY_FOUNTAIN_OBSTACLE,
      CITY_MAIN_HALL_OBSTACLE,
      ...cityCivicHouseWalkObstacles(),
      ...CITY_YARD_PROP_OBSTACLES,
      ...CITY_DECOR_TREE_OBSTACLES,
      ...CITY_DECOR_FENCE_OBSTACLES,
      ...CITY_DECOR_EXTRA_OBSTACLES,
    ];
  }
  if (kind === "player_land") {
    return [
      ...homesteadTreeWalkObstacles(nftSize),
      ...homesteadFenceWalkObstacles(nftSize),
      ...playerLandGateWalkObstacles(nftSize),
    ];
  }
  if (kind === "explore") {
    return [...exploreWildsTreeObstacles()];
  }
  return [];
}

/**
 * Merges building footprints with per-map static solids.
 *
 * @param buildings - Catalog building rows.
 * @param landKind - Active map for env solids.
 * @returns Combined obstacle list for the local avatar.
 */
export function walkObstaclesForMap(
  buildings: ReadonlyArray<{ type: string; x: number; z: number }>,
  landKind: LandKind | string | null | undefined,
  nftSize?: string | null,
): WalkObstacle[] {
  return [
    ...walkObstaclesFromBuildings(buildings),
    ...staticMapWalkObstacles(landKind, nftSize),
  ];
}
