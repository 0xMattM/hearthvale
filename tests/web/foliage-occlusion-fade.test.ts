import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const HOOK = path.join(
  process.cwd(),
  "apps/web/components/land-scene/useFoliageOcclusionFade.ts",
);
const GLTF = path.join(
  process.cwd(),
  "apps/web/components/land-scene/VillageGltfProp.tsx",
);

/**
 * Follow-cam foliage ghosts canopy opacity instead of toggling mesh.visible.
 */
describe("foliage occlusion ghost fade", () => {
  it("fades canopy materials instead of hiding the mesh (happy)", () => {
    const src = fs.readFileSync(HOOK, "utf8");
    expect(src).toContain("mat.opacity = opacity");
    expect(src).toContain("mat.transparent = ghost");
    expect(src).toContain("mesh.visible = true");
    expect(src).toContain("applyCanopyGhost");
  });

  it("clones GLTF tree materials so ghost opacity stays per instance (edge)", () => {
    const src = fs.readFileSync(GLTF, "utf8");
    expect(src).toContain("uniquifyFoliageMaterials");
    expect(src).toContain("mesh.material.clone()");
    expect(src).toContain("foliageCanopy");
  });

  it("rejects fully hiding the canopy mesh (failure)", () => {
    const src = fs.readFileSync(HOOK, "utf8");
    expect(src).not.toContain("mesh.visible = !hidden");
    expect(src).not.toContain("mesh.visible = false");
    expect(() => {
      if (!fs.existsSync(HOOK)) throw new Error("missing foliage fade hook");
    }).not.toThrow();
  });
});
