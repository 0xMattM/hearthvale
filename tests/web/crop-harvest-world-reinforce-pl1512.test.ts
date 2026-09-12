import { describe, expect, it } from "vitest";
import {
  CROP_HARVEST_WORLD_REINFORCE,
  cropHarvestWorldReinforceBackground,
  shouldFlashCropHarvestWorldReinforce,
} from "../../apps/web/lib/hud/crop-harvest-feedback";
import { CROP_PLANT_SUCCESS_WORLD_REINFORCE } from "../../apps/web/lib/hud/crop-plant-feedback";
import { CROP_READY_WORLD_REINFORCE } from "../../apps/web/lib/hud/crop-ready-feedback";
import { coreSuccessCueText } from "../../apps/web/lib/hud/success-cue";

/**
 * PL151.2 — Crop-harvest soft world reinforce.
 * Choice: one-shot wheat-gold rim (not another Harvested toast) so harvest
 * stays world-readable beside plant sprout + ready rim; grow / yield unchanged.
 */
describe("CityLands PL151.2 crop-harvest soft world reinforce", () => {
  it("flashes wheat-gold rim on harvest ok (happy)", () => {
    expect(shouldFlashCropHarvestWorldReinforce(true)).toBe(true);
    expect(CROP_HARVEST_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(CROP_HARVEST_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = cropHarvestWorldReinforceBackground();
    expect(bg).toContain("radial-gradient");
    expect(bg).toContain(CROP_HARVEST_WORLD_REINFORCE.outerRgba);
    expect(coreSuccessCueText("harvest")).toBe("Harvested");
  });

  it("stays quiet on fail; wheat-gold ≠ sprout / ready (edge)", () => {
    expect(shouldFlashCropHarvestWorldReinforce(false)).toBe(false);

    expect(CROP_HARVEST_WORLD_REINFORCE.outerRgba).not.toBe(
      CROP_PLANT_SUCCESS_WORLD_REINFORCE.outerRgba,
    );
    expect(CROP_HARVEST_WORLD_REINFORCE.outerRgba).not.toBe(
      CROP_READY_WORLD_REINFORCE.outerRgba,
    );
    expect(CROP_HARVEST_WORLD_REINFORCE.midRgba).not.toBe(
      CROP_READY_WORLD_REINFORCE.midRgba,
    );
    expect(CROP_HARVEST_WORLD_REINFORCE.clearPct).toBeLessThan(
      CROP_HARVEST_WORLD_REINFORCE.midPct,
    );
    expect(CROP_HARVEST_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent yield or NFT combat power (failure)", () => {
    expect(cropHarvestWorldReinforceBackground()).not.toMatch(/nft|combat/i);
    expect(String(CROP_HARVEST_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(CROP_HARVEST_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashCropHarvestWorldReinforce(true)).not.toBe(
      shouldFlashCropHarvestWorldReinforce(false),
    );
  });
});
