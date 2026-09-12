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
  needsStationRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL104.2 — Needs-station refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Station` instead of sticky long craft prose.
 * Station requirements unchanged; mute ok.
 */
describe("CityLands PL104.2 needs-station refuse ephemeral", () => {
  it("flashes Station for needsStation(station) (happy)", () => {
    expect(needsStationRefuseCueText()).toBe(NEEDS_STATION_REFUSE_CUE);
    expect(needsStationRefuseCueText()).toBe("Station");
    expect(
      shouldFlashNeedsStationRefuseCue(ACTION_ERROR.needsStation("Kitchen")),
    ).toBe(true);
    expect(
      shouldFlashNeedsStationRefuseCue(ACTION_ERROR.needsStation("Forge")),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needsStation("Kitchen"))).toBe(true);
    expect(isCoreSuccessCueText("Station")).toBe(true);
    expect(ACTION_ERROR.needsStation("Kitchen").toLowerCase()).toMatch(
      /station|land|craft/,
    );
  });

  it("stays quiet for unknown-recipe / needs-xp refuse (edge)", () => {
    expect(
      shouldFlashNeedsStationRefuseCue(ACTION_ERROR.unknownRecipe),
    ).toBe(false);
    expect(
      shouldFlashNeedsStationRefuseCue(ACTION_ERROR.needsXp("cook", 25)),
    ).toBe(false);
    expect(needsStationRefuseCueText()).not.toBe(UNKNOWN_RECIPE_REFUSE_CUE);
    expect(needsStationRefuseCueText()).not.toBe(NEEDS_XP_REFUSE_CUE);
    expect(
      shouldFlashUnknownRecipeRefuseCue(ACTION_ERROR.needsStation("Kitchen")),
    ).toBe(false);
    expect(
      shouldFlashNeedsXpRefuseCue(ACTION_ERROR.needsStation("Kitchen")),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent station rules (failure)", () => {
    expect(shouldFlashNeedsStationRefuseCue(null)).toBe(false);
    expect(shouldFlashNeedsStationRefuseCue(undefined)).toBe(false);
    expect(shouldFlashNeedsStationRefuseCue("")).toBe(false);
    expect(
      shouldFlashNeedsStationRefuseCue(ACTION_ERROR.missingMaterials),
    ).toBe(false);
    expect(
      shouldFlashNeedsStationRefuseCue("You need a kitchen nearby."),
    ).toBe(false);
    expect(needsStationRefuseCueText()).not.toMatch(/\d/);
    expect(needsStationRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.needsStation("Kitchen").length,
    );
    expect(
      isCoreSuccessCueText(ACTION_ERROR.needsStation("Kitchen")),
    ).toBe(false);
    expect(needsStationRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
