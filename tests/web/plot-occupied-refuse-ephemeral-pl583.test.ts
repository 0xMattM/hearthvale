import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  PLOT_OCCUPIED_REFUSE_CUE,
  isCoreSuccessCueText,
  plotOccupiedRefuseCueText,
  shouldFlashCropNotReadyRefuseCue,
  shouldFlashHammerRefuseCue,
  shouldFlashPlotOccupiedRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL58.3 — Plot-occupied refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Occupied` instead of sticky long plot prose.
 * Plant rules unchanged; mute ok.
 */
describe("CityLands PL58.3 plot-occupied refuse ephemeral", () => {
  it("flashes Occupied for plotNotEmpty (happy)", () => {
    expect(plotOccupiedRefuseCueText()).toBe(PLOT_OCCUPIED_REFUSE_CUE);
    expect(plotOccupiedRefuseCueText()).toBe("Occupied");
    expect(shouldFlashPlotOccupiedRefuseCue(ACTION_ERROR.plotNotEmpty)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.plotNotEmpty)).toBe(true);
    expect(isCoreSuccessCueText("Occupied")).toBe(true);
    expect(ACTION_ERROR.plotNotEmpty.toLowerCase()).toMatch(/crop|field|plot/);
  });

  it("stays quiet for other soft refuses (edge)", () => {
    expect(shouldFlashPlotOccupiedRefuseCue(ACTION_ERROR.cropNotReady)).toBe(
      false,
    );
    expect(shouldFlashPlotOccupiedRefuseCue(ACTION_ERROR.needHammer)).toBe(
      false,
    );
    expect(shouldFlashPlotOccupiedRefuseCue(ACTION_ERROR.stationBusy)).toBe(
      false,
    );
    expect(shouldFlashPlotOccupiedRefuseCue(ACTION_ERROR.missingSeed)).toBe(
      false,
    );
    expect(shouldFlashHammerRefuseCue(ACTION_ERROR.plotNotEmpty)).toBe(false);
    expect(shouldFlashCropNotReadyRefuseCue(ACTION_ERROR.plotNotEmpty)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and keeps plant rules unchanged (failure)", () => {
    expect(shouldFlashPlotOccupiedRefuseCue(null)).toBe(false);
    expect(shouldFlashPlotOccupiedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashPlotOccupiedRefuseCue("")).toBe(false);
    expect(shouldFlashPlotOccupiedRefuseCue(ACTION_ERROR.plotMissing)).toBe(
      false,
    );
    expect(plotOccupiedRefuseCueText()).not.toMatch(/\d/);
    expect(plotOccupiedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.plotNotEmpty.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.plotNotEmpty)).toBe(false);
    expect(plotOccupiedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
