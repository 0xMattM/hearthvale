/** Shared world layout metrics — client + server proximity SoT. */

import {
  normalizeLandKind,
  type CanonicalLandKind,
} from "./catalog-land.js";

export const WORLD = {
  /** World units per catalog grid cell. */
  GRID: 2.2,
  /** Must be < GRID / 2 so adjacent stations do not steal each other. */
  INTERACT_RANGE: 1.05,
} as const;

/**
 * Arrival spawn in world units (PlayerAvatar). City drops you in front of
 * City Hall next to the Governor; other maps keep the plaza/yard origin.
 */
export const MAP_SPAWN: Readonly<Record<CanonicalLandKind, { x: number; z: number }>> = {
  city: { x: 0.4, z: -7.2 },
  player_land: { x: 0.5, z: 3.2 },
  explore: { x: 0.5, z: 3.2 },
  warrior: { x: 0.5, z: 3.2 },
};

/**
 * Map arrival spawn for a land kind.
 *
 * @param kind - Canonical or legacy land kind.
 * @returns World XZ; player_land default when unknown.
 */
export function mapSpawnPosition(
  kind: string | null | undefined,
): { x: number; z: number } {
  const canonical = normalizeLandKind(kind ?? "");
  if (canonical) return MAP_SPAWN[canonical];
  return MAP_SPAWN.player_land;
}

/**
 * Player-land yard exit (tranquera) on the camera-near fence (+Z).
 * World units; walk-up E opens Travel. Rails gap around the posts.
 */
export const PLAYER_LAND_GATE = {
  worldX: 0,
  worldZ: 7,
  /** Gate post X offset from center (also inner end of split rails). */
  postOffsetX: 1.55,
  postRadius: 0.22,
} as const;

/**
 * Split +Z fence rails that leave a gap for the yard gate.
 *
 * @returns Left and right rail segments (center X + width) in world units.
 */
export function playerLandFrontFenceRailSegments(
  yardHalf: number = HOMESTEAD_YARD.starterHalf,
): Array<{
  centerX: number;
  width: number;
}> {
  const outer = homesteadYardLayout(yardHalf).railOuter;
  const inner = PLAYER_LAND_GATE.postOffsetX;
  const width = outer - inner;
  return [
    { centerX: -(inner + width / 2), width },
    { centerX: inner + width / 2, width },
  ];
}

/**
 * Half-extents for local avatar walk clamp (world units).
 * City / Explore / Warrior must exceed the homestead plot (±7.2) so floors are reachable.
 */
export interface MapWalkBounds {
  halfX: number;
  halfZ: number;
}

/**
 * Per-map walk clamp — slightly inset from environment floor planes.
 * `player_land` keeps the original ±7.2 homestead yard.
 */
export const MAP_WALK_BOUNDS: Record<CanonicalLandKind, MapWalkBounds> = {
  player_land: { halfX: 7.2, halfZ: 7.2 },
  // Reason: Inner stone sits inside the walls; outer grass is scenic (perimeter clamp is tighter).
  city: { halfX: 36, halfZ: 32 },
  // Reason: Explore canopy ~96×88 after footprint spread.
  explore: { halfX: 44, halfZ: 40 },
  // Reason: Warrior grounds ~56×48.
  warrior: { halfX: 24, halfZ: 20 },
};

/** Starter homestead vs Creditcoin NFT plots (world-unit half-extents). */
export const HOMESTEAD_YARD = {
  starterHalf: 7.2,
  nftSmallHalf: 12,
  nftMediumHalf: 16,
  nftLargeHalf: 22,
} as const;

/**
 * Walk half-extent for the active homestead (starter or NFT size).
 *
 * Args:
 *   nftSize: LandNFT size when standing on an NFT plot; omit for the free yard.
 *
 * Returns:
 *   Half X/Z in world units. NFT small is larger than the common land.
 */
export function homesteadYardHalf(nftSize?: string | null): number {
  if (nftSize === "large") return HOMESTEAD_YARD.nftLargeHalf;
  if (nftSize === "medium") return HOMESTEAD_YARD.nftMediumHalf;
  if (nftSize === "small") return HOMESTEAD_YARD.nftSmallHalf;
  return HOMESTEAD_YARD.starterHalf;
}

export interface HomesteadYardLayout {
  half: number;
  fence: number;
  gateZ: number;
  railOuter: number;
  farFenceZ: number;
  sideLength: number;
  farRailLength: number;
}

/**
 * Fence / gate / floor metrics derived from a homestead half-extent.
 *
 * Args:
 *   half: `homesteadYardHalf` result.
 *
 * Returns:
 *   Layout used by HomesteadEnvironment and walk obstacles.
 */
