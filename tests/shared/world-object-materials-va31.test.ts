import { describe, expect, it } from "vitest";
import {
  EXPAND_PAD_AFFORD_CUE,
  EXPAND_PAD_SHORT_AFFORD_PULSE,
  expandPadMeshColors,
} from "../../packages/shared/src/catalog";
import {
  expandPadKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA3.1", () => {
  it("post cap reads shinier than timber post (happy)", () => {
    const kit = expandPadKitMaterials();
    expect(kit.postCap.metalness).toBeGreaterThan(kit.post.metalness);
    expect(kit.pad.roughness).toBeGreaterThan(kit.postCap.roughness);
    expect(kit.postColor).toBe("#5c4330");
    expect(worldObjectSurfacesDiffer(kit.post, kit.postCap)).toBe(true);
  });

  it("lip stays duller stone than post cap metal (edge)", () => {
    const kit = expandPadKitMaterials();
    expect(kit.lip.roughness).toBeGreaterThan(kit.postCap.roughness);
    expect(kit.lip.metalness).toBeLessThan(kit.postCap.metalness);
    expect(kit.lipColor).not.toBe(kit.postCapColor);
    expect(worldObjectSurfacesDiffer(kit.pad, kit.lip)).toBe(true);
  });

  it("afford cue RGB + short pulse SoT stay intact (failure)", () => {
    const kit = expandPadKitMaterials();
    const affordable = expandPadMeshColors("affordable", false);
    const short = expandPadMeshColors("short", true);
    expect(EXPAND_PAD_AFFORD_CUE.affordablePad).toBe("#5a7a48");
    expect(EXPAND_PAD_AFFORD_CUE.shortPadLit).toBe("#5a5040");
    expect(affordable.padColor).toBe(EXPAND_PAD_AFFORD_CUE.affordablePad);
    expect(short.padColor).toBe(EXPAND_PAD_AFFORD_CUE.shortPadLit);
    expect(EXPAND_PAD_SHORT_AFFORD_PULSE.emissive).toMatch(/^#/);
    // Kit never overrides afford pad colors — posts/lip only.
    expect(kit.postColor).not.toBe(EXPAND_PAD_AFFORD_CUE.affordablePad);
    expect(kit.lipColor).not.toBe(EXPAND_PAD_AFFORD_CUE.shortPad);
  });
});
