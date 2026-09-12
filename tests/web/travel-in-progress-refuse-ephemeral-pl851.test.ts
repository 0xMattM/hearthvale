import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRAVEL_ALREADY_HERE_CUE,
  TRAVEL_IN_PROGRESS_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashTravelAlreadyHereCue,
  shouldFlashTravelInProgressRefuseCue,
  travelInProgressRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL85.1 — Travel-in-progress refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Road` instead of sticky long caravan prose.
 * Caravan timing / costs unchanged; mute ok.
 */
describe("CityLands PL85.1 travel-in-progress refuse ephemeral", () => {
  it("flashes Road for travelInProgress template (happy)", () => {
    const err = ACTION_ERROR.travelInProgress(42);
    expect(travelInProgressRefuseCueText()).toBe(TRAVEL_IN_PROGRESS_REFUSE_CUE);
    expect(travelInProgressRefuseCueText()).toBe("Road");
    expect(shouldFlashTravelInProgressRefuseCue(err)).toBe(true);
    expect(isSoftRefuseError(err)).toBe(true);
    expect(isCoreSuccessCueText("Road")).toBe(true);
    expect(err.toLowerCase()).toMatch(/caravan|road/);
  });

  it("stays quiet for unrelated already-here travel refuse (edge)", () => {
    expect(
      shouldFlashTravelInProgressRefuseCue(ACTION_ERROR.travelAlreadyHere),
    ).toBe(false);
    expect(travelInProgressRefuseCueText()).not.toBe(TRAVEL_ALREADY_HERE_CUE);
    expect(
      shouldFlashTravelAlreadyHereCue(ACTION_ERROR.travelInProgress(5)),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent travel rules (failure)", () => {
    expect(shouldFlashTravelInProgressRefuseCue(null)).toBe(false);
    expect(shouldFlashTravelInProgressRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTravelInProgressRefuseCue("")).toBe(false);
    expect(
      shouldFlashTravelInProgressRefuseCue("Your caravan is still on the road"),
    ).toBe(false);
    expect(travelInProgressRefuseCueText()).not.toMatch(/\d/);
    expect(travelInProgressRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.travelInProgress(99).length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.travelInProgress(12))).toBe(false);
    expect(travelInProgressRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
