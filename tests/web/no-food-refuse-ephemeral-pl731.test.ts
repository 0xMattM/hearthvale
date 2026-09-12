import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  ENERGY_REFUSE_CUE,
  isCoreSuccessCueText,
  NO_BREAD_REFUSE_CUE,
  NO_FOOD_REFUSE_CUE,
  noFoodRefuseCueText,
  shouldFlashNoBreadRefuseCue,
  shouldFlashNoFoodRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL73.1 — No-food eat refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Food` instead of sticky long no-food prose.
 * Eat / energy numbers unchanged; mute ok.
 */
describe("CityLands PL73.1 no-food refuse ephemeral", () => {
  it("flashes Food for noFood (happy)", () => {
    expect(noFoodRefuseCueText()).toBe(NO_FOOD_REFUSE_CUE);
    expect(noFoodRefuseCueText()).toBe("Food");
    expect(shouldFlashNoFoodRefuseCue(ACTION_ERROR.noFood)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.noFood)).toBe(true);
    expect(isCoreSuccessCueText("Food")).toBe(true);
    expect(ACTION_ERROR.noFood.toLowerCase()).toMatch(/edible|food|nothing/);
  });

  it("stays quiet for bread / energy soft refuses (edge)", () => {
    expect(shouldFlashNoFoodRefuseCue(ACTION_ERROR.noBread)).toBe(false);
    expect(shouldFlashNoFoodRefuseCue(ACTION_ERROR.notEnoughEnergy)).toBe(
      false,
    );
    expect(shouldFlashNoBreadRefuseCue(ACTION_ERROR.noFood)).toBe(false);
    expect(noFoodRefuseCueText()).not.toBe(NO_BREAD_REFUSE_CUE);
    expect(noFoodRefuseCueText()).not.toBe(ENERGY_REFUSE_CUE);
  });

  it("refuses unrelated errors and does not invent eat rules (failure)", () => {
    expect(shouldFlashNoFoodRefuseCue(null)).toBe(false);
    expect(shouldFlashNoFoodRefuseCue(undefined)).toBe(false);
    expect(shouldFlashNoFoodRefuseCue("")).toBe(false);
    expect(shouldFlashNoFoodRefuseCue(ACTION_ERROR.missingSeed)).toBe(false);
    expect(noFoodRefuseCueText()).not.toMatch(/\d/);
    expect(noFoodRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.noFood.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.noFood)).toBe(false);
    expect(noFoodRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
