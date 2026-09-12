/**
 * Explore wilds mix — one semi-open canopy, no woodland/mines yards.
 * Env-only props; gather/hunt types stay on EXPLORE_BUILDINGS.
 */

import { EXPLORE_BUILDINGS } from "./catalog-layouts.js";
import { WORLD } from "./world.js";

/** Decor kind on the mixed canopy. */
export type ExploreWildsPropKind = "tree" | "rock" | "bush" | "dirt";

/** One atmosphere prop in world units. */
export interface ExploreWildsProp {
  kind: ExploreWildsPropKind;
  x: number;
  z: number;
  scale: number;
  rotY: number;
  radius: number;
}

/**
 * Frozen mixed scatter for gather / hunt nodes.
 * Trees, ores, hares, and boars share both halves of the map.
 *
 * @param buildings - Explore template rows.
 * @returns True when types are interleaved, not zoned west/east.
 */
export function exploreNodesReadAsMixed(
  buildings: ReadonlyArray<{
    type: string;
    x: number;
    z: number;
  }> = EXPLORE_BUILDINGS,
): boolean {
  const trees = buildings.filter((b) => b.type === "tree_stump");
  const ores = buildings.filter((b) => b.type === "ore_node");
  const dens = buildings.filter(
    (b) => b.type === "game_trail" || b.type === "edge_thicket",
  );
  if (trees.length < 4 || ores.length < 4 || dens.length < 4) return false;
  const treeWest = trees.filter((t) => t.x < 0).length;
  const treeEast = trees.filter((t) => t.x > 0).length;
  const oreWest = ores.filter((o) => o.x < 0).length;
  const oreEast = ores.filter((o) => o.x > 0).length;
  if (treeWest < 1 || treeEast < 1 || oreWest < 1 || oreEast < 1) return false;
  const densSouth = dens.filter((d) => d.z < 2).length;
  const densNorth = dens.filter((d) => d.z > 6).length;
  if (densSouth < 1 || densNorth < 1) return false;
  for (let i = 0; i < buildings.length; i++) {
    const a = buildings[i]!;
    for (let j = i + 1; j < buildings.length; j++) {
      const b = buildings[j]!;
      if (Math.hypot(a.x - b.x, a.z - b.z) < 2.4) return false;
    }
  }
  return true;
}

/**
 * Whether a world-space prop sits off gather / hunt pads.
 *
 * @param x - World X.
 * @param z - World Z.
 * @param minDist - Minimum center gap.
 * @returns True when the prop is not stacked on a node.
 */
export function exploreWildsPropClearsNodes(
  x: number,
  z: number,
  minDist = 3.4,
): boolean {
  if (!(minDist > 0)) return false;
  for (const b of EXPLORE_BUILDINGS) {
    const bx = b.x * WORLD.GRID;
    const bz = b.z * WORLD.GRID;
    if (Math.hypot(x - bx, z - bz) < minDist) return false;
  }
  return true;
}

/**
 * Grove / rock / bush / dirt dressing — mixed across the canopy.
 */
