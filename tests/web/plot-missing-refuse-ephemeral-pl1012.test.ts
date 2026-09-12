import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GATHER_NODE_MISSING_REFUSE_CUE,
  PLOT_MISSING_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGatherNodeMissingRefuseCue,
  shouldFlashPlotMissingRefuseCue,
  plotMissingRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL101.2 — Plot-missing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` instead of sticky long plot-missing prose.
 * Plot rules unchanged; mute ok.
 */
describe("CityLands PL101.2 plot-missing refuse ephemeral", () => {
  it("flashes Gone for plotMissing (happy)", () => {
    expect(plotMissingRefuseCueText()).toBe(PLOT_MISSING_REFUSE_CUE);
    expect(plotMissingRefuseCueText()).toBe("Gone");
    expect(shouldFlashPlotMissingRefuseCue(ACTION_ERROR.plotMissing)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.plotMissing)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.plotMissing.toLowerCase()).toMatch(/field|land/);
  });

  it("stays quiet for gather-node-missing refuse (edge)", () => {
    expect(
      shouldFlashPlotMissingRefuseCue(ACTION_ERROR.oreNodeMissing),
    ).toBe(false);
    expect(plotMissingRefuseCueText()).toBe(GATHER_NODE_MISSING_REFUSE_CUE);
    expect(
      shouldFlashGatherNodeMissingRefuseCue(ACTION_ERROR.plotMissing),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent plot rules (failure)", () => {
    expect(shouldFlashPlotMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashPlotMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashPlotMissingRefuseCue("")).toBe(false);
    expect(
      shouldFlashPlotMissingRefuseCue(ACTION_ERROR.huntMissing),
    ).toBe(false);
    expect(
      shouldFlashPlotMissingRefuseCue(ACTION_ERROR.claimNodeMissing),
    ).toBe(false);
    expect(plotMissingRefuseCueText()).not.toMatch(/\d/);
    expect(plotMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.plotMissing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.plotMissing)).toBe(false);
    expect(plotMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
