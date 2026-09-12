import { describe, expect, it } from "vitest";

import {
  CRAFT_COMPLETE_WORLD_REINFORCE,
  craftCompleteWorldReinforceBackground,
  shouldFlashCraftCompleteWorldReinforce,
} from "../../apps/web/lib/hud/craft-complete-feedback";
import {
  INVENTORY_PICKUP_SLOT_FLASH,
} from "../../apps/web/lib/hud/inventory-pickup-slot-flash";
import {
  CROP_PLANT_SUCCESS_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/crop-plant-feedback";
import {
  CRAFT_COMPLETE_BENCH_FLASH,
} from "@game/shared";

/**
 * PL159.2 — Craft-complete soft world reinforce leftover.
 * Brief soft rim after craft ok (complements craft olive pad PL131.1 +
 * inventory pickup PL128.2). Recipes unchanged; mute ok; fail silent.
 * Choice: one-shot sprout-olive rim (not another Crafted toast / bench pad only)
 * so craft stays world-readable beside olive settle + bag flash.
 */
describe("CityLands PL159.2 craft-complete soft world reinforce", () => {
  it("flashes quiet sprout-olive rim when craft succeeds (happy)", () => {
    expect(shouldFlashCraftCompleteWorldReinforce(true)).toBe(true);
    expect(CRAFT_COMPLETE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(CRAFT_COMPLETE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = craftCompleteWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(CRAFT_COMPLETE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — bench olive pad.
    expect(CRAFT_COMPLETE_BENCH_FLASH.durationMs).toBeGreaterThan(0);
    expect(CRAFT_COMPLETE_BENCH_FLASH.padColor).toMatch(/^#/);
  });

  it("stays quiet on fail; rim ≠ pickup mint / plant sprout (edge)", () => {
    expect(shouldFlashCraftCompleteWorldReinforce(false)).toBe(false);

    expect(CRAFT_COMPLETE_WORLD_REINFORCE.outerRgba).not.toBe(
      INVENTORY_PICKUP_SLOT_FLASH.borderRgba,
    );
    expect(CRAFT_COMPLETE_WORLD_REINFORCE.midRgba).not.toBe(
      INVENTORY_PICKUP_SLOT_FLASH.backgroundRgba,
    );
    expect(CRAFT_COMPLETE_WORLD_REINFORCE.outerRgba).not.toBe(
      CROP_PLANT_SUCCESS_WORLD_REINFORCE.outerRgba,
    );
    expect(CRAFT_COMPLETE_WORLD_REINFORCE.midRgba).not.toBe(
      CROP_PLANT_SUCCESS_WORLD_REINFORCE.midRgba,
    );
    expect(CRAFT_COMPLETE_WORLD_REINFORCE.clearPct).toBeLessThan(
      CRAFT_COMPLETE_WORLD_REINFORCE.midPct,
    );
    expect(CRAFT_COMPLETE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent recipes / NFT combat; keeps ok gate (failure)", () => {
    expect(craftCompleteWorldReinforceBackground()).not.toMatch(
      /recipe\s*change|always.?on|nft/i,
    );
    expect(String(CRAFT_COMPLETE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(CRAFT_COMPLETE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashCraftCompleteWorldReinforce(true)).not.toBe(
      shouldFlashCraftCompleteWorldReinforce(false),
    );
  });
});
