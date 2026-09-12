import { describe, expect, it } from "vitest";
import {
  EXPLORE_BUILDINGS,
  exploreNodesReadAsMixed,
  exploreWildsPropClearsNodes,
  exploreWildsProps,
  exploreWildsPropsReadAsOpenCanopy,
  exploreWildsTreeObstacles,
  staticMapWalkObstacles,
} from "@game/shared";

/**
 * Mixed semi-open Explore — trees, ores, and dens share the canopy.
 */
describe("explore wilds mix", () => {
  it("scatters trees, ores, and dens across both halves (happy)", () => {
    expect(exploreNodesReadAsMixed()).toBe(true);
    expect(exploreWildsPropsReadAsOpenCanopy()).toBe(true);
    const trees = EXPLORE_BUILDINGS.filter((b) => b.type === "tree_stump");
    const ores = EXPLORE_BUILDINGS.filter((b) => b.type === "ore_node");
    expect(trees.some((t) => t.x > 0)).toBe(true);
    expect(ores.some((o) => o.x < 0)).toBe(true);
    expect(EXPLORE_BUILDINGS.filter((b) => b.type === "game_trail").length).toBe(
      2,
    );
    expect(
      EXPLORE_BUILDINGS.filter((b) => b.type === "edge_thicket").length,
    ).toBe(2);
    expect(EXPLORE_BUILDINGS.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
  });

  it("keeps groves off nodes and walkable around trunks (edge)", () => {
    const props = exploreWildsProps();
    expect(props.every((p) => exploreWildsPropClearsNodes(p.x, p.z))).toBe(
      true,
    );
    const trunks = exploreWildsTreeObstacles();
    expect(trunks.length).toBe(props.filter((p) => p.kind === "tree").length);
    const city = staticMapWalkObstacles("explore");
    expect(
      trunks.every((o) =>
        city.some((c) => c.worldX === o.worldX && c.worldZ === o.worldZ),
      ),
    ).toBe(true);
    expect(props.filter((p) => p.kind === "rock").length).toBeGreaterThanOrEqual(
      6,
    );
  });

  it("rejects a west-wood / east-mine split or empty canopy (failure)", () => {
    expect(
      exploreNodesReadAsMixed([
        { type: "tree_stump", x: -10, z: 0 },
        { type: "tree_stump", x: -12, z: 2 },
        { type: "tree_stump", x: -8, z: 4 },
        { type: "tree_stump", x: -14, z: 1 },
        { type: "ore_node", x: 10, z: 0 },
        { type: "ore_node", x: 12, z: 2 },
        { type: "ore_node", x: 8, z: 4 },
        { type: "ore_node", x: 14, z: 1 },
        { type: "game_trail", x: 0, z: 12 },
        { type: "game_trail", x: 1, z: 11 },
        { type: "edge_thicket", x: 2, z: 13 },
        { type: "edge_thicket", x: -1, z: 10 },
      ]),
    ).toBe(false);
    expect(exploreWildsPropClearsNodes(0, 0, 0)).toBe(false);
    expect(exploreNodesReadAsMixed([])).toBe(false);
    expect(exploreWildsPropsReadAsOpenCanopy([])).toBe(false);
  });
});
