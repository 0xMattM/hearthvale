import { describe, expect, it } from "vitest";
import {
  marketBoardKitMaterials,
  vendorStallKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA2.2", () => {
  it("vendor stall kit keeps timber vs awning readable (happy)", () => {
    const kit = vendorStallKitMaterials(false);
    expect(kit.awning.roughness).toBeGreaterThan(kit.counter.roughness);
    expect(kit.goodsCrate.metalness).toBeGreaterThan(kit.post.metalness);
    expect(kit.counterColor).not.toBe(kit.awningColor);
    expect(worldObjectSurfacesDiffer(kit.post, kit.awning)).toBe(true);
  });

  it("highlight brightens counter/awning without flattening PBR (edge)", () => {
    const idle = vendorStallKitMaterials(false);
    const lit = vendorStallKitMaterials(true);
    expect(lit.counterColor).not.toBe(idle.counterColor);
    expect(lit.awningColor).not.toBe(idle.awningColor);
    expect(lit.counter.roughness).toBe(idle.counter.roughness);
    expect(lit.postColor).toBe(idle.postColor);
  });

  it("market board strips stay distinct from slate (failure)", () => {
    const idle = marketBoardKitMaterials(false);
    const lit = marketBoardKitMaterials(true);
    expect(idle.slateColor).not.toBe(idle.stripColor);
    expect(idle.stripColor).not.toBe(idle.stripAltColor);
    expect(lit.frameColor).not.toBe(idle.frameColor);
    expect(idle.slate.roughness).toBeGreaterThan(idle.strip.roughness);
    expect(worldObjectSurfacesDiffer(idle.frame, idle.slate)).toBe(true);
    expect(idle.post.roughness).toBeGreaterThan(0.5);
  });
});
