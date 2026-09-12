import { describe, expect, it } from "vitest";
import { ENERGY } from "@game/shared";
import {
  EAT_SUCCESS_WORLD_REINFORCE,
  ENERGY_LOW_WORLD_VIGNETTE,
  eatSuccessWorldReinforceBackground,
  shouldFlashEatSuccessWorldReinforce,
} from "../../apps/web/lib/hud/energy-food-feedback";
import {
  EAT_FOOD_SUCCESS_CUE,
  eatFoodSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL124.2 — Eat success soft reinforce.
 * Brief world recovery rim on successful eat (complements eat SFX + Ate cue).
 * Food / energy restore rules unchanged; mute ok.
 * Choice: one-shot warm olive rim (not another Ate toast) so food→energy
 * stays world-readable beside the existing ephemeral + SFX.
 */
describe("CityLands PL124.2 eat success soft world reinforce", () => {
  it("flashes soft recovery rim only on successful eat (happy)", () => {
    expect(shouldFlashEatSuccessWorldReinforce(true)).toBe(true);
    expect(EAT_SUCCESS_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(EAT_SUCCESS_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = eatSuccessWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(EAT_SUCCESS_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — PL20.1 Ate cue.
    expect(eatFoodSuccessCueText()).toBe(EAT_FOOD_SUCCESS_CUE);
    expect(eatFoodSuccessCueText()).toBe("Ate");
  });

  it("stays quiet on refuse / failed eat; rim ≠ low vignette (edge)", () => {
    expect(shouldFlashEatSuccessWorldReinforce(false)).toBe(false);
    expect(EAT_SUCCESS_WORLD_REINFORCE.outerRgba).not.toBe(
      ENERGY_LOW_WORLD_VIGNETTE.outerRgba,
    );
    expect(EAT_SUCCESS_WORLD_REINFORCE.clearPct).toBeLessThan(
      EAT_SUCCESS_WORLD_REINFORCE.midPct,
    );
    expect(EAT_SUCCESS_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent restore amounts; keeps food SoT (failure)", () => {
    expect(ENERGY.breadRestore).toBe(25);
    expect(ENERGY.cookedMeatRestore).toBe(40);
    expect(eatSuccessWorldReinforceBackground()).not.toMatch(/\d+\s*energy/i);
    expect(String(EAT_SUCCESS_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(EAT_SUCCESS_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashEatSuccessWorldReinforce(true)).not.toBe(
      shouldFlashEatSuccessWorldReinforce(false),
    );
  });
});
