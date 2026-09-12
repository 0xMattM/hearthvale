import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  BUILD_BOARD_MISSING_REFUSE_CUE,
  buildBoardMissingRefuseCueText,
  COINS_REFUSE_CUE,
  isCoreSuccessCueText,
  MATERIALS_REFUSE_CUE,
  shouldFlashBuildBoardMissingRefuseCue,
  shouldFlashCoinsRefuseCue,
  shouldFlashMaterialsRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL71.2 — Build-board-missing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Board` instead of sticky long walk-up-to-board prose.
 * Place rules unchanged; mute ok.
 */
describe("CityLands PL71.2 build-board-missing refuse ephemeral", () => {
  it("flashes Board for buildBoardMissing (happy)", () => {
    expect(buildBoardMissingRefuseCueText()).toBe(
      BUILD_BOARD_MISSING_REFUSE_CUE,
    );
    expect(buildBoardMissingRefuseCueText()).toBe("Board");
    expect(
      shouldFlashBuildBoardMissingRefuseCue(ACTION_ERROR.buildBoardMissing),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.buildBoardMissing)).toBe(true);
    expect(isCoreSuccessCueText("Board")).toBe(true);
    expect(ACTION_ERROR.buildBoardMissing.toLowerCase()).toMatch(/build board/);
  });

  it("stays quiet for place cost / materials soft refuses (edge)", () => {
    expect(
      shouldFlashBuildBoardMissingRefuseCue(ACTION_ERROR.notEnoughCoins),
    ).toBe(false);
    expect(
      shouldFlashBuildBoardMissingRefuseCue(ACTION_ERROR.missingMaterials),
    ).toBe(false);
    expect(
      shouldFlashBuildBoardMissingRefuseCue(ACTION_ERROR.buildCellOccupied),
    ).toBe(false);
    expect(
      shouldFlashCoinsRefuseCue(ACTION_ERROR.buildBoardMissing),
    ).toBe(false);
    expect(
      shouldFlashMaterialsRefuseCue(ACTION_ERROR.buildBoardMissing),
    ).toBe(false);
    expect(buildBoardMissingRefuseCueText()).not.toBe(COINS_REFUSE_CUE);
    expect(buildBoardMissingRefuseCueText()).not.toBe(MATERIALS_REFUSE_CUE);
  });

  it("refuses unrelated errors and does not invent place rules (failure)", () => {
    expect(shouldFlashBuildBoardMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashBuildBoardMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashBuildBoardMissingRefuseCue("")).toBe(false);
    expect(
      shouldFlashBuildBoardMissingRefuseCue(ACTION_ERROR.unknownStation),
    ).toBe(false);
    expect(buildBoardMissingRefuseCueText()).not.toMatch(/\d/);
    expect(buildBoardMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.buildBoardMissing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.buildBoardMissing)).toBe(false);
    expect(buildBoardMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
