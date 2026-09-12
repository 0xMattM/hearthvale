import { describe, expect, it } from "vitest";
import {
  PLAYER_LAND_STATIONS,
  WORKSHOP_FIRST_WALKUP_WORLD_TIP,
  getRecipe,
  workshopFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_WORKSHOP_WALKUP_CUE,
  firstWorkshopWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstWorkshopWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL74.2 — First workshop walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near workshop;
 * craft recipes unchanged; min HUD.
 */
describe("CityLands PL74.2 first workshop walk-up tip once", () => {
  it("flashes Workshop · saw planks on first workshop proximity (happy)", () => {
    expect(firstWorkshopWalkUpCueText()).toBe(FIRST_WORKSHOP_WALKUP_CUE);
    expect(firstWorkshopWalkUpCueText()).toBe("Workshop · saw planks");
    expect(firstWorkshopWalkUpCueText().toLowerCase()).toMatch(/saw/);
    expect(isCoreSuccessCueText("Workshop · saw planks")).toBe(true);
    expect(workshopFirstWalkUpWorldTip()).toBe(WORKSHOP_FIRST_WALKUP_WORLD_TIP);
    expect(workshopFirstWalkUpWorldTip()).toMatch(/Saw/);
    expect(workshopFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstWorkshopWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstWorkshopWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstWorkshopWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstWorkshopWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstWorkshopWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps craft recipes and min HUD (failure)", () => {
    const planks = getRecipe("saw_planks");
    expect(planks?.station).toBe("workshop");
    expect(planks?.inputs).toEqual([{ itemId: "wood", qty: 2 }]);
    expect(planks?.output).toEqual({ itemId: "plank", qty: 1 });
    expect(PLAYER_LAND_STATIONS.workshop.kitItemId).toBe("workshop_kit");
    expect(defaultClosedPanelIds()).toContain("craft");
    expect(firstWorkshopWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(workshopFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Workshop · sticky forever")).toBe(false);
    expect(shouldFlashFirstWorkshopWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstWorkshopWalkUpCue(true, true, true)).toBe(false);
  });
});
