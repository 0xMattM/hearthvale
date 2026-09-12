import { describe, expect, it } from "vitest";
import {
  NOTICE_UNREAD_WORLD_CUE,
  WARRIOR_ARENA_VISUAL,
} from "../../packages/shared/src/catalog";
import {
  arenaBoardKitMaterials,
  buildBoardKitMaterials,
  noticeBoardKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA2.3", () => {
  it("notice board timber vs metal trim stays readable (happy)", () => {
    const kit = noticeBoardKitMaterials(false);
    expect(kit.post.roughness).toBeGreaterThan(kit.trim.roughness);
    expect(kit.trim.metalness).toBeGreaterThan(kit.post.metalness);
    expect(kit.paper.roughness).toBeGreaterThan(kit.plaque.roughness);
    expect(kit.paperColor).not.toBe(kit.slateColor);
    expect(worldObjectSurfacesDiffer(kit.post, kit.trim)).toBe(true);
  });

  it("build board beacon brightens board without flattening PBR (edge)", () => {
    const soft = buildBoardKitMaterials(false, "soft");
    const beacon = buildBoardKitMaterials(false, "beacon");
    const lit = buildBoardKitMaterials(true, "beacon");
    expect(beacon.boardColor).not.toBe(soft.boardColor);
    expect(lit.boardColor).not.toBe(beacon.boardColor);
    expect(lit.board.roughness).toBe(beacon.board.roughness);
    expect(soft.trim.metalness).toBeGreaterThan(soft.post.metalness);
    expect(worldObjectSurfacesDiffer(soft.board, soft.trim)).toBe(true);
  });

  it("arena kit keeps WARRIOR_ARENA_VISUAL face colors + cue SoT (failure)", () => {
    const kit = arenaBoardKitMaterials();
    expect(kit.trim.metalness).toBeGreaterThan(kit.post.metalness);
    expect(kit.plaque.roughness).toBeLessThan(kit.base.roughness);
    expect(kit.trimColor).not.toBe(kit.bandColor);
    // Kit must not invent replacement plaque face colors.
    expect(WARRIOR_ARENA_VISUAL.plaqueFace).toBe("#a82828");
    expect(WARRIOR_ARENA_VISUAL.plaqueEmissiveIntensity).toBeGreaterThan(0);
    expect(NOTICE_UNREAD_WORLD_CUE.plaqueAccent).toMatch(/^#/);
    expect(worldObjectSurfacesDiffer(kit.plaque, kit.trim)).toBe(true);
  });
});
