import { describe, expect, it } from "vitest";
import {
  CLAIM_NODE,
  CLAIM_NODE_FIRST_WALKUP_WORLD_TIP,
  claimNodeFirstWalkUpWorldTip,
} from "../../packages/shared/src/catalog";
import {
  claimNodeKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA3.2", () => {
  it("finial stays more metallic than cloth banner (happy)", () => {
    const kit = claimNodeKitMaterials();
    expect(kit.finial.metalness).toBeGreaterThan(kit.banner.metalness);
    expect(kit.banner.roughness).toBeGreaterThan(kit.finial.roughness);
    expect(kit.postColor).toBe("#5a4a3a");
    expect(worldObjectSurfacesDiffer(kit.banner, kit.finial)).toBe(true);
  });

  it("footing stays duller stone than lit post tint (edge)", () => {
    const kit = claimNodeKitMaterials();
    expect(kit.footing.roughness).toBeGreaterThan(kit.post.roughness);
    expect(kit.postLitColor).not.toBe(kit.postColor);
    expect(kit.footingColor).not.toBe(kit.finialColor);
    expect(worldObjectSurfacesDiffer(kit.post, kit.footing)).toBe(true);
  });

  it("claim produce SoT + walk-up tip stay intact (failure)", () => {
    const kit = claimNodeKitMaterials();
    expect(CLAIM_NODE.slug).toBe("wild_grove");
    expect(CLAIM_NODE.produceItemId).toBe("wood");
    expect(CLAIM_NODE.storageCap).toBe(25);
    expect(CLAIM_NODE.claimEnergyCost).toBe(15);
    expect(claimNodeFirstWalkUpWorldTip()).toBe(CLAIM_NODE_FIRST_WALKUP_WORLD_TIP);
    expect(CLAIM_NODE_FIRST_WALKUP_WORLD_TIP).toBe("Claim · E");
    // Kit accent tints must not collide with ownership banner greens/reds/golds.
    expect(kit.postColor).not.toBe("#6a9e5a");
    expect(kit.finialColor).not.toBe("#9e5a5a");
    expect(kit.footingColor).not.toBe("#c4a35a");
  });
});
