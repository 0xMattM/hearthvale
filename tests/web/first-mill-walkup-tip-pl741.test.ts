import { describe, expect, it } from "vitest";
import {
  MILL_FIRST_WALKUP_WORLD_TIP,
  PLAYER_LAND_STATIONS,
  getRecipe,
  millFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_MILL_WALKUP_CUE,
  firstMillWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstMillWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL74.1 — First mill walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near mill;
 * craft recipes unchanged; min HUD.
 */
describe("CityLands PL74.1 first mill walk-up tip once", () => {
  it("flashes Mill · grind flour on first mill proximity (happy)", () => {
    expect(firstMillWalkUpCueText()).toBe(FIRST_MILL_WALKUP_CUE);
    expect(firstMillWalkUpCueText()).toBe("Mill · grind flour");
    expect(firstMillWalkUpCueText().toLowerCase()).toMatch(/grind/);
    expect(isCoreSuccessCueText("Mill · grind flour")).toBe(true);
    expect(millFirstWalkUpWorldTip()).toBe(MILL_FIRST_WALKUP_WORLD_TIP);
    expect(millFirstWalkUpWorldTip()).toMatch(/Grind/);
    expect(millFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstMillWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstMillWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstMillWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstMillWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstMillWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps craft recipes and min HUD (failure)", () => {
    const flour = getRecipe("mill_flour");
    expect(flour?.station).toBe("mill");
    expect(flour?.inputs).toEqual([{ itemId: "wheat", qty: 2 }]);
    expect(flour?.output).toEqual({ itemId: "flour", qty: 1 });
    expect(PLAYER_LAND_STATIONS.mill.kitItemId).toBe("mill_kit");
    expect(defaultClosedPanelIds()).toContain("craft");
    expect(firstMillWalkUpCueText().toLowerCase()).not.toContain("always-on");
    expect(millFirstWalkUpWorldTip().toLowerCase()).not.toContain("always-on");
    expect(isCoreSuccessCueText("Mill · sticky forever")).toBe(false);
    expect(shouldFlashFirstMillWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstMillWalkUpCue(true, true, true)).toBe(false);
  });
});
