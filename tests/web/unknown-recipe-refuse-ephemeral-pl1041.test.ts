import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  NEEDS_STATION_REFUSE_CUE,
  UNKNOWN_RECIPE_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashNeedsStationRefuseCue,
  shouldFlashUnknownRecipeRefuseCue,
  unknownRecipeRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL104.1 — Unknown-recipe refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Recipe` instead of sticky long craft prose.
 * Recipe catalog unchanged; mute ok.
 */
describe("CityLands PL104.1 unknown-recipe refuse ephemeral", () => {
  it("flashes Recipe for unknownRecipe (happy)", () => {
    expect(unknownRecipeRefuseCueText()).toBe(UNKNOWN_RECIPE_REFUSE_CUE);
    expect(unknownRecipeRefuseCueText()).toBe("Recipe");
    expect(
      shouldFlashUnknownRecipeRefuseCue(ACTION_ERROR.unknownRecipe),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.unknownRecipe)).toBe(true);
    expect(isCoreSuccessCueText("Recipe")).toBe(true);
    expect(ACTION_ERROR.unknownRecipe.toLowerCase()).toMatch(/recipe/);
  });

  it("stays quiet for needs-station refuse (edge)", () => {
    expect(
      shouldFlashUnknownRecipeRefuseCue(ACTION_ERROR.needsStation("Kitchen")),
    ).toBe(false);
    expect(unknownRecipeRefuseCueText()).not.toBe(NEEDS_STATION_REFUSE_CUE);
    expect(
      shouldFlashNeedsStationRefuseCue(ACTION_ERROR.unknownRecipe),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent recipe rules (failure)", () => {
    expect(shouldFlashUnknownRecipeRefuseCue(null)).toBe(false);
    expect(shouldFlashUnknownRecipeRefuseCue(undefined)).toBe(false);
    expect(shouldFlashUnknownRecipeRefuseCue("")).toBe(false);
    expect(
      shouldFlashUnknownRecipeRefuseCue(ACTION_ERROR.missingMaterials),
    ).toBe(false);
    expect(unknownRecipeRefuseCueText()).not.toMatch(/\d/);
    expect(unknownRecipeRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.unknownRecipe.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.unknownRecipe)).toBe(false);
    expect(unknownRecipeRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
