import { describe, expect, it } from "vitest";
import {
  EMPTY_LAND_BUILD_FIRST_WALKUP_WORLD_TIP,
  emptyLandBuildBeaconMode,
  emptyLandBuildBoardTip,
  emptyLandBuildFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_EMPTY_LAND_BUILD_BOARD_CUE,
  firstEmptyLandBuildBoardCueText,
  isCoreSuccessCueText,
  shouldFlashFirstEmptyLandBuildBoardCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL52.1 — First empty-land build-board tip once.
 * One-shot ephemeral TopBar + soft world tip on first empty-yard build board
 * proximity; complements PL3.1 beacon; place costs unchanged; min HUD.
 */
describe("CityLands PL52.1 first empty-land build-board tip once", () => {
  it("flashes Land · build board on first empty-yard proximity (happy)", () => {
    expect(firstEmptyLandBuildBoardCueText()).toBe(
      FIRST_EMPTY_LAND_BUILD_BOARD_CUE,
    );
    expect(firstEmptyLandBuildBoardCueText()).toBe("Land · build board");
    expect(firstEmptyLandBuildBoardCueText().toLowerCase()).toMatch(
      /land|build/,
    );
    expect(isCoreSuccessCueText("Land · build board")).toBe(true);
    expect(emptyLandBuildFirstWalkUpWorldTip()).toBe(
      EMPTY_LAND_BUILD_FIRST_WALKUP_WORLD_TIP,
    );
    expect(emptyLandBuildFirstWalkUpWorldTip()).toMatch(/Build/);
    expect(emptyLandBuildFirstWalkUpWorldTip()).toMatch(/\bE\b/);
    expect(
      emptyLandBuildBeaconMode([{ type: "build_board" }, { type: "portal" }]),
    ).toBe("beacon");

    expect(
      shouldFlashFirstEmptyLandBuildBoardCue(true, true, false, true),
    ).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when lived yard, already seen, or tips off (edge)", () => {
    expect(
      shouldFlashFirstEmptyLandBuildBoardCue(true, true, true, true),
    ).toBe(false);
    expect(
      shouldFlashFirstEmptyLandBuildBoardCue(false, true, false, true),
    ).toBe(false);
    expect(
      shouldFlashFirstEmptyLandBuildBoardCue(true, false, false, true),
    ).toBe(false);
    expect(
      shouldFlashFirstEmptyLandBuildBoardCue(true, true, false, false),
    ).toBe(false);
    expect(
      emptyLandBuildBeaconMode([
        { type: "build_board" },
        { type: "crop_plot" },
      ]),
    ).toBe("soft");
    // Distinct from longer CL16.1 sticky onboarding tip
    expect(firstEmptyLandBuildBoardCueText()).not.toBe(emptyLandBuildBoardTip());
    expect(firstEmptyLandBuildBoardCueText().length).toBeLessThan(
      emptyLandBuildBoardTip().length,
    );
  });

  it("keeps build panel closed by default and place costs / min HUD unchanged (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("build");
    expect(firstEmptyLandBuildBoardCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(emptyLandBuildFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(
      isCoreSuccessCueText("Land · build board · sticky forever"),
    ).toBe(false);
    expect(
      shouldFlashFirstEmptyLandBuildBoardCue(true, true, false, true),
    ).toBe(true);
    expect(
      shouldFlashFirstEmptyLandBuildBoardCue(true, true, true, true),
    ).toBe(false);
  });
});
