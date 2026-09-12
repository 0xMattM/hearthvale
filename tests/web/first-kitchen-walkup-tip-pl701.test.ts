import { describe, expect, it } from "vitest";
import {
  KITCHEN_FIRST_WALKUP_WORLD_TIP,
  PLAYER_LAND_STATIONS,
  getRecipe,
  kitchenFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_KITCHEN_WALKUP_CUE,
  firstKitchenWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstKitchenWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL70.1 — First kitchen walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near kitchen;
 * craft recipes unchanged; min HUD.
 */
describe("CityLands PL70.1 first kitchen walk-up tip once", () => {
  it("flashes Kitchen · cook food on first kitchen proximity (happy)", () => {
    expect(firstKitchenWalkUpCueText()).toBe(FIRST_KITCHEN_WALKUP_CUE);
    expect(firstKitchenWalkUpCueText()).toBe("Kitchen · cook food");
    expect(firstKitchenWalkUpCueText().toLowerCase()).toMatch(/cook/);
    expect(isCoreSuccessCueText("Kitchen · cook food")).toBe(true);
    expect(kitchenFirstWalkUpWorldTip()).toBe(KITCHEN_FIRST_WALKUP_WORLD_TIP);
    expect(kitchenFirstWalkUpWorldTip()).toMatch(/Cook/);
    expect(kitchenFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstKitchenWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstKitchenWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstKitchenWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstKitchenWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstKitchenWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps craft recipes and min HUD (failure)", () => {
    const bread = getRecipe("bake_bread");
    expect(bread?.station).toBe("kitchen");
    expect(bread?.inputs).toEqual([{ itemId: "flour", qty: 2 }]);
    expect(bread?.output).toEqual({ itemId: "bread", qty: 1 });
    expect(PLAYER_LAND_STATIONS.kitchen.kitItemId).toBe("kitchen_kit");
    expect(defaultClosedPanelIds()).toContain("craft");
    expect(firstKitchenWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(kitchenFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Kitchen · sticky forever")).toBe(false);
    expect(shouldFlashFirstKitchenWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstKitchenWalkUpCue(true, true, true)).toBe(false);
  });
});