export const EXPLORE_WILDS_PROPS: ReadonlyArray<ExploreWildsProp> = [
  { kind: "tree", x: -22, z: 4, scale: 1.15, rotY: 0.2, radius: 0.7 },
  { kind: "tree", x: -16, z: 13, scale: 1.35, rotY: -0.4, radius: 0.78 },
  { kind: "tree", x: 18, z: 5, scale: 1.1, rotY: 0.5, radius: 0.68 },
  { kind: "tree", x: 24, z: -7, scale: 1.25, rotY: 0.1, radius: 0.74 },
  { kind: "tree", x: -5, z: 17, scale: 0.95, rotY: -0.2, radius: 0.62 },
  { kind: "tree", x: 8, z: -15, scale: 1.2, rotY: 0.3, radius: 0.7 },
  { kind: "tree", x: -28, z: -4, scale: 1.4, rotY: -0.15, radius: 0.82 },
  { kind: "tree", x: 15, z: 19, scale: 1.05, rotY: 0.45, radius: 0.66 },
  { kind: "tree", x: 2, z: 13, scale: 1.3, rotY: -0.35, radius: 0.76 },
  { kind: "tree", x: -15, z: -12, scale: 1.1, rotY: 0.25, radius: 0.68 },
  { kind: "tree", x: 21, z: 11, scale: 0.9, rotY: -0.5, radius: 0.6 },
  { kind: "tree", x: -8, z: 20, scale: 1.18, rotY: 0.15, radius: 0.7 },
  { kind: "tree", x: 27, z: 1, scale: 1.22, rotY: 0.05, radius: 0.72 },
  { kind: "tree", x: -20, z: -17, scale: 1.08, rotY: -0.25, radius: 0.66 },
  { kind: "tree", x: 4, z: -19, scale: 1.32, rotY: 0.4, radius: 0.78 },
  { kind: "tree", x: 19, z: -12, scale: 1.0, rotY: -0.1, radius: 0.64 },
  { kind: "tree", x: -3, z: 9, scale: 1.15, rotY: 0.55, radius: 0.7 },
  { kind: "tree", x: 11, z: 2, scale: 0.88, rotY: -0.3, radius: 0.58 },
  { kind: "rock", x: 15.2, z: 3.6, scale: 1.1, rotY: 0.4, radius: 0.35 },
  { kind: "rock", x: -18.4, z: 1.8, scale: 0.95, rotY: -0.6, radius: 0.32 },
  { kind: "rock", x: 5.2, z: 15.1, scale: 1.25, rotY: 0.2, radius: 0.38 },
  { kind: "rock", x: -7.4, z: -9.2, scale: 0.85, rotY: 0.8, radius: 0.28 },
  { kind: "rock", x: 22.6, z: 9.4, scale: 1.05, rotY: -0.3, radius: 0.34 },
  { kind: "rock", x: -23.5, z: 11.2, scale: 1.15, rotY: 0.15, radius: 0.36 },
  { kind: "rock", x: 1.4, z: -16.5, scale: 0.9, rotY: -0.45, radius: 0.3 },
  { kind: "rock", x: 12.8, z: -11.4, scale: 1.2, rotY: 0.55, radius: 0.37 },
  { kind: "bush", x: -12.2, z: 10.4, scale: 1.0, rotY: 0.2, radius: 0.4 },
  { kind: "bush", x: 9.4, z: 16.2, scale: 1.15, rotY: -0.3, radius: 0.42 },
  { kind: "bush", x: 17.2, z: -8.4, scale: 0.9, rotY: 0.5, radius: 0.36 },
  { kind: "bush", x: -21.8, z: -4.6, scale: 1.05, rotY: -0.1, radius: 0.4 },
  { kind: "bush", x: 3.6, z: 6.8, scale: 0.85, rotY: 0.7, radius: 0.34 },
  { kind: "bush", x: -4.8, z: -17.2, scale: 1.1, rotY: -0.55, radius: 0.4 },
  { kind: "bush", x: 25.2, z: 6.2, scale: 0.95, rotY: 0.25, radius: 0.38 },
  { kind: "bush", x: -14.6, z: 18.4, scale: 1.2, rotY: 0.05, radius: 0.44 },
  { kind: "dirt", x: -10.5, z: 2.4, scale: 1, rotY: 0, radius: 1.6 },
  { kind: "dirt", x: 18.2, z: 14.6, scale: 1, rotY: 0, radius: 1.45 },
  { kind: "dirt", x: 2.2, z: -11.6, scale: 1, rotY: 0, radius: 1.3 },
  { kind: "dirt", x: -19.2, z: 8.6, scale: 1, rotY: 0, radius: 1.55 },
  { kind: "dirt", x: 20.4, z: -1.8, scale: 1, rotY: 0, radius: 1.4 },
  { kind: "dirt", x: 6.8, z: 12.4, scale: 1, rotY: 0, radius: 1.25 },
];

/**
 * Mixed wilds atmosphere props.
 *
 * @returns Grove / rock / bush / dirt rows.
 */
export function exploreWildsProps(): ReadonlyArray<ExploreWildsProp> {
  return EXPLORE_WILDS_PROPS;
}

/**
 * Walk solids for grove trunks (bushes / dirt are walk-through).
 *
 * @returns Obstacle circles matching tree props.
 */
export function exploreWildsTreeObstacles(): ReadonlyArray<{
  worldX: number;
  worldZ: number;
  radius: number;
}> {
  return EXPLORE_WILDS_PROPS.filter((p) => p.kind === "tree").map((p) => ({
    worldX: p.x,
    worldZ: p.z,
    radius: p.radius,
  }));
}

/**
 * Whether the wilds dressing reads as mixed groves, not a mine/wood yard.
 *
 * @param props - Atmosphere rows.
 * @returns True when kinds and halves are interleaved.
 */
export function exploreWildsPropsReadAsOpenCanopy(
  props: ReadonlyArray<ExploreWildsProp> = EXPLORE_WILDS_PROPS,
): boolean {
  const trees = props.filter((p) => p.kind === "tree");
  const rocks = props.filter((p) => p.kind === "rock");
  const bushes = props.filter((p) => p.kind === "bush");
  if (trees.length < 12 || rocks.length < 6 || bushes.length < 6) return false;
  const west = trees.filter((t) => t.x < 0).length;
  const east = trees.filter((t) => t.x > 0).length;
  if (west < 4 || east < 4) return false;
  return props.every((p) => exploreWildsPropClearsNodes(p.x, p.z));
}
