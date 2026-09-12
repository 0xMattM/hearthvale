import { describe, expect, it } from "vitest";
import {
  DECOR_PLACE_WORLD_REINFORCE,
  decorPlaceWorldReinforceBackground,
  shouldFlashDecorPlaceWorldReinforce,
} from "../../apps/web/lib/hud/decor-place-feedback";
import {
  MAIL_SEND_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/mail-send-feedback";
import {
  TITLE_CHANGE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/title-change-feedback";
import {
  DECOR_PLACE_SUCCESS_CUE,
  decorPlaceSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL149.2 — Decor-place soft world reinforce.
 * Brief soft rim after decor place ok (complements decor SFX + Decor placed
 * PL16.2). Costs / slots unchanged; mute ok; fail silent.
 * Choice: one-shot warm rosewood rim (not another Decor placed toast) so
 * place stays world-readable beside the existing SFX + ephemeral.
 */
describe("CityLands PL149.2 decor-place soft world reinforce", () => {
  it("flashes quiet warm rosewood rim when decor place succeeds (happy)", () => {
    expect(shouldFlashDecorPlaceWorldReinforce(true)).toBe(true);
    expect(DECOR_PLACE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(DECOR_PLACE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = decorPlaceWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(DECOR_PLACE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Decor placed ephemeral.
    expect(decorPlaceSuccessCueText()).toBe(DECOR_PLACE_SUCCESS_CUE);
    expect(decorPlaceSuccessCueText()).toBe("Decor placed");
  });

  it("stays quiet on fail; rim ≠ mail parchment / title amber (edge)", () => {
    expect(shouldFlashDecorPlaceWorldReinforce(false)).toBe(false);

    expect(DECOR_PLACE_WORLD_REINFORCE.outerRgba).not.toBe(
      MAIL_SEND_WORLD_REINFORCE.outerRgba,
    );
    expect(DECOR_PLACE_WORLD_REINFORCE.outerRgba).not.toBe(
      TITLE_CHANGE_WORLD_REINFORCE.outerRgba,
    );
    expect(DECOR_PLACE_WORLD_REINFORCE.clearPct).toBeLessThan(
      DECOR_PLACE_WORLD_REINFORCE.midPct,
    );
    expect(DECOR_PLACE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent decor slots / costs; keeps ok gate (failure)", () => {
    expect(decorPlaceWorldReinforceBackground()).not.toMatch(
      /slot\s*invent|cost\s*change|always.?on|nft/i,
    );
    expect(String(DECOR_PLACE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(DECOR_PLACE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashDecorPlaceWorldReinforce(true)).not.toBe(
      shouldFlashDecorPlaceWorldReinforce(false),
    );
  });
});