export function homesteadYardLayout(half: number): HomesteadYardLayout {
  const fence = Math.round(half + 0.8);
  return {
    half,
    fence,
    gateZ: half - 0.2,
    railOuter: half + 0.9,
    farFenceZ: -(half - 0.2),
    sideLength: fence * 2 - 1.8,
    farRailLength: fence * 2 + 0.2,
  };
}

/**
 * World Z of the yard-exit gate for the active homestead.
 *
 * Args:
 *   nftSize: LandNFT size when standing on an NFT plot; omit for the free yard.
 *
 * Returns:
 *   Gate Z in world units (starter matches `PLAYER_LAND_GATE.worldZ`).
 */
export function homesteadGateWorldZ(nftSize?: string | null): number {
  return homesteadYardLayout(homesteadYardHalf(nftSize)).gateZ;
}

/**
 * Resolves walk clamp half-extents for a land kind (legacy aliases normalize).
 *
 * @param kind - Active map kind or legacy alias.
 * @returns Half X/Z clamp in world units.
 */
export function walkBoundsForLandKind(
  kind: string | null | undefined,
  nftSize?: string | null,
): MapWalkBounds {
  const n = kind ? normalizeLandKind(String(kind)) : null;
  if ((n ?? "player_land") === "player_land") {
    const half = homesteadYardHalf(nftSize);
    return { halfX: half, halfZ: half };
  }
  return MAP_WALK_BOUNDS[n ?? "player_land"];
}

/**
 * Clamps a world-space position into the walkable box for a map.
 *
 * @param x - World X.
 * @param z - World Z.
 * @param kind - Active map kind.
 * @returns Clamped `{ x, z }`.
 */
export function clampWalkPosition(
  x: number,
  z: number,
  kind: string | null | undefined,
  nftSize?: string | null,
): { x: number; z: number } {
  const b = walkBoundsForLandKind(kind, nftSize);
  return {
    x: Math.max(-b.halfX, Math.min(b.halfX, x)),
    z: Math.max(-b.halfZ, Math.min(b.halfZ, z)),
  };
}

/**
 * Whether a player position is within interact range of a building grid cell.
 */
export function inInteractRange(
  playerX: number,
  playerZ: number,
  buildingGridX: number,
  buildingGridZ: number,
  range: number = WORLD.INTERACT_RANGE,
): boolean {
  const dx = buildingGridX * WORLD.GRID - playerX;
  const dz = buildingGridZ * WORLD.GRID - playerZ;
  return Math.hypot(dx, dz) <= range;
}

/**
 * Soft scarce-city presence lock (CL52.3 / PL8.1) — same rule as server
 * `isCityStationContendedByOther`: another presence already in interact range.
 * Land / Explore never use this for caps; client uses it for readable busy cues.
 *
 * @param stationGridX - Building catalog grid X.
 * @param stationGridZ - Building catalog grid Z.
 * @param others - Remote presence world positions (same space as avatars).
 */
export function isStationContendedByPresence(
  stationGridX: number,
  stationGridZ: number,
  others: ReadonlyArray<{ x: number; z: number }>,
): boolean {
  return others.some((p) =>
    inInteractRange(p.x, p.z, stationGridX, stationGridZ),
  );
}

/**
 * Whether two world-space positions are within interact range (PL15.2 peer ping).
 * Peer avatars use world coords (not catalog grid cells).
 *
 * @param ax - First X (world).
 * @param az - First Z (world).
 * @param bx - Second X (world).
 * @param bz - Second Z (world).
 * @param range - Max distance (defaults to WORLD.INTERACT_RANGE).
 */
export function inWorldInteractRange(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  range = WORLD.INTERACT_RANGE,
): boolean {
  return Math.hypot(ax - bx, az - bz) <= range;
}

/**
 * Peers currently inside interact range of the local player (PL15.2).
 * Empty when zero peers / all far — keeps HUD quiet (PL2.2).
 *
 * @param playerX - Local player world X.
 * @param playerZ - Local player world Z.
 * @param others - Remote presence list.
 * @param range - Max distance (defaults to WORLD.INTERACT_RANGE).
 */
export function peersInInteractRange<T extends { x: number; z: number }>(
  playerX: number,
  playerZ: number,
  others: ReadonlyArray<T>,
  range = WORLD.INTERACT_RANGE,
): T[] {
  return others.filter((o) =>
    inWorldInteractRange(playerX, playerZ, o.x, o.z, range),
  );
}
