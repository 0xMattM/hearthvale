import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  NEEDS_STATION_REFUSE_CUE,
  NEEDS_XP_REFUSE_CUE,
  UNKNOWN_RECIPE_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashNeedsStationRefuseCue,
  shouldFlashNeedsXpRefuseCue,
  shouldFlashUnknownRecipeRefuseCue,
  needsXpRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL104.3 — Needs-xp refuse ephemeral.
 * Soft refuse SFX + brief TopBar `XP` instead of sticky long craft prose.
 * Profession XP gates unchanged; mute ok.
 */
describe("CityLands PL104.3 needs-xp refuse ephemeral", () => {
  it("flashes XP for needsXp(profession, need) (happy)", () => {
    expect(needsXpRefuseCueText()).toBe(NEEDS_XP_REFUSE_CUE);
    expect(needsXpRefuseCueText()).toBe("XP");
    expect(
      shouldFlashNeedsXpRefuseCue(ACTION_ERROR.needsXp("cook", 25)),
    ).toBe(true);
    expect(
      shouldFlashNeedsXpRefuseCue(ACTION_ERROR.needsXp("smith", 100)),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needsXp("cook", 25))).toBe(true);
    expect(isCoreSuccessCueText("XP")).toBe(true);
    expect(ACTION_ERROR.needsXp("cook", 25).toLowerCase()).toMatch(
      /xp|practicing|specialize/,
    );
  });

  it("stays quiet for unknown-recipe / needs-station refuse (edge)", () => {
    expect(shouldFlashNeedsXpRefuseCue(ACTION_ERROR.unknownRecipe)).toBe(
      false,
    );
    expect(
      shouldFlashNeedsXpRefuseCue(ACTION_ERROR.needsStation("Kitchen")),
    ).toBe(false);
    expect(needsXpRefuseCueText()).not.toBe(UNKNOWN_RECIPE_REFUSE_CUE);
    expect(needsXpRefuseCueText()).not.toBe(NEEDS_STATION_REFUSE_CUE);
    expect(
      shouldFlashUnknownRecipeRefuseCue(ACTION_ERROR.needsXp("cook", 25)),
    ).toBe(false);
    expect(
      shouldFlashNeedsStationRefuseCue(ACTION_ERROR.needsXp("cook", 25)),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent XP rules (failure)", () => {
    expect(shouldFlashNeedsXpRefuseCue(null)).toBe(false);
    expect(shouldFlashNeedsXpRefuseCue(undefined)).toBe(false);
    expect(shouldFlashNeedsXpRefuseCue("")).toBe(false);
    expect(
      shouldFlashNeedsXpRefuseCue(ACTION_ERROR.missingMaterials),
    ).toBe(false);
    expect(
      shouldFlashNeedsXpRefuseCue("You need 25 cook XP before crafting."),
    ).toBe(false);
    expect(needsXpRefuseCueText()).not.toMatch(/\d/);
    expect(needsXpRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.needsXp("cook", 25).length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.needsXp("cook", 25))).toBe(
      false,
    );
    expect(needsXpRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
