import { describe, expect, it } from "vitest";
import {
  cropPlotSoilMaterials,
  forestTreeMaterials,
  homesteadFenceMaterials,
  homesteadShedMaterials,
  homesteadTreeMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA1.3", () => {
  it("homestead / forest trees stay map-readable (happy)", () => {
    const home = homesteadTreeMaterials();
    const forest = forestTreeMaterials();
    expect(home.trunkColor).not.toBe(forest.trunkColor);
    expect(home.canopyColor).not.toBe(forest.canopyColor);
    expect(home.canopyLit.roughness).toBeLessThan(home.canopy.roughness);
    expect(forest.canopyAlt.roughness).toBeLessThan(forest.canopy.roughness);
    expect(worldObjectSurfacesDiffer(home.trunk, home.canopyLit)).toBe(true);
    expect(home.trunk.roughness).toBeGreaterThan(0.5);
  });

  it("fence / shed kit surfaces stay timber-readable (edge)", () => {
    const fence = homesteadFenceMaterials();
    const shed = homesteadShedMaterials();
    expect(fence.cap.roughness).toBeLessThan(fence.post.roughness);
    expect(fence.capColor).not.toBe(fence.midRailColor);
    expect(shed.door.metalness).toBeGreaterThan(shed.roof.metalness);
    expect(shed.bodyColor).not.toBe(shed.doorColor);
    expect(shed.sill.roughness).toBeLessThan(shed.roof.roughness);
    expect(worldObjectSurfacesDiffer(fence.post, fence.cap)).toBe(true);
  });

  it("crop soil stages articulate empty vs planted vs ready (failure)", () => {
    const empty = cropPlotSoilMaterials("empty");
    const sprout = cropPlotSoilMaterials("sprout");
    const growing = cropPlotSoilMaterials("growing");
    const ready = cropPlotSoilMaterials("ready");

    expect(empty.showFurrows).toBe(true);
    expect(empty.showClods).toBe(true);
    expect(sprout.showFurrows).toBe(true);
    expect(sprout.showClods).toBe(false);
    expect(growing.showFurrows).toBe(false);
    expect(ready.showFurrows).toBe(false);
    expect(ready.showClods).toBe(false);

    expect(sprout.bed.roughness).toBeLessThan(empty.bed.roughness);
    expect(ready.bed.roughness).toBeLessThan(empty.bed.roughness);
    expect(empty.furrowColor).not.toBe(sprout.furrowColor);
    expect(worldObjectSurfacesDiffer(empty.bed, sprout.bed)).toBe(true);
  });
});
