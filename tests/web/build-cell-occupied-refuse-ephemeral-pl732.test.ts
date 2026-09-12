import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  BUILD_BOARD_MISSING_REFUSE_CUE,
  BUILD_CELL_OCCUPIED_REFUSE_CUE,
  buildCellOccupiedRefuseCueText,
  isCoreSuccessCueText,
  PLOT_OCCUPIED_REFUSE_CUE,
  shouldFlashBuildBoardMissingRefuseCue,
  shouldFlashBuildCellOccupiedRefuseCue,
  shouldFlashPlotOccupiedRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL73.2 — Build-cell-occupied refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Spot` instead of sticky long occupied-cell prose.
 * Place rules unchanged; mute ok.
 */
describe("CityLands PL73.2 build-cell-occupied refuse ephemeral", () => {
  it("flashes Spot for buildCellOccupied (happy)", () => {
    expect(buildCellOccupiedRefuseCueText()).toBe(
      BUILD_CELL_OCCUPIED_REFUSE_CUE,
    );
    expect(buildCellOccupiedRefuseCueText()).toBe("Spot");
    expect(
      shouldFlashBuildCellOccupiedRefuseCue(ACTION_ERROR.buildCellOccupied),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.buildCellOccupied)).toBe(true);
    expect(isCoreSuccessCueText("Spot")).toBe(true);
    expect(ACTION_ERROR.buildCellOccupied.toLowerCase()).toMatch(
      /spot|building/,
    );
  });

  it("stays quiet for board-missing / plot-occupied soft refuses (edge)", () => {
    expect(
      shouldFlashBuildCellOccupiedRefuseCue(ACTION_ERROR.buildBoardMissing),
    ).toBe(false);
    expect(
      shouldFlashBuildCellOccupiedRefuseCue(ACTION_ERROR.plotNotEmpty),
    ).toBe(false);
    expect(
      shouldFlashBuildBoardMissingRefuseCue(ACTION_ERROR.buildCellOccupied),
    ).toBe(false);
    expect(
      shouldFlashPlotOccupiedRefuseCue(ACTION_ERROR.buildCellOccupied),
    ).toBe(false);
    expect(buildCellOccupiedRefuseCueText()).not.toBe(
      BUILD_BOARD_MISSING_REFUSE_CUE,
    );
    expect(buildCellOccupiedRefuseCueText()).not.toBe(PLOT_OCCUPIED_REFUSE_CUE);
  });

  it("refuses unrelated errors and does not invent place rules (failure)", () => {
    expect(shouldFlashBuildCellOccupiedRefuseCue(null)).toBe(false);
    expect(shouldFlashBuildCellOccupiedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashBuildCellOccupiedRefuseCue("")).toBe(false);
    expect(
      shouldFlashBuildCellOccupiedRefuseCue(ACTION_ERROR.unknownStation),
    ).toBe(false);
    expect(buildCellOccupiedRefuseCueText()).not.toMatch(/\d/);
    expect(buildCellOccupiedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.buildCellOccupied.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.buildCellOccupied)).toBe(false);
    expect(buildCellOccupiedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
