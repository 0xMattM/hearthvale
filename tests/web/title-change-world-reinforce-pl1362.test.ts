import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENT_UNLOCK_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/achievement-unlock-feedback";
import {
  LEVEL_UP_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/level-up-feedback";
import {
  COINS_GAIN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/coins-gain-feedback";
import {
  TITLE_CHANGE_WORLD_REINFORCE,
  shouldFlashTitleChangeWorldReinforce,
  titleChangeWorldReinforceBackground,
} from "../../apps/web/lib/hud/title-change-feedback";
import {
  TITLE_CHANGE_SUCCESS_CUE_PREFIX,
  characterTitleChangeCueText,
  shouldFlashCharacterTitleChangeCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL136.2 — Title-change soft world reinforce.
 * Brief soft title rim when cosmetic title changes (complements Title · PL49.1).
 * Titles cosmetic; mute ok; hydrate quiet.
 * Choice: one-shot ochre rim (not another Title toast) so title stays world-readable.
 */
describe("CityLands PL136.2 title-change soft world reinforce", () => {
  it("flashes soft title rim when cosmetic title changes (happy)", () => {
    expect(
      shouldFlashTitleChangeWorldReinforce("Settler", "Homesteader"),
    ).toBe(true);
    expect(TITLE_CHANGE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(TITLE_CHANGE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = titleChangeWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(TITLE_CHANGE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Title · ephemeral; same gate as PL49.1.
    expect(characterTitleChangeCueText("Homesteader")).toBe(
      `${TITLE_CHANGE_SUCCESS_CUE_PREFIX}Homesteader`,
    );
    expect(shouldFlashCharacterTitleChangeCue("Settler", "Homesteader")).toBe(
      true,
    );
    expect(
      shouldFlashTitleChangeWorldReinforce("Settler", "Homesteader"),
    ).toBe(shouldFlashCharacterTitleChangeCue("Settler", "Homesteader"));
  });

  it("stays quiet on hydrate / flat; rim ≠ level / unlock / coins (edge)", () => {
    expect(shouldFlashTitleChangeWorldReinforce(null, "Settler")).toBe(false);
    expect(shouldFlashTitleChangeWorldReinforce(undefined, "Settler")).toBe(
      false,
    );
    expect(shouldFlashTitleChangeWorldReinforce("Settler", "Settler")).toBe(
      false,
    );
    expect(shouldFlashTitleChangeWorldReinforce("Settler", null)).toBe(false);
    expect(shouldFlashTitleChangeWorldReinforce("", "Settler")).toBe(false);
    expect(shouldFlashTitleChangeWorldReinforce("Settler", "  ")).toBe(false);

    expect(TITLE_CHANGE_WORLD_REINFORCE.outerRgba).not.toBe(
      LEVEL_UP_WORLD_REINFORCE.outerRgba,
    );
    expect(TITLE_CHANGE_WORLD_REINFORCE.outerRgba).not.toBe(
      ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.outerRgba,
    );
    expect(TITLE_CHANGE_WORLD_REINFORCE.outerRgba).not.toBe(
      COINS_GAIN_WORLD_REINFORCE.outerRgba,
    );
    expect(TITLE_CHANGE_WORLD_REINFORCE.clearPct).toBeLessThan(
      TITLE_CHANGE_WORLD_REINFORCE.midPct,
    );
    expect(TITLE_CHANGE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent combat power / HUD columns; keeps title gate (failure)", () => {
    expect(titleChangeWorldReinforceBackground()).not.toMatch(/hud\s*column/i);
    expect(String(TITLE_CHANGE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(TITLE_CHANGE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(
      shouldFlashTitleChangeWorldReinforce("Settler", "Veteran"),
    ).not.toBe(shouldFlashTitleChangeWorldReinforce("Veteran", "Veteran"));
    expect(characterTitleChangeCueText("")).toBeNull();
  });
});
