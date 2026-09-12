import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  DECOR_PAD_MISSING_REFUSE_CUE,
  DECOR_STARTER_ONLY_REFUSE_CUE,
  UNKNOWN_DECOR_REFUSE_CUE,
  UNKNOWN_RECIPE_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashDecorPadMissingRefuseCue,
  shouldFlashDecorStarterOnlyRefuseCue,
  shouldFlashUnknownDecorRefuseCue,
  shouldFlashUnknownRecipeRefuseCue,
  unknownDecorRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL106.1 — Unknown-decor refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Decor` instead of sticky long housing prose.
 * Decor catalog unchanged; mute ok.
 */
describe("CityLands PL106.1 unknown-decor refuse ephemeral", () => {
  it("flashes Decor for unknownDecor (happy)", () => {
    expect(unknownDecorRefuseCueText()).toBe(UNKNOWN_DECOR_REFUSE_CUE);
    expect(unknownDecorRefuseCueText()).toBe("Decor");
    expect(
      shouldFlashUnknownDecorRefuseCue(ACTION_ERROR.unknownDecor),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.unknownDecor)).toBe(true);
    expect(isCoreSuccessCueText("Decor")).toBe(true);
    expect(ACTION_ERROR.unknownDecor.toLowerCase()).toMatch(/decor/);
  });

  it("stays quiet for pad-missing / starter-only / recipe refuse (edge)", () => {
    expect(
      shouldFlashUnknownDecorRefuseCue(ACTION_ERROR.decorPadMissing),
    ).toBe(false);
    expect(
      shouldFlashUnknownDecorRefuseCue(ACTION_ERROR.decorStarterOnly),
    ).toBe(false);
    expect(
      shouldFlashUnknownDecorRefuseCue(ACTION_ERROR.unknownRecipe),
    ).toBe(false);
    expect(unknownDecorRefuseCueText()).not.toBe(DECOR_PAD_MISSING_REFUSE_CUE);
    expect(unknownDecorRefuseCueText()).not.toBe(
      DECOR_STARTER_ONLY_REFUSE_CUE,
    );
    expect(unknownDecorRefuseCueText()).not.toBe(UNKNOWN_RECIPE_REFUSE_CUE);
    expect(
      shouldFlashDecorPadMissingRefuseCue(ACTION_ERROR.unknownDecor),
    ).toBe(false);
    expect(
      shouldFlashDecorStarterOnlyRefuseCue(ACTION_ERROR.unknownDecor),
    ).toBe(false);
    expect(
      shouldFlashUnknownRecipeRefuseCue(ACTION_ERROR.unknownDecor),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent decor rules (failure)", () => {
    expect(shouldFlashUnknownDecorRefuseCue(null)).toBe(false);
    expect(shouldFlashUnknownDecorRefuseCue(undefined)).toBe(false);
    expect(shouldFlashUnknownDecorRefuseCue("")).toBe(false);
    expect(
      shouldFlashUnknownDecorRefuseCue(ACTION_ERROR.noExpandSlots),
    ).toBe(false);
    expect(unknownDecorRefuseCueText()).not.toMatch(/\d/);
    expect(unknownDecorRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.unknownDecor.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.unknownDecor)).toBe(false);
    expect(unknownDecorRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
