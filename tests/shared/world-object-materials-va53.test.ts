import { describe, expect, it } from "vitest";
import {
  CROP_GROWING_SOFT_SWAY,
  CROP_READY_WORLD_PULSE,
  cropGrowingPadEmissiveIntensity,
  cropGrowingSoftSwayActive,
  cropGrowingSoftSwayEnvelope,
  cropReadyWorldPulseIntensity,
} from "../../packages/shared/src/catalog";
import { formatGrowRemaining } from "../../packages/shared/src/messages";
import {
  cropGrowthProgressBarMaterials,
  cropPlotSoilMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA5.3", () => {
  it("fill reads smoother than quiet frame track (happy)", () => {
    const bar = cropGrowthProgressBarMaterials();
    expect(bar.fill.roughness).toBeLessThan(bar.frame.roughness);
    expect(bar.fill.metalness).toBeGreaterThan(bar.frame.metalness);
    expect(bar.fillColor).toBe("#e8f0e2");
    expect(bar.maxWidth).toBe(1.4);
    expect(worldObjectSurfacesDiffer(bar.fill, bar.frame)).toBe(true);
  });

  it("frame lip articulates without flattening soil bed (edge)", () => {
    const bar = cropGrowthProgressBarMaterials();
    const soil = cropPlotSoilMaterials("growing");
    expect(bar.frameLip).toBeGreaterThan(0);
    expect(bar.frameColor).toMatch(/^#/);
    expect(bar.frameColor).not.toBe(bar.fillColor);
    expect(worldObjectSurfacesDiffer(bar.fill, soil.bed)).toBe(true);
    expect(worldObjectSurfacesDiffer(bar.frame, soil.border)).toBe(true);
    expect(cropGrowingSoftSwayActive("growing")).toBe(true);
    expect(cropGrowingSoftSwayActive("ready")).toBe(false);
    expect(cropGrowingPadEmissiveIntensity(true, 1)).toBeGreaterThan(0);
  });

  it("grow timers + ready / growing cues stay intact (failure)", () => {
    const bar = cropGrowthProgressBarMaterials();
    expect(CROP_READY_WORLD_PULSE.padColor).toBe("#c8d868");
    expect(CROP_READY_WORLD_PULSE.periodMs).toBe(1600);
    expect(cropReadyWorldPulseIntensity(0)).toBeGreaterThan(0);
    expect(CROP_GROWING_SOFT_SWAY.padColor).toBe("#6a8a48");
    expect(CROP_GROWING_SOFT_SWAY.periodMs).toBe(2400);
    expect(cropGrowingSoftSwayEnvelope(0)).toBeGreaterThanOrEqual(0);
    expect(formatGrowRemaining(90_000)).toBe("1:30");
    expect(formatGrowRemaining(45_000)).toBe("45s");
    // Kit never overrides ready/growing pad RGB — pale fill only.
    expect(bar.fillColor).not.toBe(CROP_READY_WORLD_PULSE.padColor);
    expect(bar.fillColor).not.toBe(CROP_GROWING_SOFT_SWAY.padColor);
    expect(bar.frameColor).not.toBe(CROP_READY_WORLD_PULSE.emissiveColor);
    expect(bar.height).toBe(0.08);
    expect(bar.y).toBe(0.35);
  });
});
