import { describe, expect, it } from "vitest";
import {
  BUILDING_COLLISION_RADIUS,
  FOLIAGE_CANOPY,
  GATHER_NODE_DEPLETED_CUE,
  GATHER_READY_TREE,
  PLAYER_COLLISION_RADIUS,
  WORLD,
  WOOD_STUMP,
  gatherReadyTreeCanopyTopY,
  gatherReadyTreeMaterials,
  gatherStumpSurfaceMaterials,
  gatherWoodNodeMeshMode,
  homesteadTreeMaterials,
  gatherStumpVsTrunkRadiusDelta,
} from "@game/shared";

/**
 * TREE-READY-1 — Chop-ready wood nodes read as leafy trees; cooling stays a stump.
 */
describe("gather ready tree visual TREE-READY-1", () => {
  it("uses a leafy tree while chop-ready (happy)", () => {
    expect(gatherWoodNodeMeshMode(true)).toBe("tree");
    const mat = gatherReadyTreeMaterials();
    expect(mat.canopyColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(mat.canopyLitColor).not.toBe(mat.canopyColor);
    expect(mat.canopyColor.toLowerCase()).not.toBe(
      GATHER_NODE_DEPLETED_CUE.stumpReadyTop.toLowerCase(),
    );
    expect(gatherReadyTreeCanopyTopY()).toBeGreaterThan(
      GATHER_READY_TREE.stumpBodyHeight * 2,
    );
    expect(GATHER_READY_TREE.trunkHeight).toBeGreaterThan(
      GATHER_READY_TREE.stumpBodyHeight,
    );
    expect(GATHER_READY_TREE.labelY).toBeGreaterThan(gatherReadyTreeCanopyTopY());
  });

  it("keeps a short stump while cooling; foliage sphere covers lobes (edge)", () => {
    expect(gatherWoodNodeMeshMode(false)).toBe("stump");
    expect(gatherStumpSurfaceMaterials(false).showKerf).toBe(false);
    expect(GATHER_READY_TREE.depletedTimerY).toBeLessThan(
      GATHER_READY_TREE.labelY,
    );

    const lobeReach =
      Math.hypot(GATHER_READY_TREE.canopyLitX, GATHER_READY_TREE.canopyLitZ) +
      GATHER_READY_TREE.canopyLitRadius;
    expect(FOLIAGE_CANOPY.gatherTree.localRadius).toBeGreaterThanOrEqual(
      lobeReach,
    );
    expect(FOLIAGE_CANOPY.gatherTree.localY).toBeGreaterThan(
      GATHER_READY_TREE.trunkY,
    );

    const yard = homesteadTreeMaterials();
    expect(gatherReadyTreeMaterials().canopyColor.toLowerCase()).not.toBe(
      yard.canopyColor.toLowerCase(),
    );
  });

  it("matches living trunk caliber instead of a fat barrel (happy stump)", () => {
    expect(gatherStumpVsTrunkRadiusDelta()).toBeLessThanOrEqual(0.02);
    expect(GATHER_READY_TREE.stumpRadiusBase).toBe(
      GATHER_READY_TREE.trunkRadiusBase,
    );
    expect(GATHER_READY_TREE.stumpRadiusTop).toBeLessThanOrEqual(
      GATHER_READY_TREE.stumpRadiusBase,
    );
    expect(GATHER_READY_TREE.stumpTopRadius).toBeLessThanOrEqual(
      GATHER_READY_TREE.flareRadiusTop,
    );
    expect(GATHER_READY_TREE.stumpBodyHeight).toBeLessThan(
      GATHER_READY_TREE.trunkHeight / 2,
    );
  });

  it("does not block E after contact or invent chop yields (failure)", () => {
    expect(
      PLAYER_COLLISION_RADIUS + BUILDING_COLLISION_RADIUS.tree_stump,
    ).toBeLessThan(WORLD.INTERACT_RANGE);
    expect(WOOD_STUMP.yieldItemId).toBe("wood");
    expect(WOOD_STUMP.yieldQty).toBe(1);
    expect(WOOD_STUMP.cooldownMs).toBe(75_000);

    expect(gatherWoodNodeMeshMode(false)).not.toBe("tree");
    expect(GATHER_READY_TREE.stumpRadiusBase).toBeLessThan(0.35);
    expect(GATHER_READY_TREE.stumpRadiusTop).toBeLessThan(0.55);
    expect(GATHER_READY_TREE.walkUpTipY).toBeGreaterThan(
      GATHER_READY_TREE.labelY,
    );
    expect(gatherReadyTreeCanopyTopY()).toBeLessThan(GATHER_READY_TREE.labelY);
    expect(gatherReadyTreeMaterials().canopyColor).not.toBe(
      GATHER_NODE_DEPLETED_CUE.stumpDepletedTop,
    );
  });
});
