import { describe, expect, it } from "vitest";
import { CROPS, ENERGY } from "@game/shared";
import {
  CROP_PLANT_SUCCESS_WORLD_REINFORCE,
  cropPlantSuccessWorldReinforceBackground,
  shouldFlashCropPlantSuccessWorldReinforce,
} from "../../apps/web/lib/hud/crop-plant-feedback";
import {
  EAT_SUCCESS_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/energy-food-feedback";
import { coreSuccessCueText } from "../../apps/web/lib/hud/success-cue";

/**
 * PL127.2 — Crop plant success soft reinforce.
 * Brief world sprout rim on successful seed plant (complements plant SFX + Planted).
 * Grow timers / seed rules unchanged; mute ok.
 * Choice: one-shot sprout rim (not another Planted toast) so empty→growing
 * stays world-readable beside existing ephemeral + SFX.
 */
describe("CityLands PL127.2 crop plant success soft world reinforce", () => {
  it("flashes soft sprout rim only on successful plant (happy)", () => {
    expect(shouldFlashCropPlantSuccessWorldReinforce(true)).toBe(true);
    expect(CROP_PLANT_SUCCESS_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(CROP_PLANT_SUCCESS_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = cropPlantSuccessWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(CROP_PLANT_SUCCESS_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Planted cue.
    expect(coreSuccessCueText("plant")).toBe("Planted");
  });

  it("stays quiet on refuse / failed plant; rim ≠ eat reinforce (edge)", () => {
    expect(shouldFlashCropPlantSuccessWorldReinforce(false)).toBe(false);
    expect(CROP_PLANT_SUCCESS_WORLD_REINFORCE.outerRgba).not.toBe(
      EAT_SUCCESS_WORLD_REINFORCE.outerRgba,
    );
    expect(CROP_PLANT_SUCCESS_WORLD_REINFORCE.clearPct).toBeLessThan(
      CROP_PLANT_SUCCESS_WORLD_REINFORCE.midPct,
    );
    expect(CROP_PLANT_SUCCESS_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent grow timers or plant energy; keeps seed SoT (failure)", () => {
    expect(CROPS.wheat.growMs).toBe(3 * 60 * 1000);
    expect(CROPS.wheat.plantEnergy).toBe(ENERGY.costs.plant);
    expect(CROPS.wheat.seedItemId).toBe("wheat_seed");
    expect(cropPlantSuccessWorldReinforceBackground()).not.toMatch(
      /\d+\s*ms|growMs/i,
    );
    expect(String(CROP_PLANT_SUCCESS_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(CROP_PLANT_SUCCESS_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(shouldFlashCropPlantSuccessWorldReinforce(true)).not.toBe(
      shouldFlashCropPlantSuccessWorldReinforce(false),
    );
  });
});
