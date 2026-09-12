import { describe, expect, it } from "vitest";
import { ACTION_ERROR, HOUSING_DECOR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  BUILD_CELL_OCCUPIED_REFUSE_CUE,
  DECOR_ALREADY_PLACED_REFUSE_CUE,
  PLOT_OCCUPIED_REFUSE_CUE,
  decorAlreadyPlacedRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashBuildCellOccupiedRefuseCue,
  shouldFlashDecorAlreadyPlacedRefuseCue,
  shouldFlashPlotOccupiedRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL75.2 — Decor-already-placed refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Taken` instead of sticky long occupied-pad prose.
 * Decor place rules unchanged; mute ok.
 */
describe("CityLands PL75.2 decor-already-placed refuse ephemeral", () => {
  it("flashes Taken for decorAlreadyPlaced (happy)", () => {
    expect(decorAlreadyPlacedRefuseCueText()).toBe(
      DECOR_ALREADY_PLACED_REFUSE_CUE,
    );
    expect(decorAlreadyPlacedRefuseCueText()).toBe("Taken");
    expect(
      shouldFlashDecorAlreadyPlacedRefuseCue(ACTION_ERROR.decorAlreadyPlaced),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.decorAlreadyPlaced)).toBe(true);
    expect(isCoreSuccessCueText("Taken")).toBe(true);
    expect(ACTION_ERROR.decorAlreadyPlaced.toLowerCase()).toMatch(
      /already|decor/,
    );
  });

  it("stays quiet for build-cell / plot-occupied soft refuses (edge)", () => {
    expect(
      shouldFlashDecorAlreadyPlacedRefuseCue(ACTION_ERROR.buildCellOccupied),
    ).toBe(false);
    expect(
      shouldFlashDecorAlreadyPlacedRefuseCue(ACTION_ERROR.plotNotEmpty),
    ).toBe(false);
    expect(
      shouldFlashBuildCellOccupiedRefuseCue(ACTION_ERROR.decorAlreadyPlaced),
    ).toBe(false);
    expect(
      shouldFlashPlotOccupiedRefuseCue(ACTION_ERROR.decorAlreadyPlaced),
    ).toBe(false);
    expect(decorAlreadyPlacedRefuseCueText()).not.toBe(
      BUILD_CELL_OCCUPIED_REFUSE_CUE,
    );
    expect(decorAlreadyPlacedRefuseCueText()).not.toBe(PLOT_OCCUPIED_REFUSE_CUE);
  });

  it("refuses unrelated errors and does not invent place costs (failure)", () => {
    expect(shouldFlashDecorAlreadyPlacedRefuseCue(null)).toBe(false);
    expect(shouldFlashDecorAlreadyPlacedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashDecorAlreadyPlacedRefuseCue("")).toBe(false);
    expect(
      shouldFlashDecorAlreadyPlacedRefuseCue(ACTION_ERROR.unknownStation),
    ).toBe(false);
    expect(decorAlreadyPlacedRefuseCueText()).not.toMatch(/\d/);
    expect(decorAlreadyPlacedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.decorAlreadyPlaced.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.decorAlreadyPlaced)).toBe(false);
    expect(HOUSING_DECOR.planter.coinCost).toBe(12);
    expect(HOUSING_DECOR.banner.coinCost).toBe(18);
    expect(decorAlreadyPlacedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
