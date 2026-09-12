import { describe, expect, it } from "vitest";
import {
  LOOM_FIRST_WALKUP_WORLD_TIP,
  PLAYER_LAND_STATIONS,
  getRecipe,
  loomFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_LOOM_WALKUP_CUE,
  firstLoomWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstLoomWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL77.1 — First loom walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near loom;
 * craft recipes unchanged; min HUD.
 */
describe("CityLands PL77.1 first loom walk-up tip once", () => {
  it("flashes Loom · weave cloth on first loom proximity (happy)", () => {
    expect(firstLoomWalkUpCueText()).toBe(FIRST_LOOM_WALKUP_CUE);
    expect(firstLoomWalkUpCueText()).toBe("Loom · weave cloth");
    expect(firstLoomWalkUpCueText().toLowerCase()).toMatch(/weave/);
    expect(isCoreSuccessCueText("Loom · weave cloth")).toBe(true);
    expect(loomFirstWalkUpWorldTip()).toBe(LOOM_FIRST_WALKUP_WORLD_TIP);
    expect(loomFirstWalkUpWorldTip()).toMatch(/Weave/);
    expect(loomFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstLoomWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstLoomWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstLoomWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstLoomWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstLoomWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps craft recipes and min HUD (failure)", () => {
    const cloth = getRecipe("weave_cloth");
    expect(cloth?.station).toBe("loom");
    expect(cloth?.inputs).toEqual([{ itemId: "leather", qty: 2 }]);
    expect(cloth?.output).toEqual({ itemId: "cloth", qty: 1 });
    expect(PLAYER_LAND_STATIONS.loom.kitItemId).toBe("loom_kit");
    expect(defaultClosedPanelIds()).toContain("craft");
    expect(firstLoomWalkUpCueText().toLowerCase()).not.toContain("always-on");
    expect(loomFirstWalkUpWorldTip().toLowerCase()).not.toContain("always-on");
    expect(isCoreSuccessCueText("Loom · sticky forever")).toBe(false);
    expect(shouldFlashFirstLoomWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstLoomWalkUpCue(true, true, true)).toBe(false);
  });
});
