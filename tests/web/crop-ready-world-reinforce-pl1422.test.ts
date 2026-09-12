import { describe, expect, it } from "vitest";

import { CROPS, CROP_READY_WORLD_PULSE, ENERGY } from "@game/shared";

import {

  CROP_READY_WORLD_REINFORCE,

  cropReadyWorldReinforceBackground,

  shouldFlashCropReadyWorldReinforce,

} from "../../apps/web/lib/hud/crop-ready-feedback";

import {

  CROP_PLANT_SUCCESS_WORLD_REINFORCE,

} from "../../apps/web/lib/hud/crop-plant-feedback";

import {

  CROP_READY_EDGE_CUE,

  cropReadyEdgeCueText,

  shouldFlashCropReadyEdgeCue,

} from "../../apps/web/lib/hud/success-cue";



/**

 * PL142.2 — Crop-ready soft world leftover.

 * Brief quiet harvest rim when a plot flips to ready (complements ready pad

 * pulse PL12.1 + Ready soft PL60.1). Grow timers unchanged; mute ok.

 * Choice: one-shot harvest rim (not another Ready toast) so flip stays

 * world-readable beside continuous pad pulse + ephemeral.

 */

describe("CityLands PL142.2 crop-ready soft world leftover", () => {

  it("flashes soft harvest rim on ready edge (happy)", () => {

    const prev = new Set<string>();

    const next = new Set(["plot-a"]);

    const edged = shouldFlashCropReadyEdgeCue(prev, next);

    expect(edged).toBe(true);

    expect(shouldFlashCropReadyWorldReinforce(edged)).toBe(true);

    expect(CROP_READY_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);

    expect(CROP_READY_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);



    const bg = cropReadyWorldReinforceBackground();

    expect(bg).toMatch(/^radial-gradient/);

    expect(bg).toContain(CROP_READY_WORLD_REINFORCE.outerRgba);

    expect(bg).toContain("transparent");



    // Complements — does not replace — Ready soft.

    expect(cropReadyEdgeCueText()).toBe(CROP_READY_EDGE_CUE);

    expect(cropReadyEdgeCueText()).toBe("Ready");

  });



  it("stays quiet without edge; rim ≠ plant sprout (edge)", () => {

    expect(shouldFlashCropReadyWorldReinforce(false)).toBe(false);

    expect(

      shouldFlashCropReadyEdgeCue(new Set(["plot-a"]), new Set(["plot-a"])),

    ).toBe(false);

    expect(

      shouldFlashCropReadyWorldReinforce(

        shouldFlashCropReadyEdgeCue(null, new Set(["plot-a"])),

      ),

    ).toBe(false);



    expect(CROP_READY_WORLD_REINFORCE.outerRgba).not.toBe(

      CROP_PLANT_SUCCESS_WORLD_REINFORCE.outerRgba,

    );

    expect(CROP_READY_WORLD_REINFORCE.clearPct).toBeLessThan(

      CROP_READY_WORLD_REINFORCE.midPct,

    );

    expect(CROP_READY_WORLD_REINFORCE.durationMs).toBeLessThan(2000);

    // Kinship with ready pad emissive family — harvest lime/gold.

    expect(CROP_READY_WORLD_PULSE.emissiveColor.toLowerCase()).toBe("#a0b830");

  });



  it("does not invent grow timers; keeps crop SoT (failure)", () => {

    expect(CROPS.wheat.growMs).toBe(3 * 60 * 1000);

    expect(CROPS.wheat.plantEnergy).toBe(ENERGY.costs.plant);

    expect(CROPS.wheat.seedItemId).toBe("wheat_seed");

    expect(cropReadyWorldReinforceBackground()).not.toMatch(

      /\d+\s*ms|growMs/i,

    );

    expect(String(CROP_READY_WORLD_REINFORCE.durationMs)).not.toMatch(

      /nft|combat/i,

    );

    expect(CROP_READY_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);

    expect(shouldFlashCropReadyWorldReinforce(true)).not.toBe(

      shouldFlashCropReadyWorldReinforce(false),

    );

  });

});


