import { describe, expect, it } from "vitest";

import {
  GATHER_SUCCESS_WORLD_REINFORCE,
  gatherSuccessWorldReinforceBackground,
  shouldFlashGatherSuccessWorldReinforce,
} from "../../apps/web/lib/hud/gather-success-feedback";
import { CRAFT_COMPLETE_WORLD_REINFORCE } from "../../apps/web/lib/hud/craft-complete-feedback";
import { CROP_PLANT_SUCCESS_WORLD_REINFORCE } from "../../apps/web/lib/hud/crop-plant-feedback";
import { GATHER_SUCCESS_PAD_FLASH } from "@game/shared";

/**
 * PL161.1 — Gather-success soft world reinforce leftover.
 * Brief soft rim after gather ok (complements Chopped/Mined/Collected PL43.1 +
 * mint pad PL131.2). Yields unchanged; mute ok; fail silent.
 * Choice: one-shot mint-lime rim (not another Chopped toast / pad-only) so
 * gather stays world-readable beside settle pad + inventory flash.
 */
describe("CityLands PL161.1 gather-success soft world reinforce", () => {
  it("flashes quiet mint-lime rim when gather succeeds on stump/ore/pen (happy)", () => {
    expect(shouldFlashGatherSuccessWorldReinforce(true, "tree_stump")).toBe(
      true,
    );
    expect(shouldFlashGatherSuccessWorldReinforce(true, "ore_node")).toBe(true);
    expect(shouldFlashGatherSuccessWorldReinforce(true, "animal_pen")).toBe(
      true,
    );
    expect(GATHER_SUCCESS_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(GATHER_SUCCESS_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = gatherSuccessWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(GATHER_SUCCESS_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — mint settle pad.
    expect(GATHER_SUCCESS_PAD_FLASH.durationMs).toBeGreaterThan(0);
    expect(GATHER_SUCCESS_PAD_FLASH.padColor).toMatch(/^#/);
  });

  it("stays quiet on fail / dock; rim ≠ craft olive / plant sprout (edge)", () => {
    expect(shouldFlashGatherSuccessWorldReinforce(false, "tree_stump")).toBe(
      false,
    );
    expect(shouldFlashGatherSuccessWorldReinforce(true, "fishing_dock")).toBe(
      false,
    );
    expect(shouldFlashGatherSuccessWorldReinforce(true, "mill")).toBe(false);

    expect(GATHER_SUCCESS_WORLD_REINFORCE.outerRgba).not.toBe(
      CRAFT_COMPLETE_WORLD_REINFORCE.outerRgba,
    );
    expect(GATHER_SUCCESS_WORLD_REINFORCE.midRgba).not.toBe(
      CRAFT_COMPLETE_WORLD_REINFORCE.midRgba,
    );
    expect(GATHER_SUCCESS_WORLD_REINFORCE.outerRgba).not.toBe(
      CROP_PLANT_SUCCESS_WORLD_REINFORCE.outerRgba,
    );
    expect(GATHER_SUCCESS_WORLD_REINFORCE.midRgba).not.toBe(
      CROP_PLANT_SUCCESS_WORLD_REINFORCE.midRgba,
    );
    expect(GATHER_SUCCESS_WORLD_REINFORCE.clearPct).toBeLessThan(
      GATHER_SUCCESS_WORLD_REINFORCE.midPct,
    );
    expect(GATHER_SUCCESS_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent yields / NFT combat; keeps ok + type gate (failure)", () => {
    expect(gatherSuccessWorldReinforceBackground()).not.toMatch(
      /yield\s*change|always.?on|nft/i,
    );
    expect(String(GATHER_SUCCESS_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(GATHER_SUCCESS_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashGatherSuccessWorldReinforce(true, "tree_stump")).not.toBe(
      shouldFlashGatherSuccessWorldReinforce(false, "tree_stump"),
    );
  });
});
