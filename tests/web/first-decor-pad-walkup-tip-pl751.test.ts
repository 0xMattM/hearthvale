import { describe, expect, it } from "vitest";
import {
  DECOR_PAD_FIRST_WALKUP_WORLD_TIP,
  HOUSING_DECOR,
  decorPadFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_DECOR_PAD_WALKUP_CUE,
  firstDecorPadWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstDecorPadWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL75.1 — First decor-pad walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near housing decor pad;
 * decor costs unchanged; min HUD.
 */
describe("CityLands PL75.1 first decor-pad walk-up tip once", () => {
  it("flashes Decor · place yard on first decor-pad proximity (happy)", () => {
    expect(firstDecorPadWalkUpCueText()).toBe(FIRST_DECOR_PAD_WALKUP_CUE);
    expect(firstDecorPadWalkUpCueText()).toBe("Decor · place yard");
    expect(firstDecorPadWalkUpCueText().toLowerCase()).toMatch(/place|decor/);
    expect(isCoreSuccessCueText("Decor · place yard")).toBe(true);
    expect(decorPadFirstWalkUpWorldTip()).toBe(DECOR_PAD_FIRST_WALKUP_WORLD_TIP);
    expect(decorPadFirstWalkUpWorldTip()).toMatch(/Place/);
    expect(decorPadFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstDecorPadWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstDecorPadWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstDecorPadWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstDecorPadWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstDecorPadWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps decor costs and min HUD (failure)", () => {
    expect(HOUSING_DECOR.planter.coinCost).toBe(12);
    expect(HOUSING_DECOR.banner.coinCost).toBe(18);
    expect(HOUSING_DECOR.planter.buildingType).toBe("decor_planter");
    expect(HOUSING_DECOR.banner.buildingType).toBe("decor_banner");
    expect(defaultClosedPanelIds()).toContain("decor");
    expect(firstDecorPadWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(decorPadFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Decor · sticky forever")).toBe(false);
    expect(shouldFlashFirstDecorPadWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstDecorPadWalkUpCue(true, true, true)).toBe(false);
  });
});
