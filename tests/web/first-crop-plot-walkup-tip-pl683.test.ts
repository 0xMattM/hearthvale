import { describe, expect, it } from "vitest";
import {
  CROPS,
  CROP_PLOT_FIRST_WALKUP_WORLD_TIP,
  cropPlotFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_CROP_PLOT_WALKUP_CUE,
  firstCropPlotWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstCropPlotWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL68.3 — First crop plot walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near crop plot;
 * plant / harvest rules unchanged; min HUD.
 */
describe("CityLands PL68.3 first crop plot walk-up tip once", () => {
  it("flashes Plot · plant + harvest on first plot proximity (happy)", () => {
    expect(firstCropPlotWalkUpCueText()).toBe(FIRST_CROP_PLOT_WALKUP_CUE);
    expect(firstCropPlotWalkUpCueText()).toBe("Plot · plant + harvest");
    expect(firstCropPlotWalkUpCueText().toLowerCase()).toMatch(
      /plant|harvest/,
    );
    expect(isCoreSuccessCueText("Plot · plant + harvest")).toBe(true);
    expect(cropPlotFirstWalkUpWorldTip()).toBe(
      CROP_PLOT_FIRST_WALKUP_WORLD_TIP,
    );
    expect(cropPlotFirstWalkUpWorldTip()).toMatch(/Plant/);
    expect(cropPlotFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstCropPlotWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstCropPlotWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstCropPlotWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstCropPlotWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstCropPlotWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps grow timers / plant rules and min HUD (failure)", () => {
    expect(CROPS.wheat.growMs).toBe(3 * 60 * 1000);
    expect(CROPS.wheat.seedItemId).toBe("wheat_seed");
    expect(firstCropPlotWalkUpCueText()).not.toBe("Harvested");
    expect(firstCropPlotWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(cropPlotFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Plot · sticky forever")).toBe(false);
    expect(shouldFlashFirstCropPlotWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstCropPlotWalkUpCue(true, true, true)).toBe(false);
  });
});
