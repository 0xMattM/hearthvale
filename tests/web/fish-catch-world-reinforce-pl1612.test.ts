import { describe, expect, it } from "vitest";

import {
  FISH_CATCH_WORLD_REINFORCE,
  fishCatchWorldReinforceBackground,
  shouldFlashFishCatchWorldReinforce,
} from "../../apps/web/lib/hud/fish-catch-feedback";
import { GATHER_SUCCESS_WORLD_REINFORCE } from "../../apps/web/lib/hud/gather-success-feedback";
import { FISH_CATCH_SPLASH_FLASH } from "@game/shared";

/**
 * PL161.2 — Fish-catch soft world reinforce leftover.
 * Brief soft rim after fish catch ok (complements Caught + cool splash PL132.1 +
 * ready shimmer PL118.2). Catch rates unchanged; mute ok; fail silent.
 * Choice: one-shot cool water rim (not another Caught toast / splash-only) so
 * catch stays world-readable beside dock splash + ready shimmer.
 */
describe("CityLands PL161.2 fish-catch soft world reinforce", () => {
  it("flashes quiet cool water rim when fish catch succeeds (happy)", () => {
    expect(shouldFlashFishCatchWorldReinforce(true, "fishing_dock")).toBe(true);
    expect(FISH_CATCH_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(FISH_CATCH_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = fishCatchWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(FISH_CATCH_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — cool dock splash.
    expect(FISH_CATCH_SPLASH_FLASH.durationMs).toBeGreaterThan(0);
    expect(FISH_CATCH_SPLASH_FLASH.padColor).toMatch(/^#/);
  });

  it("stays quiet on fail / non-dock; rim ≠ mint gather (edge)", () => {
    expect(shouldFlashFishCatchWorldReinforce(false, "fishing_dock")).toBe(
      false,
    );
    expect(shouldFlashFishCatchWorldReinforce(true, "tree_stump")).toBe(false);
    expect(shouldFlashFishCatchWorldReinforce(true, "ore_node")).toBe(false);
    expect(shouldFlashFishCatchWorldReinforce(true, "animal_pen")).toBe(false);

    expect(FISH_CATCH_WORLD_REINFORCE.outerRgba).not.toBe(
      GATHER_SUCCESS_WORLD_REINFORCE.outerRgba,
    );
    expect(FISH_CATCH_WORLD_REINFORCE.midRgba).not.toBe(
      GATHER_SUCCESS_WORLD_REINFORCE.midRgba,
    );
    expect(FISH_CATCH_WORLD_REINFORCE.clearPct).toBeLessThan(
      FISH_CATCH_WORLD_REINFORCE.midPct,
    );
    expect(FISH_CATCH_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent catch rates / NFT combat; keeps ok + dock gate (failure)", () => {
    expect(fishCatchWorldReinforceBackground()).not.toMatch(
      /catch\s*rate|always.?on|nft/i,
    );
    expect(String(FISH_CATCH_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(FISH_CATCH_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashFishCatchWorldReinforce(true, "fishing_dock")).not.toBe(
      shouldFlashFishCatchWorldReinforce(false, "fishing_dock"),
    );
  });
});
